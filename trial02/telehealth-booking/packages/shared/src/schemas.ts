import { z } from 'zod';

// Auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// Practices
export const createPracticeSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  category: z.string().optional(),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const updatePracticeSchema = createPracticeSchema.partial();

// Provider Profiles
export const createProviderProfileSchema = z.object({
  specialties: z.array(z.string()).min(1),
  credentials: z.string().optional(),
  bio: z.string().max(2000).optional(),
  languages: z.array(z.string()).default(['en']),
  consultationTypes: z.array(z.string()).min(1),
});

export const updateProviderProfileSchema = createProviderProfileSchema.partial();

// Services
export const createServiceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  confirmationMode: z.enum(['AUTO_CONFIRM', 'MANUAL_APPROVAL']).default('AUTO_CONFIRM'),
  bufferBefore: z.number().int().min(0).default(0),
  bufferAfter: z.number().int().min(0).default(0),
  providerIds: z.array(z.string().uuid()).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Availability Rules
export const createAvailabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(5).max(480).default(30),
});

export const createBlockedDateSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().max(500).optional(),
});

// Appointments
export const createAppointmentSchema = z.object({
  providerProfileId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  consultationType: z.enum(['VIDEO', 'IN_PERSON', 'PHONE']).default('VIDEO'),
  notes: z.string().max(2000).optional(),
  reservationToken: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
  cancellationReason: z.string().max(1000).optional(),
});

// Intake Forms
export const createIntakeTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  fields: z.array(
    z.object({
      label: z.string().min(1),
      type: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTI_SELECT', 'DATE', 'CHECKBOX', 'RADIO']),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    }),
  ),
});

export const submitIntakeSchema = z.object({
  appointmentId: z.string().uuid(),
  responses: z.record(z.string(), z.unknown()),
});

// Messages
export const sendMessageSchema = z.object({
  appointmentId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).default('TEXT'),
});

// Payments
export const createPaymentIntentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().int().min(1),
  currency: z.string().length(3).default('USD'),
});

// Invitations
export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'PROVIDER']),
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
