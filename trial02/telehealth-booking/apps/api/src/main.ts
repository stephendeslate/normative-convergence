import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

/** Determines which NestJS log levels to enable based on LOG_LEVEL env var */
function getLogLevels(): ('error' | 'warn' | 'log' | 'debug' | 'verbose')[] {
  const logLevel = process.env.LOG_LEVEL || 'info';
  switch (logLevel) {
    case 'error': return ['error'];
    case 'warn': return ['error', 'warn'];
    case 'info': return ['error', 'warn', 'log'];
    case 'debug': return ['error', 'warn', 'log', 'debug'];
    case 'verbose': return ['error', 'warn', 'log', 'debug', 'verbose'];
    default: return ['error', 'warn', 'log'];
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(),
  });

  // Graceful shutdown hooks for SIGTERM/SIGINT
  app.enableShutdownHooks();

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
    credentials: true,
  });

  // Global API prefix — health excluded so /health stays at root for probes
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.ALL }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new TimeoutInterceptor(30_000),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedConnect API')
    .setDescription('Telehealth booking platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication and authorization')
    .addTag('appointments', 'Appointment management')
    .addTag('providers', 'Provider profiles and availability')
    .addTag('practices', 'Multi-tenant practice management')
    .addTag('video', 'Telehealth video sessions')
    .addTag('payments', 'Payment processing')
    .addTag('messaging', 'In-app messaging')
    .addTag('admin', 'Platform administration')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
