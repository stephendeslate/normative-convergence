import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  practice: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  tenantMembership: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  invitationToken: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('PracticesService', () => {
  let service: PracticesService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        PracticesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PracticesService>(PracticesService);
  });

  describe('create', () => {
    it('should create a practice and add owner membership', async () => {
      const practice = { id: 'prac-1', name: 'Test Practice' };
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          practice: { create: vi.fn().mockResolvedValue(practice) },
          tenantMembership: { create: vi.fn().mockResolvedValue({}) },
        });
      });

      const result = await service.create(
        { name: 'Test Practice' } as any,
        'user-1',
      );

      expect(result).toEqual(practice);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a practice when found', async () => {
      const practice = { id: 'prac-1', name: 'Test Practice' };
      mockPrisma.practice.findUnique.mockResolvedValue(practice);

      const result = await service.findById('prac-1');
      expect(result).toEqual(practice);
    });

    it('should throw NotFoundException when practice does not exist', async () => {
      mockPrisma.practice.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the practice', async () => {
      mockPrisma.practice.findUnique.mockResolvedValue({
        id: 'prac-1',
        name: 'Old Name',
      });
      mockPrisma.practice.update.mockResolvedValue({
        id: 'prac-1',
        name: 'New Name',
      });

      const result = await service.update('prac-1', { name: 'New Name' } as any);
      expect(result.name).toBe('New Name');
    });
  });

  describe('removeMember', () => {
    it('should deactivate a non-owner member', async () => {
      mockPrisma.tenantMembership.findUnique.mockResolvedValue({
        id: 'mem-1',
        role: 'ADMIN',
      });
      mockPrisma.tenantMembership.update.mockResolvedValue({
        id: 'mem-1',
        isActive: false,
      });

      const result = await service.removeMember('prac-1', 'user-2');
      expect(result.isActive).toBe(false);
    });

    it('should throw ForbiddenException when removing practice owner', async () => {
      mockPrisma.tenantMembership.findUnique.mockResolvedValue({
        id: 'mem-1',
        role: 'OWNER',
      });

      await expect(
        service.removeMember('prac-1', 'owner-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when member does not exist', async () => {
      mockPrisma.tenantMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.removeMember('prac-1', 'nonexistent-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listMembers', () => {
    it('should return active members for a practice', async () => {
      mockPrisma.practice.findUnique.mockResolvedValue({ id: 'prac-1' });
      mockPrisma.tenantMembership.findMany.mockResolvedValue([
        { id: 'mem-1', userId: 'user-1', role: 'OWNER' },
        { id: 'mem-2', userId: 'user-2', role: 'ADMIN' },
      ]);

      const result = await service.listMembers('prac-1');
      expect(result).toHaveLength(2);
    });
  });
});
