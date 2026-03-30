import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UsePipes,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  paginationSchema,
} from '@medconnect/shared';
import { AppointmentsService } from './appointments.service';
import { CurrentUser, AuditAction } from '../common/decorators';
import { PracticeMembershipGuard } from '../common/guards/practice-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('practices/:practiceId/appointments')
@UseGuards(PracticeMembershipGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @AuditAction('APPOINTMENT_CREATE')
  @ApiOperation({ summary: 'Create a new appointment' })
  async create(
    @Param('practiceId', ParseUUIDPipe) practiceId: string,
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createAppointmentSchema)) dto: any,
  ) {
    return this.appointmentsService.create(practiceId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for a practice' })
  async findAll(
    @Param('practiceId', ParseUUIDPipe) practiceId: string,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: any,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.appointmentsService.findAll(practiceId, pagination, { status, patientId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  @AuditAction('APPOINTMENT_UPDATE')
  @ApiOperation({ summary: 'Update appointment status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateAppointmentStatusSchema)) dto: any,
  ) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @Post('reserve-slot')
  @ApiOperation({ summary: 'Reserve a time slot temporarily' })
  async reserveSlot(
    @Body() dto: { providerProfileId: string; startTime: string },
  ) {
    const token = await this.appointmentsService.reserveSlot(
      dto.providerProfileId,
      dto.startTime,
    );
    return { reservationToken: token };
  }
}
