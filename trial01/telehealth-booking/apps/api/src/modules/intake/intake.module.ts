import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';

@Module({
  controllers: [IntakeController],
  providers: [IntakeService, PrismaService],
  exports: [IntakeService],
})
export class IntakeModule {}
