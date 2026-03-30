import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateServiceDto, UpdateServiceDto } from '@medconnect/shared';
import type { ConsultationType } from '@medconnect/shared';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceDto, practiceId: string) {
    const { providerIds, ...serviceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: { ...serviceData, practiceId },
      });

      if (providerIds && providerIds.length > 0) {
        await tx.serviceProvider.createMany({
          data: providerIds.map((providerProfileId) => ({
            serviceId: service.id,
            providerProfileId,
          })),
        });
      }

      return tx.service.findUnique({
        where: { id: service.id },
        include: { serviceProviders: { include: { provider: true } } },
      });
    });
  }

  async list(params: {
    page: number;
    limit: number;
    consultationType?: string;
    practiceId?: string;
  }) {
    const { page, limit, consultationType, practiceId } = params;
    const where: any = {};

    if (consultationType) {
      where.consultationType = consultationType;
    }
    if (practiceId) {
      where.practiceId = practiceId;
    }

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: { serviceProviders: { include: { provider: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.service.count({ where }),
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

  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { serviceProviders: { include: { provider: true } } },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);

    const { providerIds, ...serviceData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.update({
        where: { id },
        data: serviceData,
      });

      if (providerIds) {
        await tx.serviceProvider.deleteMany({ where: { serviceId: id } });
        await tx.serviceProvider.createMany({
          data: providerIds.map((providerProfileId) => ({
            serviceId: id,
            providerProfileId,
          })),
        });
      }

      return tx.service.findUnique({
        where: { id },
        include: { serviceProviders: { include: { provider: true } } },
      });
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.service.delete({ where: { id } });
  }
}
