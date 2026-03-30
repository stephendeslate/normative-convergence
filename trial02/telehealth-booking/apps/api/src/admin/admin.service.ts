import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [users, practices, appointments, activeAppointments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.practice.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
      }),
    ]);

    return { users, practices, appointments, activeAppointments };
  }

  async getUsers(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          _count: { select: { memberships: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPractices(page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.practice.findMany({
        include: { _count: { select: { memberships: true, appointments: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.practice.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getAuditLogs(practiceId?: string, page = 1, limit = 50) {
    const where = practiceId ? { practiceId } : {};
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
