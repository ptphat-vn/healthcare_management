import { ObjectId, WithId } from 'mongodb'
import { getReagentsCollection, type ReagentDocument, REAGENT_CATEGORIES } from '~/models/reagent.model'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'
import { generateUniqueCasNumber } from '~/utils/cas-lookup.util'

export interface CreateReagentPayload {
  name: string
  catalogNumber?: string
  manufacturer?: string
  casNumber?: string 
  description: string
  usagePerRun: {
    min: number
    max: number
    unit: 'ml' | 'μL' | 'L'
  }
  ratio?: string
  categories?: string[]
  storageCondition?: number
}

export interface UpdateReagentPayload {
  name?: string
  catalogNumber?: string
  manufacturer?: string
  casNumber?: string
  description?: string
  usagePerRun?: {
    min: number
    max: number
    unit: 'ml' | 'μL' | 'L'
  }
  ratio?: string
  categories?: string[]
  storageCondition?: number
  isActive?: boolean
}

export interface ListReagentsParams {
  search?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
  isActive?: boolean
}

export const createReagent = async (
  payload: CreateReagentPayload,
  createdBy: string
): Promise<WithId<ReagentDocument>> => {
  const reagents = getReagentsCollection()
  
  let createdByObjectId: ObjectId
  try {
    createdByObjectId = new ObjectId(createdBy)
  } catch (error) {
    console.error('Invalid createdBy ObjectId:', createdBy, error)
    throw new HttpError(400, 'Invalid user ID')
  }
  
  // Check if name already exists
  const existsByName = await reagents.findOne({ name: payload.name } as any)
  if (existsByName) {
    throw new HttpError(409, 'Reagent with this name already exists')
  }

  let casNumber = payload.casNumber?.trim() || ''
  
  // If CAS Number is not provided, automatically generate a unique random CAS Number
  if (!casNumber) {
    try {
      casNumber = await generateUniqueCasNumber(async (cas: string) => {
        const exists = await reagents.findOne({ casNumber: cas } as any)
        return !!exists
      })
    } catch (error) {
      console.error('Error generating unique CAS Number:', error)
      throw new HttpError(500, `Failed to generate unique CAS Number: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or provide CAS Number manually.`)
    }
  } else {
    // Check if manually provided CAS Number already exists
    const existsByCasNumber = await reagents.findOne({ casNumber: casNumber } as any)
    if (existsByCasNumber) {
      throw new HttpError(409, 'Reagent with this CAS Number already exists')
    }
  }

  if (payload.categories && payload.categories.length > 0) {
    // Filter out empty strings and null/undefined values
    payload.categories = payload.categories.filter(cat => cat && typeof cat === 'string' && cat.trim() !== '')
    
    if (payload.categories.length > 0) {
      const invalidCategories = payload.categories.filter(cat => !REAGENT_CATEGORIES.includes(cat as any))
      if (invalidCategories.length > 0) {
        throw new HttpError(400, `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${REAGENT_CATEGORIES.join(', ')}`)
      }
      
      // Remove duplicates
      payload.categories = [...new Set(payload.categories)]
    } else {
      // If all categories were filtered out, set to undefined
      payload.categories = undefined
    }
  }

  const now = new Date()
  const doc: ReagentDocument = {
    name: payload.name,
    catalogNumber: payload.catalogNumber,
    manufacturer: payload.manufacturer,
    casNumber: casNumber,
    description: payload.description,
    usagePerRun: payload.usagePerRun,
    ratio: payload.ratio,
    categories: payload.categories,
    storageCondition: payload.storageCondition,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: createdByObjectId
  }

  let created: WithId<ReagentDocument>
  try {
    const result = await reagents.insertOne(doc as any)
    const found = await reagents.findOne({ _id: result.insertedId } as any)
    if (!found) {
      throw new HttpError(500, 'Failed to create reagent')
    }
    created = found as WithId<ReagentDocument>
  } catch (error) {
    console.error('Error creating reagent:', error)
    if (error instanceof HttpError) {
      throw error
    }
    throw new HttpError(500, `Failed to create reagent: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Event log
  try {
    const eventLogs = getEventLogsCollection()
    const users = getUsersCollection()
    const actor = await users.findOne({ _id: createdByObjectId } as any)
    const roleCol = getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || 'system',
        name: actor?.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
      action: 'CREATE_REAGENT',
      details: `Created reagent: ${created.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return created as WithId<ReagentDocument>
}

export const listReagents = async (params: ListReagentsParams) => {
  const reagents = getReagentsCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  const filter: Record<string, any> = {}

  if (params.search) {
    const q = params.search
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { catalogNumber: { $regex: q, $options: 'i' } },
      { manufacturer: { $regex: q, $options: 'i' } }
    ]
  }

  if (params.isActive !== undefined) {
    filter.isActive = params.isActive
  }

  const sortField = params.sortBy || 'updatedAt'
  const sortOrder = params.sortOrder || -1

  const cursor = reagents
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)

  const [items, total] = await Promise.all([cursor.toArray(), reagents.countDocuments(filter as any)])

  return {
    reagents: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export const getReagentById = async (id: string): Promise<WithId<ReagentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  const reagents = getReagentsCollection()
  const reagent = await reagents.findOne({ _id: objectId } as any)
  if (!reagent) {
    throw new HttpError(404, 'Reagent not found')
  }

  return reagent as WithId<ReagentDocument>
}

export const updateReagent = async (
  id: string,
  payload: UpdateReagentPayload,
  updatedBy: string
): Promise<WithId<ReagentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  const reagents = getReagentsCollection()
  const existing = await reagents.findOne({ _id: objectId } as any)
  if (!existing) {
    throw new HttpError(404, 'Reagent not found')
  }

  if (payload.name && payload.name !== existing.name) {
    const nameExists = await reagents.findOne({ name: payload.name, _id: { $ne: objectId } } as any)
    if (nameExists) {
      throw new HttpError(409, 'Reagent with this name already exists')
    }
  }

  if (payload.casNumber && payload.casNumber !== existing.casNumber) {
    const casNumberExists = await reagents.findOne({ casNumber: payload.casNumber, _id: { $ne: objectId } } as any)
    if (casNumberExists) {
      throw new HttpError(409, 'Reagent with this CAS Number already exists')
    }
  }

  if (payload.categories !== undefined) {
    if (payload.categories.length > 0) {
      const invalidCategories = payload.categories.filter(cat => !REAGENT_CATEGORIES.includes(cat as any))
      if (invalidCategories.length > 0) {
        throw new HttpError(400, `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${REAGENT_CATEGORIES.join(', ')}`)
      }
      payload.categories = [...new Set(payload.categories)]
    }
  }

  const updatedByObjectId = new ObjectId(updatedBy)
  const now = new Date()
  const update: Partial<ReagentDocument> = {
    ...payload,
    updatedAt: now,
    lastModifiedBy: updatedByObjectId
  }

  await reagents.updateOne({ _id: objectId } as any, { $set: update })
  const updated = await reagents.findOne({ _id: objectId } as any)
  if (!updated) {
    throw new HttpError(404, 'Reagent not found after update')
  }

  // Event log
  try {
    const eventLogs = getEventLogsCollection()
    const users = getUsersCollection()
    const actor = await users.findOne({ _id: updatedByObjectId } as any)
    const roleCol = getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || 'system',
        name: actor?.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
      action: 'UPDATE_REAGENT',
      details: `Updated reagent: ${updated.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated as WithId<ReagentDocument>
}

export const deleteReagent = async (id: string, deletedBy: string): Promise<WithId<ReagentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  const reagents = getReagentsCollection()
  const existing = await reagents.findOne({ _id: objectId } as any)
  if (!existing) {
    throw new HttpError(404, 'Reagent not found')
  }

  const result = await reagents.findOneAndDelete({ _id: objectId } as any)
  const deleted: any = (result as any)?.value ?? result
  if (!deleted) {
    throw new HttpError(404, 'Reagent not found')
  }

  // Event log
  try {
    const eventLogs = getEventLogsCollection()
    const users = getUsersCollection()
    const deletedByObjectId = new ObjectId(deletedBy)
    const actor = await users.findOne({ _id: deletedByObjectId } as any)
    const roleCol = getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: actor?._id || 'system',
        name: actor?.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
      action: 'DELETE_REAGENT',
      details: `Deleted reagent: ${deleted.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return deleted as WithId<ReagentDocument>
}

export const ensureDefaultReagents = async () => {
  const reagents = getReagentsCollection()
  const now = new Date()
  let systemUserId: ObjectId
  try {

    const users = getUsersCollection()
    const roles = getRolesCollection()
    const adminRole = await roles.findOne({ code: 'admin' } as any)
    if (adminRole) {
      const adminUser = await users.findOne({ roleId: adminRole._id } as any)
      if (adminUser) {
        systemUserId = adminUser._id as ObjectId
      } else {
        systemUserId = new ObjectId('000000000000000000000000') // System ID
      }
    } else {
      systemUserId = new ObjectId('000000000000000000000000') // System ID
    }
  } catch {
    systemUserId = new ObjectId('000000000000000000000000') // System ID
  }

  const defaults: Array<Partial<ReagentDocument> & { name: string; casNumber: string; description: string; usagePerRun: { min: number; max: number; unit: 'ml' | 'μL' | 'L' } }> = [
    {
      name: 'Diluent',
      catalogNumber: 'DL-100',
      manufacturer: 'Acme Diagnostics',
      casNumber: '7732-18-5',
      description: 'Typically used in a 1:10 to 1:20 ratio with blood samples to maintain cell integrity. Used to dilute blood samples to ensure accurate counting of blood cells.',
      usagePerRun: {
        min: 1,
        max: 2,
        unit: 'ml'
      },
      ratio: '1:10 to 1:20',
      categories: ['Hematology'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    },
    {
      name: 'Lysing',
      catalogNumber: 'LY-200',
      manufacturer: 'Acme Diagnostics',
      casNumber: '12125-02-9',
      description: 'Often added in precise microliter amounts (e.g., 50–200 µL) to break down red blood cells for white blood cell analysis.',
      usagePerRun: {
        min: 50,
        max: 200,
        unit: 'μL'
      },
      categories: ['Biochemistry'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    },
    {
      name: 'Staining',
      catalogNumber: 'ST-300',
      manufacturer: 'Acme Diagnostics',
      casNumber: '7220-79-3',
      description: 'Used to stain specific blood components, such as reticulocytes for differential analysis.',
      usagePerRun: {
        min: 50,
        max: 100,
        unit: 'μL'
      },
      categories: ['Immunology'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    },
    {
      name: 'Clotting',
      catalogNumber: 'CL-400',
      manufacturer: 'Acme Diagnostics',
      casNumber: '25102-12-9',
      description: 'Prevents the sample from clotting to allow smooth flow through the analyser.',
      usagePerRun: {
        min: 50,
        max: 100,
        unit: 'μL'
      },
      categories: ['Molecular/PCR'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    },
    {
      name: 'Cleaner',
      catalogNumber: 'CR-500',
      manufacturer: 'Acme Diagnostics',
      casNumber: '7681-52-9',
      description: 'Clean the sample tubing, preventing contamination and clotting.',
      usagePerRun: {
        min: 1,
        max: 2,
        unit: 'ml'
      },
      categories: ['Microbiology'],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: systemUserId
    }
  ]

  for (const def of defaults) {
    const exists = await reagents.findOne({ name: def.name } as any)
    if (!exists) {
      await reagents.insertOne({
        name: def.name,
        catalogNumber: def.catalogNumber,
        manufacturer: def.manufacturer,
        casNumber: def.casNumber,
        description: def.description,
        usagePerRun: def.usagePerRun,
        ratio: def.ratio,
        categories: def.categories,
        storageCondition: def.storageCondition,
        isActive: def.isActive,
        createdAt: def.createdAt,
        updatedAt: def.updatedAt,
        createdBy: def.createdBy
      } as any)
    }
  }
}
