import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const mockPrisma = {
  $queryRaw: vi.fn(),
};

const mockRedis = {
  ping: vi.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return ok status when all services are up', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedis.ping.mockResolvedValue('PONG');

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(result.redis).toBe('up');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return degraded status when database is down', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));
    mockRedis.ping.mockResolvedValue('PONG');

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.database).toBe('down');
    expect(result.redis).toBe('up');
  });

  it('should return degraded status when redis is down', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    mockRedis.ping.mockRejectedValue(new Error('Connection refused'));

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.database).toBe('up');
    expect(result.redis).toBe('down');
  });

  it('should return degraded when both services are down', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('DB down'));
    mockRedis.ping.mockRejectedValue(new Error('Redis down'));

    const result = await controller.check();

    expect(result.status).toBe('degraded');
    expect(result.database).toBe('down');
    expect(result.redis).toBe('down');
  });
});
