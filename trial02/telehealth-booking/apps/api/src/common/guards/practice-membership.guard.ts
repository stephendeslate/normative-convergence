import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticeMembershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const practiceId = request.params.practiceId || request.body?.practiceId || request.headers['x-practice-id'];

    if (!practiceId) {
      throw new ForbiddenException('Practice ID is required');
    }

    const membership = await this.prisma.tenantMembership.findUnique({
      where: {
        practiceId_userId: { practiceId, userId: user.id },
      },
    });

    if (!membership || !membership.active) {
      throw new ForbiddenException('You are not a member of this practice');
    }

    request.membership = membership;
    request.practiceId = practiceId;

    return true;
  }
}
