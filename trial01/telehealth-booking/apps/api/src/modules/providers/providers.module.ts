import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, PrismaService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
