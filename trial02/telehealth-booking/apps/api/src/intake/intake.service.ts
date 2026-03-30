import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateIntakeTemplateDto, SubmitIntakeDto } from '@medconnect/shared';

@Injectable()
export class IntakeService {
  constructor(private prisma: PrismaService) {}

  async createTemplate(practiceId: string, dto: CreateIntakeTemplateDto) {
    return this.prisma.intakeFormTemplate.create({
      data: {
        practiceId,
        name: dto.name,
        fields: dto.fields as any,
      },
    });
  }

  async getTemplates(practiceId: string) {
    return this.prisma.intakeFormTemplate.findMany({
      where: { practiceId, active: true },
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.intakeFormTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Intake template not found');
    return template;
  }

  async submit(dto: SubmitIntakeDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      include: { service: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const templateId = appointment.service.intakeTemplateId;
    if (!templateId) throw new NotFoundException('No intake form for this service');

    return this.prisma.intakeSubmission.create({
      data: {
        appointmentId: dto.appointmentId,
        templateId,
        responses: dto.responses as any,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async getSubmission(appointmentId: string) {
    const submission = await this.prisma.intakeSubmission.findUnique({
      where: { appointmentId },
      include: { template: true },
    });
    if (!submission) throw new NotFoundException('Intake submission not found');
    return submission;
  }
}
