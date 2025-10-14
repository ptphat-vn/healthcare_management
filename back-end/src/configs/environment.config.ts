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
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
  const issue = parsed.error.issues[0]
  throw new Error(`${issue.path.join('.')}: ${issue.message}`)
}

export const env = parsed.data

export const getAllowedOrigins = (): string[] => {
  if (env.FRONTEND_URLS && env.FRONTEND_URLS.trim().length > 0) {
    return env.FRONTEND_URLS.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return env.FRONTEND_URL ? [env.FRONTEND_URL] : []
}


