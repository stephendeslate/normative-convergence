export const SLOT_RESERVATION_TTL_MINUTES = 10;
export const PLATFORM_FEE_PERCENT = 1;

export const JWT = {
  ALGORITHM: 'RS256' as const,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
};

export const RATE_LIMITS = {
  DEFAULT_TTL: 60,
  DEFAULT_LIMIT: 100,
  AUTH_TTL: 60,
  AUTH_LIMIT: 10,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const SUBSCRIPTION_TIERS = {
  STARTER: { name: 'Starter', maxProviders: 1, maxServices: 5, price: 0 },
  PRACTICE: { name: 'Practice', maxProviders: 10, maxServices: 50, price: 99 },
  ENTERPRISE: { name: 'Enterprise', maxProviders: -1, maxServices: -1, price: 499 },
} as const;

export const BULLMQ_QUEUES = {
  REMINDERS: 'appointment-reminders',
  NOTIFICATIONS: 'notifications',
  EMAILS: 'emails',
} as const;

export const AUDIT_ACTIONS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_REGISTER: 'USER_REGISTER',
  APPOINTMENT_CREATE: 'APPOINTMENT_CREATE',
  APPOINTMENT_UPDATE: 'APPOINTMENT_UPDATE',
  APPOINTMENT_CANCEL: 'APPOINTMENT_CANCEL',
  PAYMENT_CREATE: 'PAYMENT_CREATE',
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  PRACTICE_CREATE: 'PRACTICE_CREATE',
  PRACTICE_UPDATE: 'PRACTICE_UPDATE',
} as const;

export const DEMO_DISCLAIMER =
  'This is a demonstration application. Do not enter real patient data.';
