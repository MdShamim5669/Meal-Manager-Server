import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export type EnvConfigInput = z.infer<typeof envSchema>;
