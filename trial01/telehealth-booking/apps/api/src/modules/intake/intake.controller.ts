import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createIntakeTemplateSchema,
  submitIntakeSchema,
  AUDIT_ACTIONS,
} from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { IntakeService } from './intake.service';

@ApiTags('Intake')
@ApiBearerAuth()
@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post('templates')
  @UsePipes(new ZodValidationPipe(createIntakeTemplateSchema))
  async createTemplate(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.intakeService.createTemplate(body, body.practiceId || user.practiceId!);
  }

  @Get('templates')
  async listTemplates(@Query('practiceId') practiceId: string) {
    return this.intakeService.listTemplates(practiceId);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.intakeService.getTemplate(id);
  }

  @Post('submissions')
  @AuditAction(AUDIT_ACTIONS.INTAKE_SUBMIT)
  @UsePipes(new ZodValidationPipe(submitIntakeSchema))
  async submitForm(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.intakeService.submitForm({
      appointmentId: body.appointmentId,
      responses: body.responses,
      practiceId: body.practiceId || user.practiceId!,
    });
  }

  @Get('submissions/:appointmentId')
  async getSubmission(@Param('appointmentId') appointmentId: string) {
    return this.intakeService.getSubmission(appointmentId);
  }
}
