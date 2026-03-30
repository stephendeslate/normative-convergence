import type { z } from 'zod';
import type {
  loginSchema,
  registerSchema,
  createPracticeSchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  sendMessageSchema,
  paginationSchema,
  createServiceSchema,
  createProviderProfileSchema,
  createAvailabilityRuleSchema,
  createBlockedDateSchema,
  createIntakeTemplateSchema,
  submitIntakeSchema,
  createPaymentIntentSchema,
  createInvitationSchema,
} from './schemas';

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type CreatePracticeDto = z.infer<typeof createPracticeSchema>;
export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusDto = z.infer<typeof updateAppointmentStatusSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type CreateProviderProfileDto = z.infer<typeof createProviderProfileSchema>;
export type CreateAvailabilityRuleDto = z.infer<typeof createAvailabilityRuleSchema>;
export type CreateBlockedDateDto = z.infer<typeof createBlockedDateSchema>;
export type CreateIntakeTemplateDto = z.infer<typeof createIntakeTemplateSchema>;
export type SubmitIntakeDto = z.infer<typeof submitIntakeSchema>;
export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentSchema>;
export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// WebSocket Events
export interface WsNewMessage {
  event: 'newMessage';
  data: {
    id: string;
    appointmentId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
  };
}

export interface WsAppointmentUpdate {
  event: 'appointmentUpdate';
  data: {
    id: string;
    status: string;
    updatedAt: string;
  };
}

export interface WsVideoRoomReady {
  event: 'videoRoomReady';
  data: {
    appointmentId: string;
    roomName: string;
  };
}

export interface WsNotification {
  event: 'notification';
  data: {
    id: string;
    type: string;
    title: string;
    body: string;
    createdAt: string;
  };
}
