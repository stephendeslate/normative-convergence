import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentStatus, VideoRoomStatus, AUDIT_ACTIONS } from '@medconnect/shared';

@Injectable()
export class VideoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createRoom(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const validStatuses = [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS];
    if (!validStatuses.includes(appointment.status as AppointmentStatus)) {
      throw new BadRequestException(
        'Video room can only be created for confirmed or in-progress appointments',
      );
    }

    const existing = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (existing) {
      return existing;
    }

    const roomName = `medconnect-${appointmentId}-${crypto.randomBytes(4).toString('hex')}`;

    return this.prisma.videoRoom.create({
      data: {
        practiceId: appointment.practiceId,
        appointmentId,
        twilioRoomSid: roomName,
        twilioRoomName: roomName,
        status: VideoRoomStatus.CREATED,
        maxParticipants: 2,
      },
    });
  }

  async getRoom(appointmentId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
      include: { participants: true },
    });
    if (!room) {
      throw new NotFoundException('Video room not found');
    }
    return room;
  }

  async generateToken(appointmentId: string, userId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (!room) {
      throw new NotFoundException('Video room not found');
    }

    const participant = await this.prisma.videoParticipant.create({
      data: {
        videoRoomId: room.id,
        userId,
        joinedAt: new Date(),
      },
    });

    const accountSid = this.config.get<string>('twilio.accountSid');
    const apiKey = this.config.get<string>('twilio.apiKey');
    const apiSecret = this.config.get<string>('twilio.apiSecret');

    let token: string;
    try {
      const twilio = await import('twilio');
      const AccessToken = twilio.jwt.AccessToken;
      const VideoGrant = AccessToken.VideoGrant;

      const accessToken = new AccessToken(accountSid!, apiKey!, apiSecret!, {
        identity: userId,
      });

      const videoGrant = new VideoGrant({ room: room.twilioRoomName });
      accessToken.addGrant(videoGrant);
      token = accessToken.toJwt();
    } catch {
      token = `placeholder-token-${room.twilioRoomName}-${userId}`;
    }

    return {
      token,
      roomName: room.twilioRoomName,
      participantId: participant.id,
    };
  }

  async endSession(appointmentId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (!room) {
      throw new NotFoundException('Video room not found');
    }

    const now = new Date();
    const durationSeconds = room.startedAt
      ? Math.floor((now.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    return this.prisma.videoRoom.update({
      where: { id: room.id },
      data: {
        status: VideoRoomStatus.COMPLETED,
        endedAt: now,
        actualDurationSeconds: durationSeconds,
      },
    });
  }
}
