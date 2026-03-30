export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  USER = 'USER',
}

export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum ConsultationType {
  VIDEO = 'VIDEO',
  IN_PERSON = 'IN_PERSON',
  PHONE = 'PHONE',
  BOTH = 'BOTH',
}

export enum VideoRoomStatus {
  CREATED = 'CREATED',
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum ConfirmationMode {
  AUTO_CONFIRM = 'AUTO_CONFIRM',
  MANUAL_APPROVAL = 'MANUAL_APPROVAL',
}

export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  OUTLOOK = 'OUTLOOK',
}

export enum CalendarEventDirection {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
}

export enum CalendarConnectionStatus {
  ACTIVE = 'ACTIVE',
  DISCONNECTED = 'DISCONNECTED',
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
}

export enum IntakeFieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

export enum IntakeStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum NotificationType {
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  INTAKE_FORM_COMPLETED = 'INTAKE_FORM_COMPLETED',
  VIDEO_ROOM_READY = 'VIDEO_ROOM_READY',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PATIENT_IN_WAITING_ROOM = 'PATIENT_IN_WAITING_ROOM',
}

export enum SpecialtyCategory {
  PRIMARY_CARE = 'PRIMARY_CARE',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  DENTAL = 'DENTAL',
  DERMATOLOGY = 'DERMATOLOGY',
  PHYSICAL_THERAPY = 'PHYSICAL_THERAPY',
  SPECIALIST = 'SPECIALIST',
  OTHER = 'OTHER',
}

// Valid appointment status transitions
export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.CONFIRMED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
};
