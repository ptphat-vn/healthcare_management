import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user.routes'
import authRouter from './routes/auth.routes'
import { HttpError } from '~/models/error.model'
import { corsMiddleware } from '~/configs/cors.config'
import { connectMongo } from '~/configs/mongodb.config'
import { env } from '~/configs/environment.config'

dotenv.config()

const app = express()

app.use(corsMiddleware())

app.use(express.json())

app.get('/', (_req, res) => {
  res.send('ok')
})

app.use('/api', authRouter)
app.use('/api', userRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }
  return res.status(500).json({ message: 'Internal Server Error' })
})

const PORT = Number(env.PORT || 3000)

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((e) => {
    console.error('Failed to start server', e)
    process.exit(1)
  })
