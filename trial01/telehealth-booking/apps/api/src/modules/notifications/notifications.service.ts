import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '@medconnect/shared';
import type { NotificationType } from '@medconnect/shared';

@Injectable()
export class NotificationsService {
  private gateway: any;

  constructor(private readonly prisma: PrismaService) {}

  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  async create(
    userId: string,
    practiceId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        practiceId,
        userId,
        type,
        title,
        body,
        data: data as any,
      },
    });

    if (this.gateway) {
      this.gateway.pushNotification(userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        createdAt: notification.createdAt.toISOString(),
      });
    }

    return notification;
  }

  async list(userId: string, params: { page: number; limit: number }) {
    const { page, limit } = params;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
