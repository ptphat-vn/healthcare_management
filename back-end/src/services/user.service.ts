import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getUsersCollection } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'
import { getEventLogsCollection } from '~/models/event-log.model'

import cloudinary from '~/configs/cloundinary.config'
import fs from 'fs'
export async function updateUser(id: string, updatePayload: Record<string, unknown>, performedBy?: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()
  const roles = getRolesCollection()

  if (updatePayload.email) {
    const dupEmail = await users.findOne({ email: updatePayload.email, _id: { $ne: userObjectId } as any })
    if (dupEmail) throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
  }
  if (updatePayload.phoneNumber) {
    const dupPhone = await users.findOne({ phoneNumber: updatePayload.phoneNumber, _id: { $ne: userObjectId } as any })
    if (dupPhone) throw new HttpError(409, MESSAGES.PHONE_EXISTS)
  }

  if (updatePayload.roleId) {
    let roleObjectId: ObjectId
    try {
      roleObjectId = new ObjectId(updatePayload.roleId as string)
    } catch {
      throw new HttpError(400, 'Invalid role ID')
    }

    const roleExists = await roles.findOne({ _id: roleObjectId } as any)
    if (!roleExists) {
      throw new HttpError(404, 'Role not found')
    }
    updatePayload.roleId = roleObjectId
  }

  const now = new Date()
  const result = await users.findOneAndUpdate(
    { _id: userObjectId } as any,
    { $set: { ...updatePayload, updatedAt: now } },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, 'User not found')
  // event log - use performer as operator when provided
  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = performedBy ? await usersCol.findOne({ _id: new ObjectId(performedBy) } as any) : null
    const rolesCol = getRolesCollection()
    const roleDoc = updated.roleId ? await rolesCol.findOne({ _id: updated.roleId } as any) : null
    const actorRoleCode = actor?.roleId ? (await rolesCol.findOne({ _id: actor.roleId } as any))?.code || '' : ''
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || (updated._id as any),
        name: actor?.fullName || updated.fullName || '',
        role: actorRoleCode || roleDoc?.code || ''
      },
      action: 'USER_UPDATED',
      details: `Updated user: ${updated.fullName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  const { passwordHash, ...safe } = updated as any
  return safe
}

export async function updateUserStatus(id: string, status: 0 | 1 | 2, performedBy?: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()
  const result = await users.findOneAndUpdate(
    { _id: userObjectId } as any,
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, 'User not found')

  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = performedBy ? await usersCol.findOne({ _id: new ObjectId(performedBy) } as any) : null
    const actionMap: Record<0 | 1 | 2, string> = { 0: 'USER_INACTIVE', 1: 'USER_ACTIVE', 2: 'USER_LOCKED' }
    const rolesCol = getRolesCollection()
    const roleDoc = updated.roleId ? await rolesCol.findOne({ _id: updated.roleId } as any) : null
    const actorRoleCode = actor?.roleId ? (await rolesCol.findOne({ _id: actor.roleId } as any))?.code || '' : ''
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || (updated._id as any),
        name: actor?.fullName || updated.fullName || '',
        role: actorRoleCode || roleDoc?.code || ''
      },
      action: actionMap[status],
      details: `User status set to ${status} for ${updated.fullName}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  const { passwordHash, ...safe } = updated as any
  return safe
}
export async function deleteUser(id: string, performedBy?: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()
  const result = await users.findOneAndUpdate(
    { _id: userObjectId } as any,
    { $set: { status: 0, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, 'User not found')

  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = performedBy ? await usersCol.findOne({ _id: new ObjectId(performedBy) } as any) : null
    const rolesCol = getRolesCollection()
    const roleDoc = updated.roleId ? await rolesCol.findOne({ _id: updated.roleId } as any) : null
    const actorRoleCode = actor?.roleId ? (await rolesCol.findOne({ _id: actor.roleId } as any))?.code || '' : ''
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || (updated._id as any),
        name: actor?.fullName || updated.fullName || '',
        role: actorRoleCode || roleDoc?.code || ''
      },
      action: 'USER_INACTIVE',
      details: `User deleted: ${updated.fullName}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  const { passwordHash, ...safe } = updated as any
  return safe
}

export async function blockUser(id: string, performedBy?: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()
  const result = await users.findOneAndUpdate(
    { _id: userObjectId } as any,
    { $set: { status: 2, updatedAt: new Date() } },
    { returnDocument: 'after' }
  )
  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, 'User not found')

  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = performedBy ? await usersCol.findOne({ _id: new ObjectId(performedBy) } as any) : null
    const rolesCol = getRolesCollection()
    const roleDoc = updated.roleId ? await rolesCol.findOne({ _id: updated.roleId } as any) : null
    const actorRoleCode = actor?.roleId ? (await rolesCol.findOne({ _id: actor.roleId } as any))?.code || '' : ''
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || (updated._id as any),
        name: actor?.fullName || updated.fullName || '',
        role: actorRoleCode || roleDoc?.code || ''
      },
      action: 'USER_LOCKED',
      details: `User blocked: ${updated.fullName}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  const { passwordHash, ...safe } = updated as any
  return safe
}

export interface ListUsersParams {
  search?: string
  status?: number
  sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export const listUsers = async (params: ListUsersParams) => {
  const users = getUsersCollection()
  const roles = getRolesCollection()

  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit

  // Build filter query
  const filter: Record<string, any> = {}

  // Search by email, fullName, or phoneNumber
  if (params.search) {
    const q = params.search
    filter.$or = [
      { email: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
      { phoneNumber: { $regex: q, $options: 'i' } }
    ]
  }

  // Filter by status
  if (params.status !== undefined) {
    filter.status = params.status
  }

  // Sorting
  const sortField = params.sortBy || 'createdAt'
  const sortOrder = params.sortOrder || -1

  // Get users with pagination
  const cursor = users
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)
  const [userItems, total] = await Promise.all([cursor.toArray(), users.countDocuments(filter as any)])

  // Get role information for users
  const roleIds = Array.from(new Set(userItems.map((u) => u.roleId).filter(Boolean))) as any[]
  const roleDocs = roleIds.length ? await roles.find({ _id: { $in: roleIds } } as any).toArray() : []
  const idToRole = new Map<string, { code?: string; name?: string }>()
  for (const r of roleDocs as any[]) {
    idToRole.set(String(r._id), { code: r.code, name: r.name })
  }

  // Remove password hash and add role information
  const safeUsers = userItems.map((u: any) => {
    const { passwordHash, ...rest } = u
    const roleMeta = u.roleId ? idToRole.get(String(u.roleId)) : undefined
    return { ...rest, roleCode: roleMeta?.code, roleName: roleMeta?.name }
  })

  return {
    users: safeUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export interface ListUsersByRoleParams extends ListUsersParams {
  roleCodes?: string[]
}

export const listUsersByRoleCodes = async (params: ListUsersByRoleParams) => {
  const users = getUsersCollection()
  const roles = getRolesCollection()

  let roleIds: any[] | undefined
  if (params.roleCodes && params.roleCodes.length) {
    const roleDocs = await roles.find({ code: { $in: params.roleCodes } } as any).toArray()
    roleIds = roleDocs.map((r: any) => r._id)
  }

  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit

  const filter: Record<string, any> = {}

  if (params.search) {
    const q = params.search
    filter.$or = [
      { email: { $regex: q, $options: 'i' } },
      { fullName: { $regex: q, $options: 'i' } },
      { phoneNumber: { $regex: q, $options: 'i' } }
    ]
  }

  if (params.status !== undefined) {
    filter.status = params.status
  }

  if (roleIds && roleIds.length) {
    filter.roleId = { $in: roleIds as any }
  }

  const cursor = users.find(filter as any).sort({ createdAt: -1 } as any).skip(skip).limit(limit)
  const [userItems, total] = await Promise.all([cursor.toArray(), users.countDocuments(filter as any)])

  const usedRoleIds = Array.from(new Set(userItems.map((u) => u.roleId).filter(Boolean))) as any[]
  const roleDocs = usedRoleIds.length ? await roles.find({ _id: { $in: usedRoleIds } } as any).toArray() : []
  const idToRole = new Map<string, { code?: string; name?: string }>()
  for (const r of roleDocs as any[]) {
    idToRole.set(String(r._id), { code: r.code, name: r.name })
  }

  const safeUsers = userItems.map((u: any) => {
    const { passwordHash, ...rest } = u
    const roleMeta = u.roleId ? idToRole.get(String(u.roleId)) : undefined
    return { ...rest, roleCode: roleMeta?.code, roleName: roleMeta?.name }
  })

  return {
    users: safeUsers,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
  }
}

export async function getUserDetail(id: string) {
  const userId = new ObjectId(id)
  const user = await getUsersCollection().findOne({ _id: userId })
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)

  const role = user.roleId ? await getRolesCollection().findOne({ _id: user.roleId }) : null
  const { passwordHash, roleId, ...safeUser } = user

  return { ...safeUser, roleName: role?.name ?? null }
}

export const updateAvatarService = async (userId: string, file: Express.Multer.File) => {
  const users = getUsersCollection()
  const objectId = new ObjectId(userId)
  const user = await users.findOne({ _id: objectId })
  if (!user) throw new Error('User not found!')
  if (!file) throw new Error('No file uploaded!!')

  let avatarUrl = ''
  let avatarPublicId = ''
  if (cloudinary && file.path) {
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId)
      } catch (error) {
        console.warn(error)
      }
    }
    const result = await cloudinary.uploader.upload(file.path, { folder: 'avatars' })
    ;(((avatarUrl = result.secure_url), (avatarPublicId = result.public_id)), fs.unlinkSync(file.path))
  } else {
    avatarUrl = `/uploads/${file.filename}`
  }

  await users.updateOne({ _id: objectId }, { $set: { avatar: avatarUrl, avatarPublicId, updatedAt: new Date() } })

  return avatarUrl
}
