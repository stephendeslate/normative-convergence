import { z } from 'zod';
import {
  AppointmentStatus,
  ConfirmationMode,
  ConsultationType,
  IntakeFieldType,
  MembershipRole,
  MessageType,
  SpecialtyCategory,
} from './enums';

// ─── Auth Schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Practice Schemas ───────────────────────────────────────────────────────

export const createPracticeSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  category: z.nativeEnum(SpecialtyCategory),
  timezone: z.string().min(1),
  currency: z.string().length(3).default('USD'),
  country: z.string().length(2).default('US'),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const updatePracticeSchema = createPracticeSchema.partial();

// ─── Provider Schemas ───────────────────────────────────────────────────────

export const createProviderProfileSchema = z.object({
  userId: z.string().uuid(),
  specialties: z.array(z.string()).default([]),
  credentials: z.string().max(100).optional(),
  bio: z.string().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  education: z.string().optional(),
  languages: z.array(z.string()).default(['English']),
  acceptingNewPatients: z.boolean().default(true),
  consultationTypes: z.array(z.nativeEnum(ConsultationType)).default([ConsultationType.VIDEO]),
});

export const updateProviderProfileSchema = createProviderProfileSchema.omit({ userId: true }).partial();

// ─── Service Schemas ────────────────────────────────────────────────────────

export const createServiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0),
  consultationType: z.nativeEnum(ConsultationType).default(ConsultationType.VIDEO),
  confirmationMode: z.nativeEnum(ConfirmationMode).default(ConfirmationMode.AUTO_CONFIRM),
  intakeFormTemplateId: z.string().uuid().optional(),
  maxParticipants: z.number().int().min(2).max(6).default(2),
  bufferBeforeMinutes: z.number().int().min(0).default(0),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  category: z.string().max(100).optional(),
  providerIds: z.array(z.string().uuid()).min(1),
});

export const updateServiceSchema = createServiceSchema.partial();

// ─── Availability Schemas ───────────────────────────────────────────────────

export const createAvailabilityRuleSchema = z.object({
  providerProfileId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  slotDurationMinutes: z.number().int().min(5).max(480),
});

export const blockedDateSchema = z.object({
  providerProfileId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(255).optional(),
});

// ─── Appointment Schemas ────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  providerProfileId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  consultationType: z.nativeEnum(ConsultationType),
  sessionId: z.string().optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
  notes: z.string().optional(),
});

// ─── Intake Form Schemas ────────────────────────────────────────────────────

export const intakeFieldSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(IntakeFieldType),
  label: z.string().min(1).max(500),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
});

export const createIntakeTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  fields: z.array(intakeFieldSchema).min(1),
});

export const submitIntakeSchema = z.object({
  appointmentId: z.string().uuid(),
  responses: z.record(z.string(), z.unknown()),
});

// ─── Message Schemas ────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  appointmentId: z.string().uuid(),
  receiverId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
});

// ─── Payment Schemas ────────────────────────────────────────────────────────

export const createPaymentIntentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
});

// ─── Invitation Schemas ─────────────────────────────────────────────────────

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(MembershipRole).default(MembershipRole.PROVIDER),
});

// ─── Pagination Schema ──────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
