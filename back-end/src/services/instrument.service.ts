import { ObjectId, WithId } from 'mongodb'
import { getInstrumentsCollection, type InstrumentDocument } from '~/models/instrument.model'
import { getInstrumentReagentAssignmentCollection } from '~/models/instrument-reagent-assignment.model'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'

export interface CreateInstrumentPayload {
  name: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  location?: string
  description?: string
  status?: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
}

export interface UpdateInstrumentPayload {
  name?: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  location?: string
  description?: string
  isActive?: boolean
  status?: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
}

export interface ListInstrumentsParams {
  search?: string
  status?: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
  isActive?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export const createInstrument = async (
  payload: CreateInstrumentPayload,
  createdBy: string
): Promise<WithId<InstrumentDocument>> => {
  const instruments = getInstrumentsCollection()
  const createdByObjectId = new ObjectId(createdBy)
  
  const exists = await instruments.findOne({ name: payload.name } as any)
  if (exists) {
    throw new HttpError(409, 'Instrument with this name already exists')
  }

  const now = new Date()
  const doc: InstrumentDocument = {
    name: payload.name,
    model: payload.model,
    manufacturer: payload.manufacturer,
    serialNumber: payload.serialNumber,
    location: payload.location,
    description: payload.description,
    isActive: true,
    status: payload.status || 'Active',
    createdAt: now,
    updatedAt: now,
    createdBy: createdByObjectId
  }

  const result = await instruments.insertOne(doc as any)
  const created = await instruments.findOne({ _id: result.insertedId } as any)
  if (!created) {
    throw new HttpError(500, 'Failed to create instrument')
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
      action: 'CREATE_INSTRUMENT',
      details: `Created instrument: ${created.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return created as WithId<InstrumentDocument>
}

export const listInstruments = async (params: ListInstrumentsParams) => {
  const instruments = getInstrumentsCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  const filter: Record<string, any> = {}

  if (params.search) {
    const q = params.search
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { manufacturer: { $regex: q, $options: 'i' } },
      { serialNumber: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  }

  if (params.status) {
    filter.status = params.status
  }

  if (params.isActive !== undefined) {
    filter.isActive = params.isActive
  }

  const sortField = params.sortBy || 'updatedAt'
  const sortOrder = params.sortOrder || -1

  const cursor = instruments
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)

  const [items, total] = await Promise.all([cursor.toArray(), instruments.countDocuments(filter as any)])

  return {
    instruments: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export const getInstrumentById = async (id: string): Promise<WithId<InstrumentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid instrument id')
  }

  const instruments = getInstrumentsCollection()
  const instrument = await instruments.findOne({ _id: objectId } as any)
  if (!instrument) {
    throw new HttpError(404, 'Instrument not found')
  }

  return instrument as WithId<InstrumentDocument>
}

export const updateInstrument = async (
  id: string,
  payload: UpdateInstrumentPayload,
  updatedBy: string
): Promise<WithId<InstrumentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid instrument id')
  }

  const instruments = getInstrumentsCollection()
  const existing = await instruments.findOne({ _id: objectId } as any)
  if (!existing) {
    throw new HttpError(404, 'Instrument not found')
  }

  if (payload.name && payload.name !== existing.name) {
    const nameExists = await instruments.findOne({ name: payload.name, _id: { $ne: objectId } } as any)
    if (nameExists) {
      throw new HttpError(409, 'Instrument with this name already exists')
    }
  }

  const updatedByObjectId = new ObjectId(updatedBy)
  const now = new Date()
  const update: Partial<InstrumentDocument> = {
    ...payload,
    updatedAt: now,
    lastModifiedBy: updatedByObjectId
  }

  await instruments.updateOne({ _id: objectId } as any, { $set: update })
  const updated = await instruments.findOne({ _id: objectId } as any)
  if (!updated) {
    throw new HttpError(404, 'Instrument not found after update')
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
      action: 'UPDATE_INSTRUMENT',
      details: `Updated instrument: ${updated.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated as WithId<InstrumentDocument>
}

export const deleteInstrument = async (id: string, deletedBy: string): Promise<WithId<InstrumentDocument>> => {
  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid instrument id')
  }

  const instruments = getInstrumentsCollection()
  const existing = await instruments.findOne({ _id: objectId } as any)
  if (!existing) {
    throw new HttpError(404, 'Instrument not found')
  }

  // Check if instrument has active reagent assignments
  const assignments = getInstrumentReagentAssignmentCollection()
  const activeAssignments = await assignments.findOne({
    instrumentId: objectId,
    isActive: true
  } as any)
  if (activeAssignments) {
    throw new HttpError(409, 'Cannot delete instrument with active reagent assignments')
  }

  const result = await instruments.findOneAndDelete({ _id: objectId } as any)
  const deleted: any = (result as any)?.value ?? result
  if (!deleted) {
    throw new HttpError(404, 'Instrument not found')
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
      action: 'DELETE_INSTRUMENT',
      details: `Deleted instrument: ${deleted.name}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return deleted as WithId<InstrumentDocument>
}

