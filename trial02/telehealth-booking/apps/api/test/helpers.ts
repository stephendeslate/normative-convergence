import { Test, TestingModule } from '@nestjs/testing';

/** Creates a NestJS testing module with common test configuration */
export async function createTestingModule(
  imports: any[] = [],
  providers: any[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers,
  }).compile();
}

/** Creates a mock PrismaService for unit tests */
export function createMockPrisma() {
  return {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    appointment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    service: { findFirst: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  };
}

/** Creates a mock RedisService for unit tests */
export function createMockRedis() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  };
}
