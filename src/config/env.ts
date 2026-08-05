import config from "./index";

export const env = {
  PORT: config.port,
  DATABASE_URL: config.db_url,
  JWT_SECRET: config.jwt.jwt_secret,
  CORS_ORIGIN: config.cors_origin,
  EXPIRES_IN: config.jwt.expires_in,
};

export default config;
