import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

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
