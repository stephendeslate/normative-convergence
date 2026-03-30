export default () => ({
  database: {
    url: process.env.DATABASE_URL,
    connection_limit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    pool_timeout: parseInt(process.env.DB_POOL_TIMEOUT || '10000', 10),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
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
  email: {
    apiKey: process.env.EMAIL_API_KEY,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@medconnect.dev',
  },
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3001',
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
  },
});
