import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout
} from './auth.service'
import { MESSAGES } from '~/constants/message.constant'
import { getRolesCollection } from '~/models/role.model'
import { getNextSequence } from '~/models/counter.model'
import { getUsersCollection } from '~/models/user.model'
import { getPasswordResetCollection } from '~/models/password-reset.model'
import { sendMail } from '~/utils/email'

jest.mock('~/models/user.model', () => ({
  getUsersCollection: jest.fn()
}))

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    hash: jest.fn()
  }
}))

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}))

jest.mock('~/models/role.model', () => ({
  getRolesCollection: jest.fn()
}))

jest.mock('~/models/counter.model', () => ({
  getNextSequence: jest.fn()
}))

jest.mock('~/models/password-reset.model', () => ({
  getPasswordResetCollection: jest.fn()
}))

jest.mock('~/utils/email', () => ({
  sendMail: jest.fn()
}))

type FindOneFn = (query?: Record<string, unknown>) => Promise<any>
type InsertOneFn = (doc: Record<string, unknown>) => Promise<{ insertedId: ObjectId }>
type UpdateOneFn = (filter: Record<string, unknown>, update: Record<string, unknown>) => Promise<any>
type DeleteManyFn = (filter: Record<string, unknown>) => Promise<any>
type CompareFn = (data: string, encrypted: string) => Promise<boolean>
type HashFn = (data: string, salt: number) => Promise<string>
type SyncJwtSign = (payload: string | Buffer | object, secretOrPrivateKey: Secret, options?: SignOptions) => string
type JwtVerify = (token: string, secretOrPublicKey: Secret) => { sub: string; type: string }

const usersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as unknown as jest.MockedFunction<InsertOneFn>,
  updateOne: jest.fn() as unknown as jest.MockedFunction<UpdateOneFn>
}
const rolesCollectionMock = {
  findOne: jest.fn() as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as jest.MockedFunction<InsertOneFn>
}
const passwordResetCollectionMock = {
  deleteMany: jest.fn() as jest.MockedFunction<DeleteManyFn>,
  insertOne: jest.fn() as jest.MockedFunction<InsertOneFn>,
  findOne: jest.fn() as jest.MockedFunction<FindOneFn>,
  updateOne: jest.fn() as jest.MockedFunction<UpdateOneFn>
}

const getUsersCollectionMock = jest.mocked(getUsersCollection)
const getRolesCollectionMock = jest.mocked(getRolesCollection)
const getPasswordResetCollectionMock = jest.mocked(getPasswordResetCollection)
const getNextSequenceMock = jest.mocked(getNextSequence)
const bcryptMock = jest.mocked(bcrypt)
const jwtMock = jest.mocked(jwt)
const bcryptCompareMock = bcryptMock.compare as unknown as jest.MockedFunction<CompareFn>
const bcryptHashMock = bcryptMock.hash as unknown as jest.MockedFunction<HashFn>
const jwtSignMock = jwtMock.sign as unknown as jest.MockedFunction<SyncJwtSign>
const jwtVerifyMock = jwtMock.verify as unknown as jest.MockedFunction<JwtVerify>
const sendMailMock = jest.mocked(sendMail)
const randomIntSpy = jest.spyOn(crypto, 'randomInt') as jest.MockedFunction<(min: number, max: number) => number>

