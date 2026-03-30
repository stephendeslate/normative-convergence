import { Controller, Get, Post, Patch, Param, Body, UsePipes, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createPracticeSchema, updatePracticeSchema } from '@medconnect/shared';
import { PracticesService } from './practices.service';
import { CurrentUser, AuditAction } from '../common/decorators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Practices')
@ApiBearerAuth()
@Controller('practices')
export class PracticesController {
  constructor(private practicesService: PracticesService) {}

  @Post()
  @AuditAction('PRACTICE_CREATE')
  @ApiOperation({ summary: 'Create a new practice' })
  async create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createPracticeSchema)) dto: any,
  ) {
    return this.practicesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List practices for the current user' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.practicesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get practice details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.practicesService.findOne(id);
  }

  @Patch(':id')
  @AuditAction('PRACTICE_UPDATE')
  @ApiOperation({ summary: 'Update practice' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePracticeSchema)) dto: any,
  ) {
    return this.practicesService.update(id, dto);
  }
}
