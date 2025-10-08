import { Request, Response, NextFunction } from 'express'
import { getCollection } from '~/services/database.services'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { HttpError } from '~/models/Error'
import { MESSAGES } from '~/constants/message'

type UserDocument = {
  _id?: unknown
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

type PasswordResetDocument = {
  _id?: unknown
  userId: unknown
  token: string
  expiresAt: Date
  createdAt: Date
  used: boolean
}

type EventLogDocument = {
  _id?: unknown
  userId: unknown
  action: string
  details: string
  timestamp: Date
}

const USERS_COLLECTION = 'users'
const PASSWORD_RESET_COLLECTION = 'password_resets'
const EVENT_LOGS_COLLECTION = 'event_logs'

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string }
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const existing = await users.findOne({ email })
    if (existing) {
      throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()
    const insert = await users.insertOne({ name, email, passwordHash, createdAt: now, updatedAt: now })
    return res.status(201).json({
      message: MESSAGES.REGISTER_SUCCESS,
      data: { id: insert.insertedId, name, email },
    })
  } catch (err) {
    next(err)
  }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string }
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const user = await users.findOne({ email })
    if (!user) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)
    const token = jwt.sign({ sub: String(user._id), email: user.email }, getJwtSecret(), { expiresIn: '7d' })
    return res.status(200).json({ message: MESSAGES.LOGIN_SUCCESS, data: { token } })
  } catch (err) {
    next(err)
  }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token')
    res.clearCookie('session')
    return res.status(200).json({ 
      message: MESSAGES.LOGOUT_SUCCESS,
      data: { sessionCleared: true }
    })
  } catch (err) {
    next(err)
  }
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email: string }
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const user = await users.findOne({ email })
    
    if (!user) {
      throw new HttpError(404, MESSAGES.EMAIL_NOT_FOUND)
    }

    const resetTokens = getCollection<PasswordResetDocument>(PASSWORD_RESET_COLLECTION)
    await resetTokens.deleteMany({ userId: user._id, used: false })
    
    const token = jwt.sign({ userId: user._id, type: 'password_reset' }, getJwtSecret(), { expiresIn: '1h' })
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    
    await resetTokens.insertOne({
      userId: user._id,
      token,
      expiresAt,
      createdAt: new Date(),
      used: false
    })

    return res.status(200).json({ 
      message: MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      data: { email }
    })
  } catch (err) {
    next(err)
  }
}

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string }
    
    const resetTokens = getCollection<PasswordResetDocument>(PASSWORD_RESET_COLLECTION)
    const resetRecord = await resetTokens.findOne({ token, used: false })
    
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new HttpError(400, MESSAGES.INVALID_RESET_TOKEN)
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    
    await users.updateOne(
      { _id: resetRecord.userId as any },
      { 
        $set: { 
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        }
      }
    )

    await resetTokens.updateOne(
      { _id: resetRecord._id },
      { $set: { used: true } }
    )

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId: resetRecord.userId,
      action: 'PASSWORD_RESET',
      details: 'Password was successfully reset',
      timestamp: new Date()
    })

    return res.status(200).json({ 
      message: MESSAGES.RESET_PASSWORD_SUCCESS
    })
  } catch (err) {
    next(err)
  }
}

