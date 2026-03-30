import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePracticeDto } from '@medconnect/shared';

@Injectable()
export class PracticesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePracticeDto) {
    const existing = await this.prisma.practice.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Practice slug already exists');

    return this.prisma.$transaction(async (tx) => {
      const practice = await tx.practice.create({ data: dto });

      await tx.tenantMembership.create({
        data: {
          userId,
          practiceId: practice.id,
          role: 'OWNER',
        },
      });

      return practice;
    });
  }

  async findAll(userId: string) {
    return this.prisma.practice.findMany({
      where: {
        memberships: { some: { userId, active: true } },
      },
      include: {
        _count: { select: { memberships: true, appointments: true } },
      },
    });
  }

  async findOne(id: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        _count: { select: { services: true, appointments: true, providerProfiles: true } },
      },
    });
    if (!practice) throw new NotFoundException('Practice not found');
    return practice;
  }

  async findBySlug(slug: string) {
    const practice = await this.prisma.practice.findUnique({ where: { slug } });
    if (!practice) throw new NotFoundException('Practice not found');
    return practice;
  }

  async update(id: string, dto: Partial<CreatePracticeDto>) {
    return this.prisma.practice.update({ where: { id }, data: dto });
  }
}
