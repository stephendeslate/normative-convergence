import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PLATFORM_FEE_PERCENT, PaymentStatus } from '@medconnect/shared';
import type { CreatePaymentIntentDto } from '@medconnect/shared';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey')!, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, practiceId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { practice: true },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const platformFee = Math.round(
      dto.amount * (PLATFORM_FEE_PERCENT / 100) * 100,
    );
    const amountInCents = Math.round(dto.amount * 100);

    const intentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: dto.currency || 'USD',
      metadata: {
        appointmentId: dto.appointmentId,
        practiceId,
      },
    };

    if (appointment.practice.stripeAccountId) {
      intentParams.application_fee_amount = platformFee;
      intentParams.transfer_data = {
        destination: appointment.practice.stripeAccountId,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create(intentParams);

    const record = await this.prisma.paymentRecord.create({
      data: {
        practiceId,
        appointmentId: dto.appointmentId,
        stripePaymentIntentId: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        platformFee: dto.amount * (PLATFORM_FEE_PERCENT / 100),
        status: PaymentStatus.PENDING,
      },
    });

    return {
      ...record,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret')!;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.prisma.paymentRecord.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: PaymentStatus.SUCCEEDED },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.prisma.paymentRecord.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: PaymentStatus.FAILED },
        });
        break;
      }
    }

    return { received: true };
  }

  async getByAppointment(appointmentId: string) {
    const record = await this.prisma.paymentRecord.findUnique({
      where: { appointmentId },
    });
    if (!record) {
      throw new NotFoundException('Payment record not found');
    }
    return record;
  }
}
