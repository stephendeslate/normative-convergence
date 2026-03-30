import type { z } from 'zod';
import type {
  loginSchema,
  registerSchema,
  createPracticeSchema,
  createProviderProfileSchema,
  createServiceSchema,
  createAppointmentSchema,
  createIntakeTemplateSchema,
  sendMessageSchema,
  createPaymentIntentSchema,
  inviteMemberSchema,
  createAvailabilityRuleSchema,
  blockedDateSchema,
} from './schemas';

// ─── Auth Types ─────────────────────────────────────────────────────────────

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  practiceId?: string;
  membershipRole?: string;
  iat: number;
  exp: number;
}

// ─── Practice Types ─────────────────────────────────────────────────────────

export type CreatePracticeDto = z.infer<typeof createPracticeSchema>;
export type UpdatePracticeDto = Partial<CreatePracticeDto>;

// ─── Provider Types ─────────────────────────────────────────────────────────

export type CreateProviderProfileDto = z.infer<typeof createProviderProfileSchema>;
export type UpdateProviderProfileDto = Partial<Omit<CreateProviderProfileDto, 'userId'>>;

// ─── Service Types ──────────────────────────────────────────────────────────

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = Partial<CreateServiceDto>;

// ─── Scheduling Types ───────────────────────────────────────────────────────

export type CreateAvailabilityRuleDto = z.infer<typeof createAvailabilityRuleSchema>;
export type BlockedDateDto = z.infer<typeof blockedDateSchema>;

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  providerId: string;
  date: string;
  timezone: string;
  slots: TimeSlot[];
}

// ─── Appointment Types ──────────────────────────────────────────────────────

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;

// ─── Intake Types ───────────────────────────────────────────────────────────

export type CreateIntakeTemplateDto = z.infer<typeof createIntakeTemplateSchema>;

// ─── Message Types ──────────────────────────────────────────────────────────

export type SendMessageDto = z.infer<typeof sendMessageSchema>;

// ─── Payment Types ──────────────────────────────────────────────────────────

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentSchema>;

// ─── Invitation Types ───────────────────────────────────────────────────────

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;

// ─── WebSocket Event Types ──────────────────────────────────────────────────

export interface WsNewMessage {
  messageId: string;
  appointmentId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface WsAppointmentUpdate {
  appointmentId: string;
  status: string;
  updatedAt: string;
}

export interface WsVideoRoomReady {
  appointmentId: string;
  roomName: string;
}

export interface WsPatientInWaitingRoom {
  appointmentId: string;
  patientId: string;
  patientName: string;
}

export interface WsNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}
