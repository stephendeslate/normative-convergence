import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: any;
  let redis: any;

  beforeEach(() => {
    prisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    redis = {
      ping: vi.fn().mockResolvedValue('PONG'),
    };
    controller = new HealthController(prisma, redis);
  });

  describe('check', () => {
    it('should return healthy when all services are up', async () => {
      const result = await controller.check();

      expect(result.status).toBe('healthy');
      expect(result.checks.database.status).toBe('healthy');
      expect(result.checks.redis.status).toBe('healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return degraded when database is down', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('unhealthy');
      expect(result.checks.redis.status).toBe('healthy');
    });

    it('should return degraded when redis is down', async () => {
      redis.ping.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.checks.database.status).toBe('healthy');
      expect(result.checks.redis.status).toBe('unhealthy');
    });

    it('should include latency metrics', async () => {
      const result = await controller.check();

      expect(result.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.checks.redis.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });
});
