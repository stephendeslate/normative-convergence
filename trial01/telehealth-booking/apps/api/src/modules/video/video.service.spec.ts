import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { VideoService } from './video.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const mockPrisma = {
  appointment: { findUnique: vi.fn() },
  videoRoom: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  videoParticipant: { create: vi.fn() },
};

const mockConfigService = {
  get: vi.fn().mockReturnValue('test-value'),
};

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  describe('createRoom', () => {
    it('should throw NotFoundException when appointment does not exist', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.createRoom('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for non-confirmed appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        status: 'PENDING',
      });

      await expect(service.createRoom('apt-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return existing room if already created', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        status: 'CONFIRMED',
        practiceId: 'prac-1',
      });
      const existingRoom = { id: 'room-1', appointmentId: 'apt-1' };
      mockPrisma.videoRoom.findUnique.mockResolvedValue(existingRoom);

      const result = await service.createRoom('apt-1');
      expect(result).toEqual(existingRoom);
      expect(mockPrisma.videoRoom.create).not.toHaveBeenCalled();
    });

    it('should create a new video room for confirmed appointment', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        status: 'CONFIRMED',
        practiceId: 'prac-1',
      });
      mockPrisma.videoRoom.findUnique.mockResolvedValue(null);
      mockPrisma.videoRoom.create.mockResolvedValue({
        id: 'room-1',
        appointmentId: 'apt-1',
        status: 'CREATED',
      });

      const result = await service.createRoom('apt-1');
      expect(result.status).toBe('CREATED');
      expect(mockPrisma.videoRoom.create).toHaveBeenCalled();
    });
  });

  describe('getRoom', () => {
    it('should return video room with participants', async () => {
      const room = {
        id: 'room-1',
        appointmentId: 'apt-1',
        participants: [{ id: 'p-1', userId: 'user-1' }],
      };
      mockPrisma.videoRoom.findUnique.mockResolvedValue(room);

      const result = await service.getRoom('apt-1');
      expect(result.participants).toHaveLength(1);
    });

    it('should throw NotFoundException when room does not exist', async () => {
      mockPrisma.videoRoom.findUnique.mockResolvedValue(null);

      await expect(service.getRoom('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('endSession', () => {
    it('should end a video session and set duration', async () => {
      const startedAt = new Date(Date.now() - 30 * 60 * 1000);
      mockPrisma.videoRoom.findUnique.mockResolvedValue({
        id: 'room-1',
        appointmentId: 'apt-1',
        startedAt,
      });
      mockPrisma.videoRoom.update.mockResolvedValue({
        id: 'room-1',
        status: 'COMPLETED',
        actualDurationSeconds: 1800,
      });

      const result = await service.endSession('apt-1');
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when room does not exist', async () => {
      mockPrisma.videoRoom.findUnique.mockResolvedValue(null);

      await expect(service.endSession('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
