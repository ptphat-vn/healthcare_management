import cors from 'cors'
import { getAllowedOrigins } from './environment.config'

export const corsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      const allowed = getAllowedOrigins()
      if (!origin) return callback(null, true)
      if (allowed.length === 0 || allowed.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })


