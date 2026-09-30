import 'dotenv/config';

export default () => ({
  app: {
    port: Number(process.env.PORT || 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    Observe: {
      appKey: process.env.OBSERVE_APPKEY,
      appSecret: process.env.OBSERVE_APPSECRET,
    },
    // sentryDsn: process.env.SENTRY_DSN,

    // errorAlertsEnabled: process.env.ERROR_ALERTS_ENABLED,
  },
  db: {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});
