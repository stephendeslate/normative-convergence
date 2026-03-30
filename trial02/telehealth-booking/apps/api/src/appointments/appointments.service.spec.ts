import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentsService } from './appointments.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: any;
  let redis: any;

  beforeEach(() => {
    prisma = {
      service: { findFirst: vi.fn() },
      appointment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };
    redis = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };
    service = new AppointmentsService(prisma, redis);
  });

  describe('create', () => {
    it('should throw NotFoundException if service not found', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(
        service.create('practice-1', 'patient-1', {
          serviceId: 'svc-1',
          providerProfileId: 'prov-1',
          startTime: new Date().toISOString(),
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on overlapping slot', async () => {
      prisma.service.findFirst.mockResolvedValue({ id: 'svc-1', durationMinutes: 30, practiceId: 'practice-1' });
      prisma.appointment.findFirst.mockResolvedValue({ id: 'existing' });
      redis.get.mockResolvedValue(null);

      await expect(
        service.create('practice-1', 'patient-1', {
          serviceId: 'svc-1',
          providerProfileId: 'prov-1',
          startTime: new Date().toISOString(),
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);
      prisma.appointment.count.mockResolvedValue(0);

      const result = await service.findAll('practice-1', { page: 1, limit: 10, sortOrder: 'desc' });

      expect(result).toEqual({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if appointment missing', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFoundException if appointment missing', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('bad-id', { status: 'CONFIRMED' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        status: 'COMPLETED',
      });

      await expect(
        service.updateStatus('apt-1', { status: 'PENDING' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reserveSlot', () => {
    it('should return a reservation token', async () => {
      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue('OK');

      const token = await service.reserveSlot('prov-1', '2025-01-01T10:00:00Z');

      expect(token).toBeDefined();
      expect(redis.set).toHaveBeenCalled();
    });

    it('should throw ConflictException if slot already reserved', async () => {
      redis.get.mockResolvedValue('existing-token');

      await expect(
        service.reserveSlot('prov-1', '2025-01-01T10:00:00Z'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
