import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getConnections(userId: string) {
    return this.prisma.calendarConnection.findMany({
      where: { userId, active: true },
    });
  }

  async connect(userId: string, provider: string, accessToken: string, refreshToken?: string) {
    return this.prisma.calendarConnection.upsert({
      where: { userId_provider: { userId, provider: provider as any } },
      update: { accessToken, refreshToken, active: true },
      create: {
        userId,
        provider: provider as any,
        accessToken,
        refreshToken,
      },
    });
  }

  async disconnect(userId: string, provider: string) {
    return this.prisma.calendarConnection.update({
      where: { userId_provider: { userId, provider: provider as any } },
      data: { active: false },
    });
  }

  async getEvents(connectionId: string) {
    return this.prisma.calendarEvent.findMany({
      where: { connectionId },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
  }
}
