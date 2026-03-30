import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  cancelAppointmentSchema,
  AUDIT_ACTIONS,
} from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AppointmentsService } from './appointments.service';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @AuditAction(AUDIT_ACTIONS.APPOINTMENT_CREATE)
  @UsePipes(new ZodValidationPipe(createAppointmentSchema))
  async create(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.appointmentsService.create(body, user.id, body.practiceId || user.practiceId!);
  }

  @Get()
  async list(
    @CurrentUser() user: { id: string; role: string; membershipRole?: string },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.appointmentsService.list(user.id, user.membershipRole || 'PATIENT', {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Patch(':id/status')
  @AuditAction(AUDIT_ACTIONS.APPOINTMENT_CONFIRM)
  @UsePipes(new ZodValidationPipe(updateAppointmentStatusSchema))
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.updateStatus(id, body.status, body.notes);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @AuditAction(AUDIT_ACTIONS.APPOINTMENT_CANCEL)
  @UsePipes(new ZodValidationPipe(cancelAppointmentSchema))
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.appointmentsService.cancel(id, body.reason, user.id);
  }
}
