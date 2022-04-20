import * as dotenv from 'dotenv';

dotenv.config();

export default {
  App: {
    port: Number(process.env.APP_PORT) || 3333,
    logger: {
      enabled: Boolean(process.env.APP_LOGGER_ENABLED),
      level: String(process.env.APP_LOGGER_LEVEL),
    },
    database: {
      mongoUrl: String(process.env.MONGO_URL),
    },
  },
};
