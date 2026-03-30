import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CalendarProvider,
  CalendarConnectionStatus,
  CalendarEventDirection,
} from '@medconnect/shared';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async connect(
    userId: string,
    practiceId: string,
    provider: CalendarProvider,
  ) {
    let authUrl: string;

    if (provider === CalendarProvider.GOOGLE) {
      const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
      const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');
      authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&redirect_uri=${redirectUri}` +
        `&response_type=code&scope=https://www.googleapis.com/auth/calendar` +
        `&state=${userId}:${practiceId}:${provider}&access_type=offline&prompt=consent`;
    } else {
      const clientId = this.config.get<string>('OUTLOOK_CLIENT_ID');
      const redirectUri = this.config.get<string>('OUTLOOK_REDIRECT_URI');
      authUrl =
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&redirect_uri=${redirectUri}` +
        `&response_type=code&scope=Calendars.ReadWrite offline_access` +
        `&state=${userId}:${practiceId}:${provider}`;
    }

    return { authUrl };
  }

  async handleCallback(code: string, state: string) {
    const [userId, practiceId, provider] = state.split(':');

    if (!userId || !practiceId || !provider) {
      throw new BadRequestException('Invalid state parameter');
    }

    const accessToken = `access-token-${code}`;
    const refreshToken = `refresh-token-${code}`;
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    const connection = await this.prisma.calendarConnection.upsert({
      where: {
        userId_practiceId_provider: {
          userId,
          practiceId,
          provider: provider as CalendarProvider,
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt,
        status: CalendarConnectionStatus.ACTIVE,
      },
      create: {
        userId,
        practiceId,
        provider: provider as CalendarProvider,
        accessToken,
        refreshToken,
        expiresAt,
        calendarId: 'primary',
        status: CalendarConnectionStatus.ACTIVE,
      },
    });

    return connection;
  }

  async sync(userId: string, practiceId: string) {
    const connection = await this.prisma.calendarConnection.findFirst({
      where: { userId, practiceId, status: CalendarConnectionStatus.ACTIVE },
    });
    if (!connection) {
      throw new NotFoundException('No active calendar connection found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { practiceId },
      include: { service: true },
      take: 50,
      orderBy: { startTime: 'asc' },
    });

    const events = [];
    for (const apt of appointments) {
      const event = await this.prisma.calendarEvent.upsert({
        where: {
          calendarConnectionId_externalEventId: {
            calendarConnectionId: connection.id,
            externalEventId: `apt-${apt.id}`,
          },
        },
        update: {
          title: apt.service.name,
          startTime: apt.startTime,
          endTime: apt.endTime,
          syncedAt: new Date(),
        },
        create: {
          calendarConnectionId: connection.id,
          externalEventId: `apt-${apt.id}`,
          direction: CalendarEventDirection.OUTBOUND,
          title: apt.service.name,
          startTime: apt.startTime,
          endTime: apt.endTime,
          syncedAt: new Date(),
        },
      });
      events.push(event);
    }

    return { synced: events.length, events };
  }

  async listEvents(userId: string, practiceId: string) {
    const connection = await this.prisma.calendarConnection.findFirst({
      where: { userId, practiceId, status: CalendarConnectionStatus.ACTIVE },
    });
    if (!connection) {
      throw new NotFoundException('No active calendar connection found');
    }

    return this.prisma.calendarEvent.findMany({
      where: { calendarConnectionId: connection.id },
      orderBy: { startTime: 'asc' },
    });
  }

  async disconnect(userId: string, practiceId: string) {
    const connection = await this.prisma.calendarConnection.findFirst({
      where: { userId, practiceId, status: CalendarConnectionStatus.ACTIVE },
    });
    if (!connection) {
      throw new NotFoundException('No active calendar connection found');
    }

    return this.prisma.calendarConnection.update({
      where: { id: connection.id },
      data: { status: CalendarConnectionStatus.DISCONNECTED },
    });
  }
}