describe('auth.service login', () => {
  beforeEach(() => {
    getUsersCollectionMock.mockReturnValue(usersCollectionMock as unknown as ReturnType<typeof getUsersCollection>)
    getRolesCollectionMock.mockReturnValue(rolesCollectionMock as unknown as ReturnType<typeof getRolesCollection>)
    usersCollectionMock.findOne.mockReset()
    usersCollectionMock.insertOne.mockReset()
    rolesCollectionMock.findOne.mockReset()
    rolesCollectionMock.insertOne.mockReset()
    bcryptCompareMock.mockReset()
    bcryptHashMock.mockReset()
    jwtSignMock.mockReset()
    getNextSequenceMock.mockReset()
  })

  it('throws 401 when user is not found', async () => {
    usersCollectionMock.findOne.mockResolvedValue(null)

    await expect(login({ email: 'missing@example.com', password: 'secret' })).rejects.toEqual(
      expect.objectContaining({ status: 401, message: MESSAGES.INVALID_CREDENTIALS })
    )
  })

  it('throws 403 when account is inactive', async () => {
    usersCollectionMock.findOne.mockResolvedValue({
      _id: new ObjectId(),
      email: 'inactive@example.com',
      status: 0
    })

    await expect(login({ email: 'inactive@example.com', password: 'secret' })).rejects.toEqual(
      expect.objectContaining({ status: 403, message: MESSAGES.ACCOUNT_INACTIVE })
    )
  })

  it('throws 403 when account is locked', async () => {
    usersCollectionMock.findOne.mockResolvedValue({
      _id: new ObjectId(),
      email: 'locked@example.com',
      status: 2
    })

    await expect(login({ email: 'locked@example.com', password: 'secret' })).rejects.toEqual(
      expect.objectContaining({ status: 403, message: MESSAGES.ACCOUNT_LOCKED })
    )
  })

  it('throws 401 when password hash is missing', async () => {
    usersCollectionMock.findOne.mockResolvedValue({
      _id: new ObjectId(),
      email: 'nopass@example.com',
      status: 1,
      passwordHash: undefined
    })

    await expect(login({ email: 'nopass@example.com', password: 'secret' })).rejects.toEqual(
      expect.objectContaining({ status: 401, message: MESSAGES.INVALID_CREDENTIALS })
    )
  })

  it('throws 401 when password comparison fails', async () => {
    usersCollectionMock.findOne.mockResolvedValue({
      _id: new ObjectId(),
      email: 'wrongpass@example.com',
      status: 1,
      passwordHash: 'stored'
    })
    bcryptCompareMock.mockResolvedValue(false)

    await expect(login({ email: 'wrongpass@example.com', password: 'secret' })).rejects.toEqual(
      expect.objectContaining({ status: 401, message: MESSAGES.INVALID_CREDENTIALS })
    )
  })

  it('returns access and refresh tokens on success', async () => {
    const userId = new ObjectId()
    usersCollectionMock.findOne.mockResolvedValue({
      _id: userId,
      email: 'user@example.com',
      status: 1,
      passwordHash: 'stored'
    })
    bcryptCompareMock.mockResolvedValue(true)
    jwtSignMock.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token')

    const result = await login({ email: 'user@example.com', password: 'secret' })

    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' })
    expect(jwtSignMock).toHaveBeenNthCalledWith(
      1,
      { sub: String(userId), email: 'user@example.com', type: 'access' },
      'test-secret',
      { expiresIn: '30m' }
    )
    expect(jwtSignMock).toHaveBeenNthCalledWith(2, { sub: String(userId), type: 'refresh' }, 'test-secret', {
      expiresIn: '7d'
    })
  })
})

