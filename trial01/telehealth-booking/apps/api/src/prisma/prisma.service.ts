import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** @description Prisma ORM service with connection retry logic and tenant context support */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private static readonly MAX_RETRY_ATTEMPTS = 5;
  private static readonly BASE_DELAY_MS = 1000;

  async onModuleInit() {
    for (let attempt = 1; attempt <= PrismaService.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connection established');
        return;
      } catch (error) {
        if (attempt === PrismaService.MAX_RETRY_ATTEMPTS) {
          this.logger.error(
            `Failed to connect to database after ${PrismaService.MAX_RETRY_ATTEMPTS} attempts`,
          );
          throw error;
        }
        const delay = PrismaService.BASE_DELAY_MS * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Database connection attempt ${attempt} failed, retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async $setTenantContext(practiceId: string): Promise<void> {
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_practice = $1`,
      practiceId,
    );
  }
}
