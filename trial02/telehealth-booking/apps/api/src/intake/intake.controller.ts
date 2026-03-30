import { Controller, Get, Post, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createIntakeTemplateSchema, submitIntakeSchema } from '@medconnect/shared';
import { IntakeService } from './intake.service';
import { PracticeMembershipGuard } from '../common/guards/practice-membership.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Intake')
@ApiBearerAuth()
@Controller()
export class IntakeController {
  constructor(private intakeService: IntakeService) {}

  @Post('practices/:practiceId/intake-templates')
  @UseGuards(PracticeMembershipGuard)
  @ApiOperation({ summary: 'Create intake form template' })
  async createTemplate(
    @Param('practiceId', ParseUUIDPipe) practiceId: string,
    @Body(new ZodValidationPipe(createIntakeTemplateSchema)) dto: any,
  ) {
    return this.intakeService.createTemplate(practiceId, dto);
  }

  @Get('practices/:practiceId/intake-templates')
  @UseGuards(PracticeMembershipGuard)
  @ApiOperation({ summary: 'List intake templates' })
  async getTemplates(@Param('practiceId', ParseUUIDPipe) practiceId: string) {
    return this.intakeService.getTemplates(practiceId);
  }

  @Get('intake-templates/:id')
  @ApiOperation({ summary: 'Get intake template' })
  async getTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.intakeService.getTemplate(id);
  }

  @Post('intake-submissions')
  @ApiOperation({ summary: 'Submit intake form' })
  async submit(@Body(new ZodValidationPipe(submitIntakeSchema)) dto: any) {
    return this.intakeService.submit(dto);
  }

  @Get('intake-submissions/:appointmentId')
  @ApiOperation({ summary: 'Get intake submission for appointment' })
  async getSubmission(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.intakeService.getSubmission(appointmentId);
  }
}