describe('auth.service register', () => {
  const basePayload = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '0123456789',
    identifyNumber: '123456789',
    gender: 'male' as const,
    address: '123 Street',
    dateOfBirth: '1990-01-01',
    password: 'Secret123'
  }

  beforeEach(() => {
    getUsersCollectionMock.mockReturnValue(usersCollectionMock as unknown as ReturnType<typeof getUsersCollection>)
    getRolesCollectionMock.mockReturnValue(rolesCollectionMock as unknown as ReturnType<typeof getRolesCollection>)
    usersCollectionMock.findOne.mockReset()
    usersCollectionMock.insertOne.mockReset()
    rolesCollectionMock.findOne.mockReset()
    rolesCollectionMock.insertOne.mockReset()
    bcryptHashMock.mockReset()
    getNextSequenceMock.mockReset()
  })

  it('throws when email already exists', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(register(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 409, message: MESSAGES.EMAIL_EXISTS })
    )
  })

  it('throws when phone number already exists', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(register(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 409, message: MESSAGES.PHONE_EXISTS })
    )
  })

  it('throws when identify number already exists', async () => {
    usersCollectionMock
      .findOne.mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(register(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 409, message: MESSAGES.IDENTIFY_NUMBER_EXISTS })
    )
  })

  it('creates user with existing default role', async () => {
    const roleId = new ObjectId()
    const insertedId = new ObjectId()

    usersCollectionMock
      .findOne.mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ patientId: 'P000123' })
    usersCollectionMock.insertOne.mockResolvedValue({ insertedId })
    rolesCollectionMock.findOne.mockResolvedValue({ _id: roleId })
    bcryptHashMock.mockResolvedValue('hashed')
    getNextSequenceMock.mockResolvedValue(123)

    const result = await register(basePayload)

    expect(getNextSequenceMock).toHaveBeenCalledWith('patientId')
    expect(bcryptHashMock).toHaveBeenCalledWith(basePayload.password, 10)
    expect(usersCollectionMock.insertOne).toHaveBeenCalled()
    expect(result).toMatchObject({
      id: insertedId,
      patientId: 'P000123',
      email: basePayload.email,
      roleId
    })
  })

  it('creates default role when missing', async () => {
    const insertedRoleId = new ObjectId()
    const userId = new ObjectId()

    usersCollectionMock
      .findOne.mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ patientId: 'P000456' })
    usersCollectionMock.insertOne.mockResolvedValue({ insertedId: userId })
    rolesCollectionMock
      .findOne.mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: insertedRoleId })
    rolesCollectionMock.insertOne.mockResolvedValue({ insertedId: insertedRoleId } as any)
    bcryptHashMock.mockResolvedValue('hashed')
    getNextSequenceMock.mockResolvedValue(456)

    const result = await register(basePayload)

    expect(rolesCollectionMock.insertOne).toHaveBeenCalled()
    expect(rolesCollectionMock.findOne).toHaveBeenCalledTimes(2)
    expect(result.roleId).toEqual(insertedRoleId)
  })
})

describe('auth.service forgotPassword', () => {
  const email = 'john@example.com'
  const userId = new ObjectId()

  beforeEach(() => {
    getUsersCollectionMock.mockReturnValue(usersCollectionMock as unknown as ReturnType<typeof getUsersCollection>)
    getPasswordResetCollectionMock.mockReturnValue(
      passwordResetCollectionMock as unknown as ReturnType<typeof getPasswordResetCollection>
    )
    usersCollectionMock.findOne.mockReset()
    passwordResetCollectionMock.deleteMany.mockReset()
    passwordResetCollectionMock.insertOne.mockReset()
    sendMailMock.mockReset()
    randomIntSpy.mockReset()
  })

  it('throws when email does not exist', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(forgotPassword(email)).rejects.toEqual(
      expect.objectContaining({ status: 404, message: MESSAGES.EMAIL_NOT_FOUND })
    )
  })

  it('creates reset token and sends email', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: userId })
    randomIntSpy.mockReturnValueOnce(654321)

    const result = await forgotPassword(email)

    expect(passwordResetCollectionMock.deleteMany).toHaveBeenCalledWith({ userId, used: false })
    expect(passwordResetCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        token: '654321',
        used: false
      })
    )
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email
      })
    )
    expect(result).toEqual({ email })
  })
})

