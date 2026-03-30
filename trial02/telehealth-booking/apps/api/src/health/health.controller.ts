import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check with DB and Redis connectivity' })
  async check() {
    const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

    const CHECK_TIMEOUT = 5_000;

    // Database check (with timeout to avoid hanging on network partition)
    const dbStart = Date.now();
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB check timed out')), CHECK_TIMEOUT)),
      ]);
      checks.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        latencyMs: Date.now() - dbStart,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      // Attempt reconnection to recover from stale connections (e.g. after network partition)
      this.prisma.$disconnect().then(() => this.prisma.$connect()).catch(() => {});
    }

    // Redis check (with timeout)
    const redisStart = Date.now();
    try {
      await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis check timed out')), CHECK_TIMEOUT)),
      ]);
      checks.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
    } catch (error) {
      checks.redis = {
        status: 'unhealthy',
        latencyMs: Date.now() - redisStart,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }
}
