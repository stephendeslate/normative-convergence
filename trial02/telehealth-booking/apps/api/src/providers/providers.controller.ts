import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  createProviderProfileSchema,
  createAvailabilityRuleSchema,
  createBlockedDateSchema,
} from '@medconnect/shared';
import { ProvidersService } from './providers.service';
import { CurrentUser } from '../common/decorators';
import { PracticeMembershipGuard } from '../common/guards/practice-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('practices/:practiceId/providers')
@UseGuards(PracticeMembershipGuard)
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create provider profile' })
  async create(
    @Param('practiceId', ParseUUIDPipe) practiceId: string,
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createProviderProfileSchema)) dto: any,
  ) {
    return this.providersService.create(practiceId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List providers in a practice' })
  async findAll(@Param('practiceId', ParseUUIDPipe) practiceId: string) {
    return this.providersService.findAll(practiceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update provider profile' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.providersService.update(id, dto);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get provider availability for a date' })
  async getAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date: string,
  ) {
    return this.providersService.getAvailability(id, date);
  }

  @Post(':id/availability-rules')
  @ApiOperation({ summary: 'Add availability rule' })
  async addAvailabilityRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createAvailabilityRuleSchema)) dto: any,
  ) {
    return this.providersService.addAvailabilityRule(id, dto);
  }

  @Post(':id/blocked-dates')
  @ApiOperation({ summary: 'Add blocked date' })
  async addBlockedDate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(createBlockedDateSchema)) dto: any,
  ) {
    return this.providersService.addBlockedDate(id, dto);
  }
}
