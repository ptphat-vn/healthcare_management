import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getUsersCollection, type UserDocument } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'
import { getPasswordResetCollection, type PasswordResetDocument } from '~/models/password-reset.model'
import { getEventLogsCollection } from '~/models/event-log.model'

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export async function register(payload: {
  fullName: string
  email: string
  phoneNumber: string
  identifyNumber: string
  gender: 'male' | 'female'
  address: string
  dateOfBirth: string
  password: string
}) {
  const users = getUsersCollection()

  if (await users.findOne({ email: payload.email })) throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
  if (await users.findOne({ phoneNumber: payload.phoneNumber })) throw new HttpError(409, MESSAGES.PHONE_EXISTS)
  if (await users.findOne({ identifyNumber: payload.identifyNumber }))
    throw new HttpError(409, MESSAGES.IDENTIFY_NUMBER_EXISTS)

  const passwordHash = await bcrypt.hash(payload.password, 10)
  const now = new Date()
  const roles = getRolesCollection()
  let defaultRole = await roles.findOne({ code: 'patient' } as any)
  if (!defaultRole) {
    const insertRole = await roles.insertOne({ name: 'Patient', code: 'patient', description: 'Default user role', privileges: ['read_only'], createdAt: now, updatedAt: now } as any)
    defaultRole = await roles.findOne({ _id: insertRole.insertedId } as any)
  }
  const insert = await users.insertOne({
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    identifyNumber: payload.identifyNumber,
    gender: payload.gender,
    address: payload.address,
    dateOfBirth: payload.dateOfBirth,
    passwordHash,
    roleId: (defaultRole as any)._id,
    status: 1,
    createdAt: now,
    updatedAt: now
  } as UserDocument)

  const eventLogs = getEventLogsCollection()
  try {
    await eventLogs.insertOne({
      operator: { id: insert.insertedId, name: payload.fullName, role: (defaultRole as any)?.code || 'user' },
      action: 'USER_CREATED',
      details: 'User account created',
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return {
    id: insert.insertedId,
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    identifyNumber: payload.identifyNumber,
    gender: payload.gender,
    address: payload.address,
    dateOfBirth: payload.dateOfBirth,
    roleId: (defaultRole as any)._id
  }
}

export async function createUserByAdmin(payload: Parameters<typeof register>[0]) {
  // Same as register for now; could set different role later
  const created = await register(payload)
  return created
}

export async function login(payload: { email: string; password: string }) {
  const users = getUsersCollection()
  const user = await users.findOne({ email: payload.email })
  if (!user) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)
  if (user.status === 0) {
    throw new HttpError(403, MESSAGES.ACCOUNT_INACTIVE)
  }
  if (user.status === 2) {
    throw new HttpError(403, MESSAGES.ACCOUNT_LOCKED)
  }
  const ok = await bcrypt.compare(payload.password, user.passwordHash)
  if (!ok) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)

  const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), { expiresIn: '30m' })
  const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function forgotPassword(email: string) {
  const users = getUsersCollection()
  const user = await users.findOne({ email })
  if (!user) throw new HttpError(404, MESSAGES.EMAIL_NOT_FOUND)

  const resetTokens = getPasswordResetCollection()
  await resetTokens.deleteMany({ userId: user._id, used: false } as any)

  const token = jwt.sign({ userId: user._id, type: 'password_reset' }, getJwtSecret(), { expiresIn: '1h' })
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await resetTokens.insertOne({ userId: user._id, token, expiresAt, createdAt: new Date(), used: false } as PasswordResetDocument)
  return { email }
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  const resetTokens = getPasswordResetCollection()
  const resetRecord = await resetTokens.findOne({ token: payload.token, used: false })
  if (!resetRecord || resetRecord.expiresAt < new Date()) throw new HttpError(400, MESSAGES.INVALID_RESET_TOKEN)

  const users = getUsersCollection()
  const newPasswordHash = await bcrypt.hash(payload.newPassword, 10)
  await users.updateOne({ _id: resetRecord.userId as any }, { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } })
  await resetTokens.updateOne({ _id: resetRecord._id }, { $set: { used: true } })

  const updatedUser = await users.findOne({ _id: resetRecord.userId as any })
  const roles = getRolesCollection()
  const roleDoc = updatedUser?.roleId ? await roles.findOne({ _id: updatedUser.roleId } as any) : null
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    operator: { id: resetRecord.userId, name: updatedUser?.fullName || '', role: roleDoc?.code || '' },
    action: 'PASSWORD_RESET',
    details: 'Password was successfully reset',
    timestamp: new Date()
  } as any)

  const accessToken = jwt.sign({ sub: String(updatedUser?._id), email: updatedUser?.email, type: 'access' }, getJwtSecret(), { expiresIn: '30m' })
  const refreshToken = jwt.sign({ sub: String(updatedUser?._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function changePassword(payload: { userId: string | ObjectId; oldPassword: string; newPassword: string }) {
  if (payload.oldPassword === payload.newPassword) throw new HttpError(400, 'New password must be different from old password')
  const users = getUsersCollection()
  const targetId = typeof payload.userId === 'string' ? new (require('mongodb').ObjectId)(payload.userId) : payload.userId
  const user = await users.findOne({ _id: targetId } as any)
  if (!user) throw new HttpError(401, 'Unauthorized')
  const ok = await bcrypt.compare(payload.oldPassword, user.passwordHash)
  if (!ok) throw new HttpError(400, 'Old password is incorrect')
  const newHash = await bcrypt.hash(payload.newPassword, 10)
  await users.updateOne({ _id: targetId } as any, { $set: { passwordHash: newHash, updatedAt: new Date() } })
  const eventLogs = getEventLogsCollection()
  try {
    const roles = getRolesCollection()
    const roleDoc = user?.roleId ? await roles.findOne({ _id: user.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: targetId, name: user?.fullName || '', role: roleDoc?.code || '' },
      action: 'PASSWORD_CHANGED',
      details: 'User changed password',
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), { expiresIn: '30m' })
  const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, getJwtSecret()) as { sub: string; type: string }
  if (payload.type !== 'refresh') throw new HttpError(401, 'Invalid refresh token')

  let userObjectId: any
  try {
    userObjectId = new (require('mongodb').ObjectId)(payload.sub)
  } catch {
    throw new HttpError(401, 'Invalid token')
  }

  const users = getUsersCollection()
  const user = await users.findOne({ _id: userObjectId })
  if (!user) throw new HttpError(401, 'User not found')
  const newAccessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), { expiresIn: '30m' })
  return { accessToken: newAccessToken }
}

export async function getProfile(userId: string | ObjectId) {
  const users = getUsersCollection()
  const targetId = typeof userId === 'string' ? new (require('mongodb').ObjectId)(userId) : userId
  const user = await users.findOne({ _id: targetId } as any)
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)
  const { passwordHash, ...safe } = user as any
  try {
    const roles = (await import('~/models/role.model')).getRolesCollection()
    const role = user.roleId ? await roles.findOne({ _id: user.roleId } as any) : null
    return { ...safe, roleCode: role?.code, roleName: role?.name }
  } catch {
    return { ...safe }
  }
}

 