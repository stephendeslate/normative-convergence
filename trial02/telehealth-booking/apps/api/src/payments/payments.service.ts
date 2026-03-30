import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PLATFORM_FEE_PERCENT } from '@medconnect/shared';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (secretKey && !secretKey.includes('placeholder')) {
      this.stripe = new Stripe(secretKey);
    }
  }

  verifySignature(rawBody: Buffer | undefined, signature: string): any {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing raw body or signature');
    }
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }
      return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async createPaymentIntent(appointmentId: string, amount: number, currency: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { practice: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT) / 100;

    const stripeKey = this.configService.get<string>('stripe.secretKey');
    let stripePaymentId: string | undefined;

    if (stripeKey && !stripeKey.includes('placeholder')) {
      // In production: use Stripe SDK
      this.logger.log('Creating Stripe payment intent');
    }

    return this.prisma.paymentRecord.create({
      data: {
        appointmentId,
        amount,
        platformFee,
        currency,
        status: 'PENDING',
        stripePaymentId,
      },
    });
  }

  async getPayment(appointmentId: string) {
    const record = await this.prisma.paymentRecord.findUnique({
      where: { appointmentId },
    });
    if (!record) throw new NotFoundException('Payment not found');
    return record;
  }

  async handleWebhook(event: { type: string; data: { object: { id: string; metadata?: { appointmentId?: string } } } }) {
    const paymentIntentId = event.data.object.id;

    if (event.type === 'payment_intent.succeeded') {
      await this.prisma.paymentRecord.updateMany({
        where: { stripePaymentId: paymentIntentId },
        data: { status: 'SUCCEEDED' },
      });
    } else if (event.type === 'payment_intent.payment_failed') {
      await this.prisma.paymentRecord.updateMany({
        where: { stripePaymentId: paymentIntentId },
        data: { status: 'FAILED' },
      });
    }
  }

  async refund(appointmentId: string) {
    return this.prisma.paymentRecord.update({
      where: { appointmentId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });
  }
}
