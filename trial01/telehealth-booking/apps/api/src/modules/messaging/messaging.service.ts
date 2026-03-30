import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { SendMessageDto } from '@medconnect/shared';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(dto: SendMessageDto, senderId: string, practiceId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.message.create({
      data: {
        practiceId,
        appointmentId: dto.appointmentId,
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        type: dto.type,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
  }

  async getMessages(
    appointmentId: string,
    params: { page: number; limit: number },
  ) {
    const { page, limit } = params;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { appointmentId },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where: { appointmentId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
