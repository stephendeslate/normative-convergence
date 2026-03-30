import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipRole } from '@medconnect/shared';
import type {
  CreatePracticeDto,
  UpdatePracticeDto,
  InviteMemberDto,
} from '@medconnect/shared';

/** @description Service managing practice entities, membership, and invitation operations */
@Injectable()
export class PracticesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePracticeDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const practice = await tx.practice.create({ data: dto });

      await tx.tenantMembership.create({
        data: {
          practiceId: practice.id,
          userId,
          role: MembershipRole.OWNER,
        },
      });

      return practice;
    });
  }

  async findById(id: string) {
    const practice = await this.prisma.practice.findUnique({
      where: { id },
    });
    if (!practice) {
      throw new NotFoundException('Practice not found');
    }
    return practice;
  }

  async update(id: string, dto: UpdatePracticeDto) {
    await this.findById(id);
    return this.prisma.practice.update({
      where: { id },
      data: dto,
    });
  }

  async listMembers(practiceId: string) {
    await this.findById(practiceId);
    return this.prisma.tenantMembership.findMany({
      where: { practiceId, isActive: true },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    });
  }

  async inviteMember(practiceId: string, dto: InviteMemberDto, invitedBy: string) {
    await this.findById(practiceId);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const invitation = await this.prisma.invitationToken.create({
      data: {
        practiceId,
        email: dto.email,
        role: dto.role as MembershipRole,
        tokenHash,
        invitedBy,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { ...invitation, token };
  }

  async removeMember(practiceId: string, userId: string) {
    const membership = await this.prisma.tenantMembership.findUnique({
      where: { practiceId_userId: { practiceId, userId } },
    });
    if (!membership) {
      throw new NotFoundException('Member not found');
    }
    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException('Cannot remove practice owner');
    }

    return this.prisma.tenantMembership.update({
      where: { id: membership.id },
      data: { isActive: false },
    });
  }
}
