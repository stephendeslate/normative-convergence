import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  APPOINTMENT_TRANSITIONS,
  AppointmentStatus,
  SLOT_RESERVATION_TTL_MINUTES,
} from '@medconnect/shared';
import type { CreateAppointmentDto, UpdateAppointmentStatusDto, PaginationDto } from '@medconnect/shared';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(practiceId: string, patientId: string, dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, practiceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const endTime = new Date(
      new Date(dto.startTime).getTime() + service.durationMinutes * 60 * 1000,
    );

    // Check slot reservation
    if (dto.reservationToken) {
      const reservationKey = `reservation:${dto.providerProfileId}:${dto.startTime}`;
      const reservedBy = await this.redis.get(reservationKey);
      if (reservedBy && reservedBy !== dto.reservationToken) {
        throw new ConflictException('Slot is reserved by another session');
      }
    }

    const status =
      service.confirmationMode === 'AUTO_CONFIRM'
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.PENDING;

    // Use $transaction for atomic overlap check + create (race-safe)
    const appointment = await this.prisma.$transaction(async (tx) => {
      const overlap = await tx.appointment.findFirst({
        where: {
          providerProfileId: dto.providerProfileId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: new Date(dto.startTime) } },
          ],
        },
      });
      if (overlap) {
        throw new ConflictException('Time slot overlaps with an existing appointment');
      }

      return tx.appointment.create({
        data: {
          practiceId,
          patientId,
          providerProfileId: dto.providerProfileId,
          serviceId: dto.serviceId,
          startTime: new Date(dto.startTime),
          endTime,
          consultationType: dto.consultationType || 'VIDEO',
          notes: dto.notes,
          status,
          confirmedAt: status === AppointmentStatus.CONFIRMED ? new Date() : undefined,
        },
        include: {
          service: true,
          providerProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
          patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
    });

    // Clean up reservation
    if (dto.reservationToken) {
      await this.redis.del(`reservation:${dto.providerProfileId}:${dto.startTime}`);
    }

    return appointment;
  }

  async findAll(practiceId: string, pagination: PaginationDto, filters?: { status?: string; patientId?: string }) {
    const { page, limit, sortOrder } = pagination;
    const where: Record<string, unknown> = { practiceId };
    if (filters?.status) where.status = filters.status;
    if (filters?.patientId) where.patientId = filters.patientId;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: {
          service: true,
          providerProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
          patient: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startTime: sortOrder || 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        providerProfile: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        videoRoom: true,
        intakeSubmission: true,
        paymentRecord: true,
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const currentStatus = appointment.status as AppointmentStatus;
    const newStatus = dto.status as AppointmentStatus;
    const allowedTransitions = APPOINTMENT_TRANSITIONS[currentStatus];

    if (!allowedTransitions?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions?.join(', ') || 'none'}`,
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === AppointmentStatus.CONFIRMED) updateData.confirmedAt = new Date();
    if (newStatus === AppointmentStatus.COMPLETED) updateData.completedAt = new Date();
    if (newStatus === AppointmentStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = dto.cancellationReason;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
        providerProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async reserveSlot(providerProfileId: string, startTime: string): Promise<string> {
    const reservationKey = `reservation:${providerProfileId}:${startTime}`;
    const existing = await this.redis.get(reservationKey);
    if (existing) {
      throw new ConflictException('Slot is already reserved');
    }

    const token = uuidv4();
    await this.redis.set(reservationKey, token, SLOT_RESERVATION_TTL_MINUTES * 60);
    return token;
  }
}
