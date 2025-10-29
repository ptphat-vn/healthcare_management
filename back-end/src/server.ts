import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user.routes'
import roleRouter from './routes/role.routes'
import authRouter from './routes/auth.routes'
import testOrderRouter from './routes/test-order.routes'
import flaggingConfigRouter from './routes/flagging-config.routes'
import eventLogRouter from './routes/event-log.routes'
import patientMedicalRecordRouter from './routes/patient-medical-record.routes'
import aiRouter from './routes/ai.routes'
import { HttpError } from '~/models/error.model'
import { corsMiddleware } from '~/configs/cors.config'
import { connectMongo } from '~/configs/mongodb.config'
import { env } from '~/configs/environment.config'
import { swaggerDocument, swaggerUi } from '~/configs/swagger.config'
import { ensureDefaultRoles } from '~/services/role.service'
import { initializeDefaultFlaggingConfigs } from '~/services/flagging-config.service'

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

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }
  return res.status(500).json({ message: 'Internal Server Error' })
})

const PORT = Number(env.PORT || 3000)

connectMongo()
  .then(() => {
    ensureDefaultRoles().catch((e) => console.error('Seed roles failed', e))
    initializeDefaultFlaggingConfigs().catch((e) => console.error('Initialize flagging configs failed', e))
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((e) => {
    console.error('Failed to start server', e)
    process.exit(1)
  })
