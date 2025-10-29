import { ObjectId, WithId } from 'mongodb'
import { getRolesCollection, type RoleDocument } from '~/models/role.model'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'

export interface CreateRolePayload {
  name: string
  code: string
  description?: string
  privileges?: string[]
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  privileges?: string[]
}

export const createRole = async (payload: CreateRolePayload): Promise<WithId<RoleDocument>> => {
  const roles = getRolesCollection()
  const exists = await roles.findOne({ code: payload.code } as any)
  if (exists) throw new HttpError(409, 'Role code already exists')
  const now = new Date()
  const doc: RoleDocument = {
    name: payload.name,
    code: payload.code,
    description: payload.description,
    privileges: payload.privileges && payload.privileges.length > 0 ? payload.privileges : ['read_only'],
    createdAt: now,
    updatedAt: now
  }
  const result = await roles.insertOne(doc as any)
  const created = await roles.findOne({ _id: result.insertedId } as any)
  if (!created) throw new HttpError(500, 'Failed to create role')
  return created as WithId<RoleDocument>
}

export const updateRole = async (id: string, payload: UpdateRolePayload): Promise<WithId<RoleDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid role id')
  }
  const roles = getRolesCollection()
  const update: Partial<RoleDocument> = { ...payload, updatedAt: new Date() }
  await roles.updateOne({ _id: objectId } as any, { $set: update })
  const updated = await roles.findOne({ _id: objectId } as any)
  if (!updated) throw new HttpError(404, 'Role not found')
  return updated as WithId<RoleDocument>
}

export interface ListRolesParams {
  search?: string
  sortBy?: 'name' | 'code' | 'createdAt'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export const listRoles = async (params: ListRolesParams) => {
  const roles = getRolesCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  const filter: Record<string, any> = {}
  if (params.search) {
    const q = params.search
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  }
  const sortField = params.sortBy || 'name'
  const sortOrder = params.sortOrder || 1
  const cursor = roles
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)
  const [items, total] = await Promise.all([cursor.toArray(), roles.countDocuments(filter as any)])
  return {
    roles: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export const ensureDefaultRoles = async () => {
  const roles = getRolesCollection()
  const now = new Date()
  const defaults: Array<Partial<RoleDocument> & { name: string; code: string }> = [
    { name: 'Administrator', code: 'admin', description: 'Access all features', privileges: ['*'] },
    {
      name: 'Lab Manager',
      code: 'lab_manager',
      description: 'Manage lab and users',
      privileges: [
        'view_role',
        'create_role',
        'update_role',
        'view_config',
        'create_config',
        'modify_config',
        'delete_config',
        'view_user',
        'modify_user',
        'delete_user',
        'lock_unlock_user',
        'add_comment',
        'modify_comment',
        'delete_comment',
        'review_test_order',
        'modify_test_order',
        'create_medical_record',
        'delete_medical_record',
        'review_medical_record',
        'modify_medical_record',
        'view_event_logs'
      ]
    },
    {
      name: 'Service',
      code: 'service',
      description: 'Operational and maintenance',
      privileges: [
        'view_role',
        'create_role',
        'view_config',
        'create_config',
        'modify_config',
        'delete_config',
        'view_instrument',
        'activate_instrument',
        'deactivate_instrument',
        'view_event_logs'
      ]
    },
    {
      name: 'Lab User',
      code: 'lab_user',
      description: 'Conduct tests and manage samples',
      privileges: [
        'read_only',
        'create_test_order',
        'delete_test_order',
        'view_config',
        'add_comment',
        'execute_blood_testing',
        'view_instrument',
        'create_medical_record',
        'delete_medical_record',
        'review_medical_record',
        'modify_medical_record'
      ]
    },
    { name: 'Patient ', code: 'patient', description: 'Default user role', privileges: ['read_only'] }
  ]
  for (const def of defaults) {
    const exists = await roles.findOne({ code: def.code } as any)
    if (!exists) {
      await roles.insertOne({
        name: def.name,
        code: def.code,
        description: def.description,
        privileges: (def.privileges as string[]) || ['read_only'],
        createdAt: now,
        updatedAt: now
      } as any)
    }
  }
}

export const deleteRole = async (id: string): Promise<WithId<RoleDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid role id')
  }

  const roles = getRolesCollection()
  const users = getUsersCollection()

  // Prevent deleting role that is still assigned to users
  const assigned = await users.findOne({ roleId: objectId } as any)
  if (assigned) {
    throw new HttpError(409, 'Role is assigned to one or more users')
  }

  const result = await roles.findOneAndDelete({ _id: objectId } as any)
  const deleted: any = (result as any)?.value ?? result
  if (!deleted) throw new HttpError(404, 'Role not found')
  return deleted as WithId<RoleDocument>
}
