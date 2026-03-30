import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createRoom(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (!['CONFIRMED', 'IN_PROGRESS'].includes(appointment.status)) {
      throw new BadRequestException('Appointment must be confirmed or in progress');
    }

    const existing = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (existing) return existing;

    const roomName = `medconnect-${uuidv4()}`;

    return this.prisma.videoRoom.create({
      data: {
        appointmentId,
        roomName,
        status: 'CREATED',
      },
    });
  }

  async getRoom(appointmentId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
      include: { participants: true },
    });
    if (!room) throw new NotFoundException('Video room not found');
    return room;
  }

  async generateToken(appointmentId: string, userId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (!room) throw new NotFoundException('Video room not found');

    const twilioSid = this.configService.get<string>('twilio.accountSid');

    if (!twilioSid || twilioSid === 'AC_placeholder') {
      this.logger.warn('Twilio not configured, returning placeholder token');
      return {
        token: `placeholder-token-${uuidv4()}`,
        roomName: room.roomName,
        identity: userId,
      };
    }

    // In production: use Twilio SDK to generate a real AccessToken
    return {
      token: `twilio-token-${uuidv4()}`,
      roomName: room.roomName,
      identity: userId,
    };
  }

  async joinRoom(appointmentId: string, userId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (!room) throw new NotFoundException('Video room not found');

    await this.prisma.videoParticipant.create({
      data: {
        videoRoomId: room.id,
        userId,
        identity: userId,
      },
    });

    if (room.status === 'CREATED') {
      await this.prisma.videoRoom.update({
        where: { id: room.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });
    }

    return room;
  }

  async endSession(appointmentId: string) {
    const room = await this.prisma.videoRoom.findUnique({
      where: { appointmentId },
    });
    if (!room) throw new NotFoundException('Video room not found');

    const endedAt = new Date();
    const durationSeconds = room.startedAt
      ? Math.round((endedAt.getTime() - room.startedAt.getTime()) / 1000)
      : 0;

    return this.prisma.videoRoom.update({
      where: { id: room.id },
      data: { status: 'COMPLETED', endedAt, durationSeconds },
    });
  }
}
