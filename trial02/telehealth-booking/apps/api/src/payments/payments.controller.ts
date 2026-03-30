import { Controller, Get, Post, Param, Body, Req, RawBodyRequest, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { createPaymentIntentSchema } from '@medconnect/shared';
import { PaymentsService } from './payments.service';
import { Public, AuditAction } from '../common/decorators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @AuditAction('PAYMENT_CREATE')
  @ApiOperation({ summary: 'Create a payment intent' })
  async createPaymentIntent(
    @Body(new ZodValidationPipe(createPaymentIntentSchema)) dto: any,
  ) {
    return this.paymentsService.createPaymentIntent(dto.appointmentId, dto.amount, dto.currency);
  }

  @Get(':appointmentId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment for appointment' })
  async getPayment(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.paymentsService.getPayment(appointmentId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook handler with signature verification' })
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string;
    const event = this.paymentsService.verifySignature(req.rawBody, signature);
    await this.paymentsService.handleWebhook(event as any);
    return { received: true };
  }

  @Post(':appointmentId/refund')
  @ApiBearerAuth()
  @AuditAction('PAYMENT_REFUND')
  @ApiOperation({ summary: 'Refund a payment' })
  async refund(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.paymentsService.refund(appointmentId);
  }
}
