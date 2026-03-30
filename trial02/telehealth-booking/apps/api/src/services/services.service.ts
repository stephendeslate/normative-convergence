import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateServiceDto } from '@medconnect/shared';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(practiceId: string, dto: CreateServiceDto) {
    const { providerIds, ...serviceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: { ...serviceData, practiceId },
      });

      if (providerIds?.length) {
        await tx.serviceProvider.createMany({
          data: providerIds.map((providerId) => ({
            serviceId: service.id,
            providerProfileId: providerId,
          })),
        });
      }

      return tx.service.findUnique({
        where: { id: service.id },
        include: { serviceProviders: { include: { providerProfile: true } } },
      });
    });
  }

  async findAll(practiceId: string) {
    return this.prisma.service.findMany({
      where: { practiceId, active: true },
      include: {
        serviceProviders: {
          include: {
            providerProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        serviceProviders: {
          include: {
            providerProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
        intakeTemplate: true,
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: Partial<CreateServiceDto>) {
    const { providerIds, ...serviceData } = dto;
    return this.prisma.service.update({ where: { id }, data: serviceData });
  }

  async deactivate(id: string) {
    return this.prisma.service.update({ where: { id }, data: { active: false } });
  }
}
