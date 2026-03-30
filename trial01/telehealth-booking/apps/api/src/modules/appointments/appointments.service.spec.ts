import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

const mockPrisma = {
  service: { findUnique: vi.fn() },
  appointment: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  providerProfile: { findFirst: vi.fn() },
};

const mockRedis = {
  exists: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe('create', () => {
    it('should throw NotFoundException when service does not exist', async () => {
      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            serviceId: 'svc-999',
            providerProfileId: 'prov-1',
            startTime: new Date().toISOString(),
            consultationType: 'VIDEO',
          } as any,
          'patient-1',
          'practice-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when slot is already reserved', async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        id: 'svc-1',
        durationMinutes: 30,
      });
      mockRedis.exists.mockResolvedValue(true);

      await expect(
        service.create(
          {
            serviceId: 'svc-1',
            providerProfileId: 'prov-1',
            startTime: new Date().toISOString(),
            consultationType: 'VIDEO',
          } as any,
          'patient-1',
          'practice-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when there is an overlapping appointment', async () => {
      mockPrisma.service.findUnique.mockResolvedValue({
        id: 'svc-1',
        durationMinutes: 30,
      });
      mockRedis.exists.mockResolvedValue(false);
      mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'existing-apt' });

      await expect(
        service.create(
          {
            serviceId: 'svc-1',
            providerProfileId: 'prov-1',
            startTime: new Date().toISOString(),
            consultationType: 'VIDEO',
          } as any,
          'patient-1',
          'practice-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create an appointment successfully', async () => {
      const startTime = new Date();
      mockPrisma.service.findUnique.mockResolvedValue({
        id: 'svc-1',
        durationMinutes: 30,
        confirmationMode: 'AUTO_CONFIRM',
      });
      mockRedis.exists.mockResolvedValue(false);
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.create.mockResolvedValue({
        id: 'apt-1',
        status: 'CONFIRMED',
        startTime,
      });

      const result = await service.create(
        {
          serviceId: 'svc-1',
          providerProfileId: 'prov-1',
          startTime: startTime.toISOString(),
          consultationType: 'VIDEO',
        } as any,
        'patient-1',
        'practice-1',
      );

      expect(result.id).toBe('apt-1');
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return appointment when found', async () => {
      const appointment = { id: 'apt-1', status: 'CONFIRMED' };
      mockPrisma.appointment.findUnique.mockResolvedValue(appointment);

      const result = await service.findById('apt-1');
      expect(result).toEqual(appointment);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('list', () => {
    it('should return paginated appointments for a patient', async () => {
      mockPrisma.appointment.findMany.mockResolvedValue([
        { id: 'apt-1' },
        { id: 'apt-2' },
      ]);
      mockPrisma.appointment.count.mockResolvedValue(2);

      const result = await service.list('user-1', 'PATIENT', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment and clear reservation', async () => {
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1',
        status: 'PENDING',
        providerProfileId: 'prov-1',
        startTime: new Date(),
      });
      mockPrisma.appointment.update.mockResolvedValue({
        id: 'apt-1',
        status: 'CANCELLED',
      });

      const result = await service.cancel('apt-1', 'Changed my mind', 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(mockRedis.del).toHaveBeenCalled();
    });
  });
});
