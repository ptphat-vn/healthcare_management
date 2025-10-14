import { Request, Response, NextFunction } from 'express'
import { getCollection } from '~/services/database.services'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { HttpError } from '~/models/Error'
import { MESSAGES } from '~/constants/message'
import { UserDocument } from '~/types/user.type'
import { PasswordResetDocument } from '~/types/password-reset.type'
import { EventLogDocument } from '~/types/event-log.type'
import { ObjectId, ModifyResult } from 'mongodb'

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
    const { fullName, email, phoneNumber, identifyNumber, gender, address, dateOfBirth, password } = req.body as {
      fullName: string
      email: string
      phoneNumber: string
      identifyNumber: string
      gender: 'male' | 'female'
      address: string
      dateOfBirth: string
      password: string
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)

    const existingEmail = await users.findOne({ email })
    if (existingEmail) {
      throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
    }

    const existingPhone = await users.findOne({ phoneNumber })
    if (existingPhone) {
      throw new HttpError(409, MESSAGES.PHONE_EXISTS)
    }

    const existingIdentify = await users.findOne({ identifyNumber })
    if (existingIdentify) {
      throw new HttpError(409, MESSAGES.IDENTIFY_NUMBER_EXISTS)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()

    const insert = await users.insertOne({
      fullName,
      email,
      phoneNumber,
      identifyNumber: identifyNumber,
      gender,
      address,
      dateOfBirth,
      passwordHash,
      role: 'user',
      status: 1,
      createdAt: now,
      updatedAt: now
    })

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId: insert.insertedId,
      action: 'USER_CREATED',
      details: 'User account created',
      timestamp: now
    })

    return res.status(200).json({
      message: MESSAGES.REGISTER_SUCCESS,
      data: {
        id: insert.insertedId,
        fullName,
        email,
        phoneNumber,
        identifyNumber,
        gender,
        address,
        dateOfBirth,
        role: 'user'
      }
    })
  } catch (err) {
    next(err)
  }
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phoneNumber, identifyNumber, gender, address, dateOfBirth, password } = req.body as {
      fullName: string
      email: string
      phoneNumber: string
      identifyNumber: string
      gender: 'male' | 'female'
      address: string
      dateOfBirth: string
      password: string
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)

    const existingEmail = await users.findOne({ email })
    if (existingEmail) {
      throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
    }

    const existingPhone = await users.findOne({ phoneNumber })
    if (existingPhone) {
      throw new HttpError(409, MESSAGES.PHONE_EXISTS)
    }

    const existingIdentify = await users.findOne({ identifyNumber })
    if (existingIdentify) {
      throw new HttpError(409, MESSAGES.IDENTIFY_NUMBER_EXISTS)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date()

    const insert = await users.insertOne({
      fullName,
      email,
      phoneNumber,
      identifyNumber: identifyNumber,
      gender,
      address,
      dateOfBirth,
      passwordHash,
      role: 'user',
      status: 1,
      createdAt: now,
      updatedAt: now
    })

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId: insert.insertedId,
      action: 'USER_CREATED',
      details: 'User account created',
      timestamp: now
    })

    return res.status(201).json({
      message: MESSAGES.REGISTER_SUCCESS,
      data: {
        id: insert.insertedId,
        fullName,
        email,
        phoneNumber,
        identifyNumber,
        gender,
        address,
        dateOfBirth
      }
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

    const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
      expiresIn: '30m'
    })
    const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })

    return res.status(200).json({
      message: MESSAGES.LOGIN_SUCCESS,
      data: { accessToken, refreshToken }
    })
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

    await resetTokens.updateOne({ _id: resetRecord._id }, { $set: { used: true } })

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId: resetRecord.userId,
      action: 'PASSWORD_RESET',
      details: 'Password was successfully reset',
      timestamp: new Date()
    })

    const updatedUser = await users.findOne({ _id: resetRecord.userId as any })
    const accessToken = jwt.sign(
      { sub: String(updatedUser?._id), email: updatedUser?.email, type: 'access' },
      getJwtSecret(),
      { expiresIn: '30m' }
    )
    const refreshToken = jwt.sign({ sub: String(updatedUser?._id), type: 'refresh' }, getJwtSecret(), {
      expiresIn: '7d'
    })

    return res.status(200).json({
      message: MESSAGES.RESET_PASSWORD_SUCCESS,
      data: { accessToken, refreshToken }
    })
  } catch (err) {
    next(err)
  }
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string }
    if (oldPassword === newPassword) throw new HttpError(400, 'New password must be different from old password')
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const userId = (req as any).authUserId
    const user = await users.findOne({ _id: userId })
    if (!user) throw new HttpError(401, 'Unauthorized')
    const ok = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!ok) throw new HttpError(400, 'Old password is incorrect')
    const newHash = await bcrypt.hash(newPassword, 10)
    await users.updateOne({ _id: userId }, { $set: { passwordHash: newHash, updatedAt: new Date() } })
    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId,
      action: 'PASSWORD_CHANGED',
      details: 'User changed password',
      timestamp: new Date()
    })

    const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
      expiresIn: '30m'
    })
    const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })

    return res.status(200).json({ message: 'Password changed successfully', data: { accessToken, refreshToken } })
  } catch (err) {
    next(err)
  }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string }

    const payload = jwt.verify(refreshToken, getJwtSecret()) as { sub: string; type: string }
    if (payload.type !== 'refresh') {
      throw new HttpError(401, 'Invalid refresh token')
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)
    let userObjectId: any
    try {
      userObjectId = new (require('mongodb').ObjectId)(payload.sub)
    } catch {
      throw new HttpError(401, 'Invalid token')
    }

    const user = await users.findOne({ _id: userObjectId })
    if (!user) throw new HttpError(401, 'User not found')

    const newAccessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
      expiresIn: '30m'
    })

    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: { accessToken: newAccessToken }
    })
  } catch (err) {
    next(err)
  }
}

