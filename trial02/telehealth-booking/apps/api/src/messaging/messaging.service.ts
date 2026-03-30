import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SendMessageDto } from '@medconnect/shared';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    return this.prisma.message.create({
      data: {
        appointmentId: dto.appointmentId,
        senderId,
        content: dto.content,
        type: (dto.type as any) || 'TEXT',
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getMessages(appointmentId: string, limit = 50, before?: string) {
    return this.prisma.message.findMany({
      where: {
        appointmentId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(appointmentId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: {
        appointmentId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }
}
