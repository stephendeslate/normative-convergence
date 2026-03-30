import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const userId = request.user?.sub;
        const practiceId =
          request.params?.practiceId || request.body?.practiceId;
        if (!userId || !practiceId) return;

        this.prisma.auditLog
          .create({
            data: {
              userId,
              practiceId,
              action,
              resource: context.getClass().name,
              resourceId: request.params?.id || '',
              ipAddress: request.ip || request.socket?.remoteAddress,
              userAgent: request.headers['user-agent'] || null,
              details: {
                method: request.method,
                path: request.url,
                params: request.params,
              },
            },
          })
          .catch(() => {
            // Audit logging should not break the request
          });
      }),
    );
  }
}