describe('auth.service resetPassword', () => {
  const email = 'john@example.com'
  const userId = new ObjectId()
  const resetId = new ObjectId()

  beforeEach(() => {
    getUsersCollectionMock.mockReturnValue(usersCollectionMock as unknown as ReturnType<typeof getUsersCollection>)
    getPasswordResetCollectionMock.mockReturnValue(
      passwordResetCollectionMock as unknown as ReturnType<typeof getPasswordResetCollection>
    )
    usersCollectionMock.findOne.mockReset()
    usersCollectionMock.updateOne.mockReset()
    passwordResetCollectionMock.findOne.mockReset()
    passwordResetCollectionMock.updateOne.mockReset()
    bcryptHashMock.mockReset()
  })

  it('throws when email not found', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(resetPassword({ email, otp: '111111', newPassword: 'NewPass1' })).rejects.toEqual(
      expect.objectContaining({ status: 404, message: MESSAGES.EMAIL_NOT_FOUND })
    )
  })

  it('throws when reset token missing', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: userId })
    passwordResetCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(resetPassword({ email, otp: '111111', newPassword: 'NewPass1' })).rejects.toEqual(
      expect.objectContaining({ status: 400, message: MESSAGES.INVALID_RESET_TOKEN })
    )
  })

  it('throws when reset token expired', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: userId })
    passwordResetCollectionMock.findOne.mockResolvedValueOnce({
      _id: resetId,
      userId,
      token: '111111',
      used: false,
      expiresAt: new Date(Date.now() - 1000)
    })

    await expect(resetPassword({ email, otp: '111111', newPassword: 'NewPass1' })).rejects.toEqual(
      expect.objectContaining({ status: 400, message: MESSAGES.INVALID_RESET_TOKEN })
    )
  })

  it('updates password and marks token used', async () => {
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: userId, email })
    passwordResetCollectionMock.findOne.mockResolvedValueOnce({
      _id: resetId,
      userId,
      token: '111111',
      used: false,
      expiresAt: new Date(Date.now() + 1000)
    })
    bcryptHashMock.mockResolvedValueOnce('new-hash')

    const result = await resetPassword({ email, otp: '111111', newPassword: 'NewPass1' })

    expect(bcryptHashMock).toHaveBeenCalledWith('NewPass1', 10)
    expect(usersCollectionMock.updateOne).toHaveBeenCalledWith(
      { _id: userId },
      expect.objectContaining({ $set: expect.objectContaining({ passwordHash: 'new-hash' }) })
    )
    expect(passwordResetCollectionMock.updateOne).toHaveBeenCalledWith(
      { _id: resetId },
      { $set: { used: true } }
    )
    expect(result).toEqual({ email })
  })
})

describe('auth.service refreshAccessToken', () => {
  const makeUser = () => ({
    _id: new ObjectId(),
    email: 'user@example.com'
  })

  beforeEach(() => {
    getUsersCollectionMock.mockReturnValue(usersCollectionMock as unknown as ReturnType<typeof getUsersCollection>)
    usersCollectionMock.findOne.mockReset()
    jwtVerifyMock.mockReset()
    jwtSignMock.mockReset()
  })

  it('throws when refresh token missing', async () => {
    await expect(refreshAccessToken(undefined as unknown as string)).rejects.toEqual(
      expect.objectContaining({ status: 400, message: 'Refresh token is required' })
    )
  })

  it('throws when refresh token was revoked', async () => {
    const token = 'revoked-token'
    const payload = { sub: new ObjectId().toHexString(), type: 'refresh' }
    jwtVerifyMock.mockReturnValue(payload)
    await logout(token)

    await expect(refreshAccessToken(token)).rejects.toEqual(
      expect.objectContaining({ status: 401, message: 'Refresh token has been revoked' })
    )
  })

  it('throws when token type is invalid', async () => {
    const token = 'wrong-type'
    jwtVerifyMock.mockReturnValueOnce({ sub: new ObjectId().toHexString(), type: 'access' })

    await expect(refreshAccessToken(token)).rejects.toEqual(
      expect.objectContaining({ status: 401, message: 'Invalid refresh token' })
    )
  })

  it('throws when token subject is invalid', async () => {
    const token = 'bad-subject'
    jwtVerifyMock.mockReturnValueOnce({ sub: 'not-an-object-id', type: 'refresh' })

    await expect(refreshAccessToken(token)).rejects.toEqual(
      expect.objectContaining({ status: 401, message: 'Invalid token' })
    )
  })

  it('throws when user cannot be found', async () => {
    const token = 'missing-user'
    const sub = new ObjectId().toHexString()
    jwtVerifyMock.mockReturnValueOnce({ sub, type: 'refresh' })
    usersCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(refreshAccessToken(token)).rejects.toEqual(
      expect.objectContaining({ status: 401, message: 'User not found' })
    )
  })

  it('returns new access token when valid', async () => {
    const token = 'valid-refresh'
    const user = makeUser()
    jwtVerifyMock.mockReturnValueOnce({ sub: user._id.toHexString(), type: 'refresh' })
    usersCollectionMock.findOne.mockResolvedValueOnce(user)
    jwtSignMock.mockReturnValueOnce('new-access-token')

    const result = await refreshAccessToken(token)

    expect(jwtSignMock).toHaveBeenCalledWith(
      { sub: String(user._id), email: user.email, type: 'access' },
      'test-secret',
      { expiresIn: '30m' }
    )
    expect(result).toEqual({ accessToken: 'new-access-token' })
  })
})

