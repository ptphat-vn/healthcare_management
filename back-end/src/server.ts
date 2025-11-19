import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import dotenv from 'dotenv'
import userRouter from './routes/user.routes'
import roleRouter from './routes/role.routes'
import authRouter from './routes/auth.routes'
import testOrderRouter from './routes/test-order.routes'
import flaggingConfigRouter from './routes/flagging-config.routes'
import eventLogRouter from './routes/event-log.routes'
import patientMedicalRecordRouter from './routes/patient-medical-record.routes'
import aiRouter from './routes/ai.routes'
import reagentRouter from './routes/reagent.routes'
import instrumentRouter from './routes/instrument.routes'
import webrtcRouter from './routes/webrtc.routes'
import { HttpError } from '~/models/error.model'
import { corsMiddleware } from '~/configs/cors.config'
import { connectMongo } from '~/configs/mongodb.config'
import { env, getAllowedOrigins } from '~/configs/environment.config'
import { swaggerDocument, swaggerUi } from '~/configs/swagger.config'
import { ensureDefaultRoles } from '~/services/role.service'
import { initializeDefaultFlaggingConfigs } from '~/services/flagging-config.service'
import { ensureDefaultReagents } from '~/services/reagent.service'
import chatRouter from '~/routes/chat.routes'
import notificationRouter from '~/routes/notification.routes'
import { setIo } from '~/utils/socket'
import { initSockets } from '~/sockets'

dotenv.config()

const app = express()

app.use(corsMiddleware())

app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ 
    message: 'Healthcare Management API', 
    version: '1.0.0',
    docs: '/api-docs',
    status: 'running'
  })
})

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Healthcare Management API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  }
}))

app.use('/api', authRouter)
app.use('/api', userRouter)
app.use('/api', roleRouter)
app.use('/api', testOrderRouter)
app.use('/api', flaggingConfigRouter)
app.use('/api', eventLogRouter)
app.use('/api', patientMedicalRecordRouter)
app.use('/api', aiRouter)
app.use('/api', reagentRouter)
app.use('/api', chatRouter)
app.use('/api', notificationRouter)
app.use('/api', instrumentRouter)
app.use('/api', webrtcRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }
  console.error('Unhandled error:', err)
  return res.status(500).json({ message: 'Internal Server Error' })
})

const PORT = Number(env.PORT || 3000)

connectMongo()
  .then(() => {
    ensureDefaultRoles().catch((e) => console.error('Seed roles failed', e))
    initializeDefaultFlaggingConfigs().catch((e) => console.error('Initialize flagging configs failed', e))
    ensureDefaultReagents().catch((e) => console.error('Initialize default reagents failed', e))

    // create HTTP server so we can attach socket.io
    const server = http.createServer(app)

    const io = new IOServer(server, {
      cors: {
        origin: (origin, callback) => {
          const allowed = getAllowedOrigins()
          // Allow swagger UI / local development
          if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
            return callback(null, true)
          }
          if (allowed.length === 0 || allowed.includes(origin)) return callback(null, true)
          return callback(new Error('Not allowed by CORS'))
        },
        credentials: true,
      },
    })

    // expose io to other modules and register handlers
    setIo(io)
    try {
      initSockets(io)
    } catch (e) {
      // if sockets module not present or throws, continue — setIo is still called
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((e) => {
    console.error('Failed to start server', e)
    process.exit(1)
  })
