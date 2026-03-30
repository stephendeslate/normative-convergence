import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());

    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const practiceId = request.practiceId || request.params.practiceId;

    return next.handle().pipe(
      tap(async (result) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              action,
              resource: context.getClass().name,
              resourceId: (result as Record<string, unknown>)?.id as string || request.params.id,
              userId: user?.id,
              practiceId,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              details: {
                method: request.method,
                url: request.url,
                body: request.body,
              },
            },
          });
        } catch {
          // Don't fail the request if audit logging fails
        }
      }),
    );
  }
}
