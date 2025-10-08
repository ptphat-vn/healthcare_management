import express from 'express'
import dotenv from 'dotenv'
import userRouter from './user.routes'
import { connectDatabase } from '~/services/database.services'
import { HttpError } from '~/models/Error'

dotenv.config()

const app = express()
app.use(express.json())

app.get('/', (_req, res) => {
  res.send('ok')
})

app.use('/api/users', userRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message })
  }
  return res.status(500).json({ message: 'Internal Server Error' })
})

const PORT = Number(process.env.PORT || 3000)

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((e) => {
    console.error('Failed to start server', e)
    process.exit(1)
  })
