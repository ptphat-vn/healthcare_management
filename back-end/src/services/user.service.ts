import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getUsersCollection } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'
import { getEventLogsCollection } from '~/models/event-log.model'

export async function updateUser(id: string, updatePayload: Record<string, unknown>) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()

  if (updatePayload.email) {
    const dupEmail = await users.findOne({ email: updatePayload.email, _id: { $ne: userObjectId } as any })
    if (dupEmail) throw new HttpError(409, MESSAGES.EMAIL_EXISTS)
  }
  if (updatePayload.phoneNumber) {
    const dupPhone = await users.findOne({ phoneNumber: updatePayload.phoneNumber, _id: { $ne: userObjectId } as any })
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

  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({ userId: updated._id as any, action: 'USER_UPDATED', details: 'User information updated', timestamp: now })

  const { passwordHash, ...safe } = updated as any
  return safe
}

export async function updateUserStatus(id: string, status: 0 | 1 | 2) {
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

  const eventLogs = getEventLogsCollection()
  const actionMap: Record<0 | 1 | 2, string> = { 0: 'USER_INACTIVE', 1: 'USER_ACTIVE', 2: 'USER_LOCKED' }
  await eventLogs.insertOne({ userId: updated._id as any, action: actionMap[status], details: `User status set to ${status}`, timestamp: new Date() })

  const { passwordHash, ...safe } = updated as any
  return safe
}
export async function deleteUser(id: string) {
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

  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({ userId: updated._id as any, action: 'USER_INACTIVE', details: 'User soft-deleted (status=0)', timestamp: new Date() })

  const { passwordHash, ...safe } = updated as any
  return safe
}

export async function blockUser(id: string) {
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

  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({ userId: updated._id as any, action: 'USER_LOCKED', details: 'User blocked (status=2)', timestamp: new Date() })

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
  const cursor = users.find(filter as any).sort({ [sortField]: sortOrder } as any).skip(skip).limit(limit)
  const [userItems, total] = await Promise.all([
    cursor.toArray(),
    users.countDocuments(filter as any),
  ])
  
  // Get role information for users
  const roleIds = Array.from(new Set(userItems.map(u => u.roleId).filter(Boolean))) as any[]
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
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function getUserDetail(id: string) {
  const users = getUsersCollection()
  const user = await users.findOne({ _id: new ObjectId(id) })
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)
  const { passwordHash, ...safe } = user as any
  return safe
}


export async function deleteUserRole(id: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, "Invalid user id")
  }

  const users = getUsersCollection()
// Check user exists
  const user = await users.findOne({_id: userObjectId})
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)

// Update role user to null
  const now = new Date() 
  const result = await users.findOneAndUpdate(
    { _id: userObjectId },
    { $unset: { role: 1 }, $set: { updatedAt: now } },
    { returnDocument: 'after' }
  )
  // Check user updated
  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, 'User not found')

  // Event log
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: updated._id,
    action: 'USER_ROLE_DELETED',
    details: 'User role deleted',
    timestamp: now
  })

  const { passwordHash, ...safe } = updated
  return safe
}

export async function banUser(id: string, adminId?: string) {
  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid user id')
  }

  const users = getUsersCollection()
  const user = await users.findOne({ _id: userObjectId } as any)
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)

  const prevStatus = user.status
  const now = new Date()
  const result = await users.findOneAndUpdate(
    { _id: userObjectId } as any,
    { $set: { status: 2, updatedAt: now } }, // 2 = ban
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)
// Event log
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: updated._id as any,
    action: 'USER_LOCKED',
    details: `User locked by admin ${adminId ?? 'system'}`,
    timestamp: now
  })

  const { passwordHash, ...safe } = updated as any
  return safe
}
