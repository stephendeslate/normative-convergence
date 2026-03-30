import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IntakeStatus } from '@medconnect/shared';
import type { CreateIntakeTemplateDto } from '@medconnect/shared';

@Injectable()
export class IntakeService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(dto: CreateIntakeTemplateDto, practiceId: string) {
    return this.prisma.intakeFormTemplate.create({
      data: {
        practiceId,
        name: dto.name,
        description: dto.description,
        fields: dto.fields as any,
      },
    });
  }

  async listTemplates(practiceId: string) {
    return this.prisma.intakeFormTemplate.findMany({
      where: { practiceId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.intakeFormTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException('Intake template not found');
    }
    return template;
  }

  async submitForm(data: {
    appointmentId: string;
    responses: Record<string, unknown>;
    practiceId: string;
  }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { service: true },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const templateId = appointment.service.intakeFormTemplateId;
    if (!templateId) {
      throw new NotFoundException('No intake template associated with this service');
    }

    return this.prisma.intakeSubmission.create({
      data: {
        practiceId: data.practiceId,
        appointmentId: data.appointmentId,
        templateId,
        responses: data.responses as any,
        status: IntakeStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async getSubmission(appointmentId: string) {
    const submission = await this.prisma.intakeSubmission.findUnique({
      where: { appointmentId },
      include: { template: true },
    });
    if (!submission) {
      throw new NotFoundException('Intake submission not found');
    }
    return submission;
  }
}
