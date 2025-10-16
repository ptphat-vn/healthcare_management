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

export async function listUsers() {
  const users = getUsersCollection()
  const roles = getRolesCollection()
  const allUsers = await users.find().toArray()
  if (!allUsers || allUsers.length === 0) throw new HttpError(404, MESSAGES.USERS_NOT_FOUND)
  const roleIds = Array.from(new Set(allUsers.map(u => u.roleId).filter(Boolean))) as any[]
  const roleDocs = roleIds.length ? await roles.find({ _id: { $in: roleIds } } as any).toArray() : []
  const idToRole = new Map<string, { code?: string; name?: string }>()
  for (const r of roleDocs as any[]) {
    idToRole.set(String(r._id), { code: r.code, name: r.name })
  }
  return allUsers.map((u: any) => {
    const { passwordHash, ...rest } = u
    const roleMeta = u.roleId ? idToRole.get(String(u.roleId)) : undefined
    return { ...rest, roleCode: roleMeta?.code, roleName: roleMeta?.name }
  })
}

export async function getUserDetail(id: string) {
  const users = getUsersCollection()
  const user = await users.findOne({ _id: new ObjectId(id) })
  if (!user) throw new HttpError(404, MESSAGES.USER_NOT_FOUND)
  const { passwordHash, ...safe } = user as any
  return safe
}

export async function searchUsers(searchParams: {
  search?: string
  role?: string
  status?: number
  page?: number
  limit?: number
}) {
  const users = getUsersCollection()
  
  // Build filter query
  const filter: any = {}
  
  // Search by email or fullName
  if (searchParams.search) {
    filter.$or = [
      { email: { $regex: searchParams.search, $options: 'i' } },
      { fullName: { $regex: searchParams.search, $options: 'i' } }
    ]
  }
  
  // Filter by role
  if (searchParams.role) {
    filter.role = searchParams.role
  }
  
  // Filter by status
  if (searchParams.status !== undefined) {
    filter.status = searchParams.status
  }
  
  // Pagination
  const page = searchParams.page || 1
  const limit = searchParams.limit || 10
  const skip = (page - 1) * limit
  
  // Get total count for pagination
  const totalCount = await users.countDocuments(filter)
  
  // Get users with pagination
  const allUsers = await users
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .toArray()
  
  // Remove password hash from results
  const safeUsers = allUsers.map(({ passwordHash, ...rest }) => rest)
  
  return {
    users: safeUsers,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    }
  }
}

 