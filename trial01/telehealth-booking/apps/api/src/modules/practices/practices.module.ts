import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PracticesController } from './practices.controller';
import { PracticesService } from './practices.service';

@Module({
  controllers: [PracticesController],
  providers: [PracticesService, PrismaService],
  exports: [PracticesService],
})
export class PracticesModule {}
