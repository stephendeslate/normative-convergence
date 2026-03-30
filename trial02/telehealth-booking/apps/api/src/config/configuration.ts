export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY?.includes('\\n')
      ? process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
      : process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY?.includes('\\n')
      ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
      : process.env.JWT_PUBLIC_KEY,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKey: process.env.TWILIO_API_KEY,
    apiSecret: process.env.TWILIO_API_SECRET,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },
});
