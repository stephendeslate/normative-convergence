import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus, PaymentStatus } from '@medconnect/shared';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalPractices,
      totalUsers,
      appointmentsByStatus,
      revenue,
    ] = await Promise.all([
      this.prisma.practice.count(),
      this.prisma.user.count(),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.paymentRecord.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amount: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of appointmentsByStatus) {
      statusCounts[group.status] = group._count.id;
    }

    return {
      totalPractices,
      totalUsers,
      appointments: statusCounts,
      totalRevenue: revenue._sum.amount || 0,
    };
  }

  async listPractices(params: { page: number; limit: number }) {
    const { page, limit } = params;

    const [data, total] = await Promise.all([
      this.prisma.practice.findMany({
        include: { _count: { select: { memberships: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.practice.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAuditLogs(params: {
    page: number;
    limit: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, action, userId, startDate, endDate } = params;

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          practice: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async listUsers(params: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { page, limit, search } = params;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { memberships: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
