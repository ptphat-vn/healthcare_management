import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGO_DB_NAME: z.string().min(1).default('app'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  FRONTEND_URL: z.string().optional(),
  FRONTEND_URLS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.string().min(1, 'SMTP_PORT is required'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z.string().min(1, 'SMTP_FROM is required'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  STRINGEE_API_KEY_SID: z.string().optional(),
  STRINGEE_API_KEY_SECRET: z.string().optional(),
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
  const issue = parsed.error.issues[0]
  throw new Error(`${issue.path.join('.')}: ${issue.message}`)
}

export const env = parsed.data

export const getAllowedOrigins = (): string[] => {
  if (env.FRONTEND_URLS && env.FRONTEND_URLS.trim().length > 0) {
    return env.FRONTEND_URLS.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return env.FRONTEND_URL ? [env.FRONTEND_URL] : []
}
