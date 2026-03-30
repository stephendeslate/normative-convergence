import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createServiceSchema } from '@medconnect/shared';
import { ServicesService } from './services.service';
import { PracticeMembershipGuard } from '../common/guards/practice-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('practices/:practiceId/services')
@UseGuards(PracticeMembershipGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  async create(
    @Param('practiceId', ParseUUIDPipe) practiceId: string,
    @Body(new ZodValidationPipe(createServiceSchema)) dto: any,
  ) {
    return this.servicesService.create(practiceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List services' })
  async findAll(@Param('practiceId', ParseUUIDPipe) practiceId: string) {
    return this.servicesService.findAll(practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a service' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.deactivate(id);
  }
}
