import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getUsersCollection, type UserDocument } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'
import { getPasswordResetCollection, type PasswordResetDocument } from '~/models/password-reset.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getNextSequence } from '~/models/counter.model'
import crypto from 'crypto'
import { sendMail } from '~/utils/email'

const revokedRefreshTokens = new Set<string>()

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

const generateNextPatientId = async (): Promise<string> => {
  const seq = await getNextSequence('patientId')
  const padded = String(seq).padStart(6, '0')
  return `P${padded}`
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
    const insertRole = await roles.insertOne({
      name: 'Patient',
      code: 'patient',
      description: 'Default user role',
      privileges: ['read_only'],
      createdAt: now,
      updatedAt: now
    } as any)
    defaultRole = await roles.findOne({ _id: insertRole.insertedId } as any)
  }
  const insert = await users.insertOne({
    patientId: await generateNextPatientId(),
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



  return {
    id: insert.insertedId,
    patientId: (await users.findOne({ _id: insert.insertedId } as any))?.patientId,
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

export async function createUserByAdmin(payload: Parameters<typeof register>[0], performedBy?: string) {
  const created = await register(payload)
  // gửi tkhoan mkhau cho user
  try {
    await sendMail({
      to: payload.email,
      subject: 'Tài khoản của bạn đã được tạo',
      text: `Xin chào ${payload.fullName},\n\nTài khoản của bạn đã được tạo trên hệ thống.\n\nThông tin đăng nhập:\n- Email: ${payload.email}\n- Mật khẩu: ${payload.password}\n\nVui lòng đăng nhập và đổi mật khẩu sau khi sử dụng lần đầu.`,
      html: `<p>Xin chào <b>${payload.fullName}</b>,</p>
<p>Tài khoản của bạn đã được tạo trên hệ thống.</p>
<p><b>Thông tin đăng nhập:</b><br/>Email: <code>${payload.email}</code><br/>Mật khẩu: <code>${payload.password}</code></p>
<p>Vui lòng đăng nhập và <b>đổi mật khẩu</b> sau khi sử dụng lần đầu.</p>`
    })
  } catch (err) {
    console.error('Failed to send credentials email to new user:', err)
  }


  // event log
  try {
    const eventLogs = getEventLogsCollection()
    const users = getUsersCollection()
    const actor = performedBy ? await users.findOne({ _id: new (require('mongodb').ObjectId)(performedBy) } as any) : null
    const roleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: actor?._id || 'system', name: actor?.fullName || 'system', role: actorRoleDoc?.code || 'system' },
      action: 'USER_CREATED',
      details: `User account created: ${payload.fullName} (${payload.email})`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

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
  if (!user.passwordHash) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)
  const ok = await bcrypt.compare(payload.password, user.passwordHash)
  if (!ok) throw new HttpError(401, MESSAGES.INVALID_CREDENTIALS)

  const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
    expiresIn: '30m'
  })
  const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function forgotPassword(email: string) {
  const users = getUsersCollection()
  const user = await users.findOne({ email })
  if (!user) throw new HttpError(404, MESSAGES.EMAIL_NOT_FOUND)

  const resetTokens = getPasswordResetCollection()
  await resetTokens.deleteMany({ userId: user._id, used: false } as any)

  // tạo otp
  
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await resetTokens.insertOne({
    userId: user._id,
    token: otp,
    expiresAt,
    createdAt: new Date(),
    used: false
  } as PasswordResetDocument)

  await sendMail({
    to: email,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 10 phút.`,
    html: `<h2>Mã OTP của bạn là: <b>${otp}</b></h2><p>Hiệu lực 10 phút.</p>`
  })
  return { email }
}

export async function verifyResetToken(payload: { otp: string; email: string }) {
  const users = getUsersCollection()
  const user = await users.findOne({ email: payload.email })
  if (!user) throw new HttpError(404, MESSAGES.EMAIL_NOT_FOUND)
  
  const resetTokens = getPasswordResetCollection()
  const resetRecord = await resetTokens.findOne({ userId: user._id, token: payload.otp, used: false })
  
  // Kiểm tra token có tồn tại không
  if (!resetRecord) {
    throw new HttpError(400, MESSAGES.INVALID_RESET_TOKEN)
  }
  
  // Kiểm tra token đã hết hạn chưa
  if (resetRecord.expiresAt < new Date()) {
    throw new HttpError(400, MESSAGES.INVALID_RESET_TOKEN)
  }
  
  // Token hợp lệ
  return { email: payload.email, valid: true }
}

export async function resetPassword(payload: { otp: string; email: string; newPassword: string }) {
  // Bước 1: Verify token trước - kiểm tra token đúng hay sai
  await verifyResetToken({ otp: payload.otp, email: payload.email })
  
  // Bước 2: Nếu token hợp lệ (đã pass bước verify), mới cho phép đổi mật khẩu
  const users = getUsersCollection()
  const user = await users.findOne({ email: payload.email })
  if (!user) throw new HttpError(404, MESSAGES.EMAIL_NOT_FOUND)
  
  const resetTokens = getPasswordResetCollection()
  const resetRecord = await resetTokens.findOne({ userId: user._id, token: payload.otp, used: false })
  
  // Kiểm tra lại để đảm bảo token vẫn hợp lệ (tránh race condition)
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new HttpError(400, MESSAGES.INVALID_RESET_TOKEN)
  }
  
  // Token đã được verify đúng, tiến hành đổi mật khẩu
  const newPasswordHash = await bcrypt.hash(payload.newPassword, 10)
  await users.updateOne({ _id: user._id }, { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } })
  await resetTokens.updateOne({ _id: resetRecord._id }, { $set: { used: true } })

  return { email: payload.email }
}

export async function changePassword(payload: { userId: string | ObjectId; oldPassword: string; newPassword: string }) {
  if (payload.oldPassword === payload.newPassword)
    throw new HttpError(400, 'New password must be different from old password')
  const users = getUsersCollection()
  const targetId =
    typeof payload.userId === 'string' ? new (require('mongodb').ObjectId)(payload.userId) : payload.userId
  const user = await users.findOne({ _id: targetId } as any)
  if (!user) throw new HttpError(401, 'Unauthorized')
  if (!user.passwordHash) throw new HttpError(400, 'User does not have a password set')
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

  const accessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
    expiresIn: '30m'
  })
  const refreshToken = jwt.sign({ sub: String(user._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) throw new HttpError(400, 'Refresh token is required')
  if (revokedRefreshTokens.has(refreshToken)) throw new HttpError(401, 'Refresh token has been revoked')
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
  const newAccessToken = jwt.sign({ sub: String(user._id), email: user.email, type: 'access' }, getJwtSecret(), {
    expiresIn: '30m'
  })
  return { accessToken: newAccessToken }
}

export async function logout(refreshToken?: string) {
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, getJwtSecret()) as { type: string }
      if (payload.type === 'refresh') {
        revokedRefreshTokens.add(refreshToken)
      }
    } catch {}
  }
  return { revoked: Boolean(refreshToken) }
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

export async function loginWithGoogle({ email, fullName }: { email: string; fullName: string }) {
  const users = getUsersCollection()
  let user = await users.findOne({ email })
  if (!user) {
    const now = new Date()
    const roles = getRolesCollection()
    let defaultRole = await roles.findOne({ code: 'patient' } as any)
    if (!defaultRole) {
      const insertRole = await roles.insertOne({
        name: 'Patient',
        code: 'patient',
        description: 'Default user role',
        privileges: ['read_only'],
        createdAt: now,
        updatedAt: now
      } as any)
      defaultRole = await roles.findOne({ _id: insertRole.insertedId } as any)
    }
    const insert = await users.insertOne({
      patientId: await generateNextPatientId(),
      fullName,
      email,
      roleId: (defaultRole as any)._id,
      status: 1,
      createdAt: now,
      updatedAt: now
    })
    user = await users.findOne({ _id: insert.insertedId })
  }
  if (user?.status === 0) throw new HttpError(403, MESSAGES.ACCOUNT_INACTIVE)
  if (user?.status === 2) throw new HttpError(403, MESSAGES.ACCOUNT_LOCKED)

  const accessToken = jwt.sign(
    {
      sub: String(user?._id),
      email: user?.email,
      type: 'access'
    },
    getJwtSecret(),
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign({ sub: String(user?._id), type: 'refresh' }, getJwtSecret(), { expiresIn: '7d' })
  return { accessToken, refreshToken }
}
