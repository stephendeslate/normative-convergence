import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProviderProfileDto, CreateAvailabilityRuleDto, CreateBlockedDateDto } from '@medconnect/shared';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async create(practiceId: string, userId: string, dto: CreateProviderProfileDto) {
    return this.prisma.providerProfile.create({
      data: { ...dto, practiceId, userId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async findAll(practiceId: string) {
    return this.prisma.providerProfile.findMany({
      where: { practiceId, active: true },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        serviceProviders: { include: { service: true } },
        _count: { select: { appointments: true } },
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        serviceProviders: { include: { service: true } },
        availabilityRules: true,
        blockedDates: true,
      },
    });
    if (!profile) throw new NotFoundException('Provider not found');
    return profile;
  }

  async update(id: string, dto: Partial<CreateProviderProfileDto>) {
    return this.prisma.providerProfile.update({ where: { id }, data: dto });
  }

  async getAvailability(providerId: string, date: string) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const rules = await this.prisma.availabilityRule.findMany({
      where: { providerProfileId: providerId, dayOfWeek },
    });

    const blocked = await this.prisma.blockedDate.findFirst({
      where: {
        providerProfileId: providerId,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (blocked) return { date, slots: [] };

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        providerProfileId: providerId,
        startTime: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    const slots: Array<{ startTime: string; endTime: string; available: boolean }> = [];

    for (const rule of rules) {
      const [startH, startM] = rule.startTime.split(':').map(Number);
      const [endH, endM] = rule.endTime.split(':').map(Number);
      const ruleStart = startH * 60 + startM;
      const ruleEnd = endH * 60 + endM;

      for (let time = ruleStart; time + rule.slotDuration <= ruleEnd; time += rule.slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(Math.floor(time / 60), time % 60, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + rule.slotDuration * 60 * 1000);

        const isBooked = existingAppointments.some(
          (apt) => apt.startTime < slotEnd && apt.endTime > slotStart,
        );

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: !isBooked,
        });
      }
    }

    return { date, slots };
  }

  async addAvailabilityRule(providerId: string, dto: CreateAvailabilityRuleDto) {
    return this.prisma.availabilityRule.create({
      data: { ...dto, providerProfileId: providerId },
    });
  }

  async addBlockedDate(providerId: string, dto: CreateBlockedDateDto) {
    return this.prisma.blockedDate.create({
      data: {
        providerProfileId: providerId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
      },
    });
  }
}
