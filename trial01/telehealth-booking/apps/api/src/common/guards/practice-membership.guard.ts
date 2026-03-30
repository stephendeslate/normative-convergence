import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticeMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const practiceId =
      request.params?.practiceId || request.body?.practiceId;

    if (!practiceId) {
      return true;
    }

    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId: user.sub,
        practiceId,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have access to this practice',
      );
    }

    request.membershipRole = membership.role;
    await this.prisma.$setTenantContext(practiceId);

    return true;
  }
}
