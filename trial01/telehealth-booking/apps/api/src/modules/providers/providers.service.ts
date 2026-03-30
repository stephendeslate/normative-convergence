import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateProviderProfileDto,
  UpdateProviderProfileDto,
  TimeSlot,
  AvailabilityResponse,
} from '@medconnect/shared';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(dto: CreateProviderProfileDto, practiceId: string) {
    return this.prisma.providerProfile.create({
      data: {
        practiceId,
        userId: dto.userId,
        specialties: dto.specialties,
        credentials: dto.credentials,
        bio: dto.bio,
        yearsOfExperience: dto.yearsOfExperience,
        education: dto.education,
        languages: dto.languages,
        acceptingNewPatients: dto.acceptingNewPatients,
        consultationTypes: dto.consultationTypes,
      },
    });
  }

  async findById(id: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
        serviceProviders: { include: { service: true } },
        availabilityRules: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider;
  }

  async update(id: string, dto: UpdateProviderProfileDto) {
    await this.findById(id);
    return this.prisma.providerProfile.update({
      where: { id },
      data: dto,
    });
  }

  async list(params: {
    page: number;
    limit: number;
    specialty?: string;
    acceptingNewPatients?: boolean;
  }) {
    const { page, limit, specialty, acceptingNewPatients } = params;
    const where: any = {};

    if (specialty) {
      where.specialties = { has: specialty };
    }
    if (acceptingNewPatients !== undefined) {
      where.acceptingNewPatients = acceptingNewPatients;
    }

    const [data, total] = await Promise.all([
      this.prisma.providerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, avatarUrl: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.providerProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAvailability(
    providerId: string,
    date: string,
    timezone: string,
  ): Promise<AvailabilityResponse> {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const rules = await this.prisma.availabilityRule.findMany({
      where: {
        providerProfileId: providerId,
        dayOfWeek,
        isActive: true,
      },
    });

    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        providerProfileId: providerId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (blockedDates.length > 0) {
      return { providerId, date, timezone, slots: [] };
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        providerProfileId: providerId,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    const slots: TimeSlot[] = [];

    for (const rule of rules) {
      const [startH, startM] = rule.startTime.split(':').map(Number);
      const [endH, endM] = rule.endTime.split(':').map(Number);

      let current = new Date(`${date}T${rule.startTime}:00`);
      const ruleEnd = new Date(`${date}T${rule.endTime}:00`);

      while (current < ruleEnd) {
        const slotEnd = new Date(
          current.getTime() + rule.slotDurationMinutes * 60 * 1000,
        );
        if (slotEnd > ruleEnd) break;

        const overlaps = appointments.some(
          (apt) =>
            new Date(apt.startTime) < slotEnd &&
            new Date(apt.endTime) > current,
        );

        slots.push({
          startTime: current.toISOString(),
          endTime: slotEnd.toISOString(),
          available: !overlaps,
        });

        current = slotEnd;
      }
    }

    return { providerId, date, timezone, slots };
  }
}
