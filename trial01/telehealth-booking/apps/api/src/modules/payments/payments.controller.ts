import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { createPaymentIntentSchema, AUDIT_ACTIONS } from '@medconnect/shared';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Post('intent')
  @AuditAction(AUDIT_ACTIONS.PAYMENT_CREATE)
  @UsePipes(new ZodValidationPipe(createPaymentIntentSchema))
  async createPaymentIntent(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.paymentsService.createPaymentIntent(
      body,
      body.practiceId || user.practiceId!,
    );
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody!, signature);
  }

  @ApiBearerAuth()
  @Get(':appointmentId')
  async getByAppointment(@Param('appointmentId') appointmentId: string) {
    return this.paymentsService.getByAppointment(appointmentId);
  }
}
