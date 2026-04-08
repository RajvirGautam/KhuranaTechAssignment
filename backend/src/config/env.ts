import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  AI_API: z.string().min(1),
  OPENROUTER_MODEL: z.string().default("nvidia/nemotron-3-super-120b-a12b:free"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  CLIENT_ORIGINS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
