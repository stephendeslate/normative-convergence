import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RATE_LIMITS } from '@medconnect/shared';
import { configuration } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VideoModule } from './video/video.module';
import { PaymentsModule } from './payments/payments.module';
import { CalendarModule } from './calendar/calendar.module';
import { IntakeModule } from './intake/intake.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProvidersModule } from './providers/providers.module';
import { PracticesModule } from './practices/practices.module';
import { ServicesModule } from './services/services.module';
import { AdminModule } from './admin/admin.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: RATE_LIMITS.DEFAULT_TTL * 1000,
        limit: RATE_LIMITS.DEFAULT_LIMIT,
      },
    ]),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    AppointmentsModule,
    VideoModule,
    PaymentsModule,
    CalendarModule,
    IntakeModule,
    MessagingModule,
    NotificationsModule,
    ProvidersModule,
    PracticesModule,
    ServicesModule,
    AdminModule,
    MetricsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
