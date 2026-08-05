import dotenv from "dotenv";
import path from "path";
import { envSchema } from "./env.schema";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

const config = {
  env: parsed.data.NODE_ENV,
  port: Number(parsed.data.PORT),
  db_url: parsed.data.DATABASE_URL,
  cors_origin: parsed.data.CORS_ORIGIN,
  jwt: {
    jwt_secret: parsed.data.JWT_SECRET,
    expires_in: parsed.data.EXPIRES_IN,
  },
};

export default config;