export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string }
    let userObjectId: ObjectId
    try {
      userObjectId = new ObjectId(id)
    } catch {
      throw new HttpError(400, 'Invalid user id')
    }

    const allowedFields = ['fullName', 'dateOfBirth', 'age', 'gender', 'address', 'email', 'phoneNumber'] as const
    const updatePayload: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in req.body) updatePayload[key] = (req.body as any)[key]
    }
    if (Object.keys(updatePayload).length === 0) {
      throw new HttpError(422, MESSAGES.VALIDATION_ERROR)
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)

    if (updatePayload.email) {
      const dupEmail = await users.findOne({ email: updatePayload.email, _id: { $ne: userObjectId } as any })
      if (dupEmail) throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
    }
    if (updatePayload.phoneNumber) {
      const dupPhone = await users.findOne({
        phoneNumber: updatePayload.phoneNumber,
        _id: { $ne: userObjectId } as any
      })
      if (dupPhone) throw new HttpError(409, MESSAGES.PHONE_EXISTS)
    }

    const now = new Date()
    const result = await users.findOneAndUpdate(
      { _id: userObjectId } as any,
      { $set: { ...updatePayload, updatedAt: now } },
      { returnDocument: 'after' }
    )

    const updated: any = (result as any)?.value ?? result
    if (!updated) throw new HttpError(404, 'User not found')

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    await eventLogs.insertOne({
      userId: updated._id as any,
      action: 'USER_UPDATED',
      details: 'User information updated',
      timestamp: now
    })

    const { passwordHash, ...safe } = updated as any
    return res.status(200).json({ message: 'User updated successfully', data: safe })
  } catch (err) {
    next(err)
  }
}

export const updateUserStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string }
    const { status } = req.body as { status: 0 | 1 | 2 }
    let userObjectId: ObjectId
    try {
      userObjectId = new ObjectId(id)
    } catch {
      throw new HttpError(400, 'Invalid user id')
    }

    const users = getCollection<UserDocument>(USERS_COLLECTION)

    const result = await users.findOneAndUpdate(
      { _id: userObjectId } as any,
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    const updated: any = (result as any)?.value ?? result
    if (!updated) throw new HttpError(404, 'User not found')

    const eventLogs = getCollection<EventLogDocument>(EVENT_LOGS_COLLECTION)
    const actionMap: Record<0 | 1 | 2, string> = { 0: 'USER_INACTIVE', 1: 'USER_ACTIVE', 2: 'USER_LOCKED' }
    await eventLogs.insertOne({
      userId: updated._id as any,
      action: actionMap[status],
      details: `User status set to ${status}`,
      timestamp: new Date()
    })

    const { passwordHash, ...safe } = updated as any
    return res.status(200).json({ message: 'User status updated', data: safe })
  } catch (err) {
    next(err)
  }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const allUsers = await users.find().toArray()
    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: MESSAGES.USERS_NOT_FOUND })
    }
    const usersWithoutPassword = allUsers.map(({ passwordHash, ...rest }) => rest)
    return res.status(200).json({
      message: MESSAGES.GET_USERS_SUCCESS,
      data: usersWithoutPassword
    })
  } catch (err) {
    next(err)
  }
}

export const getUserDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = getCollection<UserDocument>(USERS_COLLECTION)
    const userId = req.params.id
    const user = await users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND })
    }
    const { passwordHash, ...userWithoutPassword } = user
    return res.status(200).json({
      message: MESSAGES.GET_USER_DETAIL_SUCCESS,
      data: userWithoutPassword
    })
  } catch (err) {
    next(err)
  }
}

export const profileUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const users = getCollection<UserDocument>(USERS_COLLECTION)

    // Validate ObjectId
    if (!ObjectId.isValid(authUserId)) {
      throw new HttpError(400, 'Invalid user ID format')
    }

    const queryId = new ObjectId(authUserId)
    const user = await users.findOne({ _id: queryId } as any)

    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND })
    }

    // Loại bỏ password
    const { passwordHash, ...userSafe } = user as any

    return res.status(200).json({
      message: MESSAGES.GET_USER_DETAIL_SUCCESS,
      data: userSafe
    })
  } catch (error) {
    next(error)
  }
}
