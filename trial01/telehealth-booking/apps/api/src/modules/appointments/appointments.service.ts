import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  APPOINTMENT_TRANSITIONS,
  AppointmentStatus,
  ConfirmationMode,
  SLOT_RESERVATION_TTL_MINUTES,
  AUDIT_ACTIONS,
} from '@medconnect/shared';
import type { CreateAppointmentDto } from '@medconnect/shared';

/** @description Service handling appointment CRUD operations, slot reservation, and status transitions */
@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateAppointmentDto, patientId: string, practiceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60 * 1000,
    );

    const reservationKey = `slot:${dto.providerProfileId}:${startTime.toISOString()}`;
    const reserved = await this.redis.exists(reservationKey);
    if (reserved) {
      throw new ConflictException('Slot is already reserved');
    }

    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        providerProfileId: dto.providerProfileId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (overlapping) {
      throw new ConflictException('Slot is not available');
    }

    await this.redis.set(
      reservationKey,
      patientId,
      SLOT_RESERVATION_TTL_MINUTES * 60,
    );

    const status =
      service.confirmationMode === ConfirmationMode.AUTO_CONFIRM
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.PENDING;

    const appointment = await this.prisma.appointment.create({
      data: {
        practiceId,
        providerProfileId: dto.providerProfileId,
        patientId,
        serviceId: dto.serviceId,
        startTime,
        endTime,
        status,
        consultationType: dto.consultationType,
      },
      include: {
        service: true,
        provider: { include: { user: true } },
      },
    });

    return appointment;
  }

  async list(userId: string, role: string, params: { page: number; limit: number }) {
    const { page, limit } = params;

    const where: any = {};
    if (role === 'PROVIDER') {
      const profile = await this.prisma.providerProfile.findFirst({
        where: { userId },
      });
      if (profile) {
        where.providerProfileId = profile.id;
      }
    } else {
      where.patientId = userId;
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          service: true,
          provider: { include: { user: { select: { id: true, name: true } } } },
          patient: { select: { id: true, name: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        provider: { include: { user: { select: { id: true, name: true } } } },
        patient: { select: { id: true, name: true, email: true } },
        videoRoom: true,
        intakeSubmission: true,
        paymentRecord: true,
      },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async updateStatus(id: string, newStatus: AppointmentStatus, notes?: string) {
    const appointment = await this.findById(id);
    const currentStatus = appointment.status as AppointmentStatus;

    const allowed = APPOINTMENT_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const updateData: any = { status: newStatus };
    if (notes) updateData.notes = notes;
    if (newStatus === AppointmentStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
    });
  }

  async cancel(id: string, reason: string, cancelledBy: string) {
    const appointment = await this.findById(id);
    const currentStatus = appointment.status as AppointmentStatus;

    const allowed = APPOINTMENT_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(AppointmentStatus.CANCELLED)) {
      throw new BadRequestException(
        `Cannot cancel appointment with status ${currentStatus}`,
      );
    }

    const reservationKey = `slot:${appointment.providerProfileId}:${appointment.startTime.toISOString()}`;
    await this.redis.del(reservationKey);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
        cancelledBy,
        cancelledAt: new Date(),
      },
    });
  }
}
