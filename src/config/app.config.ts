import 'dotenv/config';

const { env } = process;

export default () => ({
  app: {
    port: Number(env.PORT || 3000),
    nodeEnv: env.NODE_ENV || 'development',
    Observe: {
      appKey: env.OBSERVE_APPKEY,
      appSecret: env.OBSERVE_APPSECRET,
    },
    // sentryDsn: process.env.SENTRY_DSN,

    // errorAlertsEnabled: process.env.ERROR_ALERTS_ENABLED,
  },
  smsru: {
    apikey: env.SMSRU_API_KEY,
    otpSecret: env.OTP_SECRET || '',
  },
  db: {
    host: env.POSTGRES_HOST,
    port: Number(env.POSTGRES_PORT || 5432),
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
});
