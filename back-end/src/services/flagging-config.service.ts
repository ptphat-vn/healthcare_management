import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getFlaggingConfigCollection, FlaggingConfiguration } from '~/models/test-order.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'

export interface CreateFlaggingConfigData {
  testName: string
  normalRange: {
    min: number
    max: number
  }
  abnormalRange?: {
    min?: number
    max?: number
  }
  criticalRange?: {
    min?: number
    max?: number
  }
  unit: string
  flag: string
}

export interface UpdateFlaggingConfigData {
  testName?: string
  normalRange?: {
    min: number
    max: number
  }
  abnormalRange?: {
    min?: number
    max?: number
  }
  criticalRange?: {
    min?: number
    max?: number
  }
  unit?: string
  flag?: string
  isActive?: boolean
}

export async function createFlaggingConfig(data: CreateFlaggingConfigData, createdBy: string) {
  const flaggingConfigs = getFlaggingConfigCollection()
  const eventLogs = getEventLogsCollection()

  const now = new Date()
  const config: FlaggingConfiguration = {
    _id: new ObjectId(),
    testName: data.testName,
    normalRange: data.normalRange,
    abnormalRange: data.abnormalRange || { min: undefined, max: undefined },
    criticalRange: data.criticalRange || { min: undefined, max: undefined },
    unit: data.unit,
    flag: data.flag,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }

  const result = await flaggingConfigs.insertOne(config)
  
  // Log the event

    if (createdBy === 'system') {
      await eventLogs.insertOne({ operator: { id: 'system', name: 'system', role: 'system' }, action: 'FLAGGING_CONFIG_CREATED', details: `Created flagging configuration for test: ${data.testName}`, timestamp: now } as any)
    } else {
      const usersCol = getUsersCollection()
      const actor = await usersCol.findOne({ _id: new ObjectId(createdBy) })
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await eventLogs.insertOne({ operator: { id: new ObjectId(createdBy), name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'FLAGGING_CONFIG_CREATED', details: `Created flagging configuration for test: ${data.testName}`, timestamp: now } as any)
    }
  

  const { _id, ...configWithoutId } = config
  return { _id: result.insertedId, ...configWithoutId }
}

export async function updateFlaggingConfig(id: string, data: UpdateFlaggingConfigData, updatedBy: string) {
  let configObjectId: ObjectId
  try {
    configObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid flagging configuration id')
  }

  const flaggingConfigs = getFlaggingConfigCollection()
  const eventLogs = getEventLogsCollection()

  const now = new Date()
  const result = await flaggingConfigs.findOneAndUpdate(
    { _id: configObjectId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, 'Flagging configuration not found')
  }

  // Log the event
  
    if (updatedBy === 'system') {
      await eventLogs.insertOne({ operator: { id: 'system', name: 'system', role: 'system' }, action: 'FLAGGING_CONFIG_UPDATED', details: `Updated flagging configuration for test: ${updated.testName}`, timestamp: now } as any)
    } else {
      const usersCol = getUsersCollection()
      const actor = await usersCol.findOne({ _id: new ObjectId(updatedBy) })
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await eventLogs.insertOne({ operator: { id: new ObjectId(updatedBy), name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'FLAGGING_CONFIG_UPDATED', details: `Updated flagging configuration for test: ${updated.testName}`, timestamp: now } as any)
    }
  

  return updated
}

export async function deleteFlaggingConfig(id: string, deletedBy: string) {
  let configObjectId: ObjectId
  try {
    configObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid flagging configuration id')
  }

  const flaggingConfigs = getFlaggingConfigCollection()
  const eventLogs = getEventLogsCollection()

  const config = await flaggingConfigs.findOne({ _id: configObjectId })
  if (!config) {
    throw new HttpError(404, 'Flagging configuration not found')
  }

  await flaggingConfigs.deleteOne({ _id: configObjectId })

  // Log the event
  
    if (deletedBy === 'system') {
      await eventLogs.insertOne({ operator: { id: 'system', name: 'system', role: 'system' }, action: 'FLAGGING_CONFIG_DELETED', details: `Deleted flagging configuration for test: ${config.testName}`, timestamp: new Date() } as any)
    } else {
      const usersCol = getUsersCollection()
      const actor = await usersCol.findOne({ _id: new ObjectId(deletedBy) })
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await eventLogs.insertOne({ operator: { id: new ObjectId(deletedBy), name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'FLAGGING_CONFIG_DELETED', details: `Deleted flagging configuration for test: ${config.testName}`, timestamp: new Date() } as any)
    }
 

  return { message: 'Flagging configuration deleted successfully' }
}

export async function getAllFlaggingConfigs() {
  const flaggingConfigs = getFlaggingConfigCollection()
  const configs = await flaggingConfigs.find({}).sort({ testName: 1 }).toArray()
  return configs
}

export async function getActiveFlaggingConfigs() {
  const flaggingConfigs = getFlaggingConfigCollection()
  const configs = await flaggingConfigs.find({ isActive: true }).sort({ testName: 1 }).toArray()
  return configs
}

export async function getFlaggingConfigByTestName(testName: string) {
  const flaggingConfigs = getFlaggingConfigCollection()
  const config = await flaggingConfigs.findOne({ testName, isActive: true })
  return config
}

// Initialize default flagging configurations
export async function initializeDefaultFlaggingConfigs() {
  const flaggingConfigs = getFlaggingConfigCollection()
  
  const defaultConfigs: CreateFlaggingConfigData[] = [
    {
      testName: 'Hemoglobin',
      normalRange: { min: 12.0, max: 16.0 },
      abnormalRange: { min: 10.0, max: 18.0 },
      criticalRange: { min: 8.0, max: 20.0 },
      unit: 'g/dL',
      flag: 'HGB'
    },
    {
      testName: 'White Blood Cell Count',
      normalRange: { min: 4.5, max: 11.0 },
      abnormalRange: { min: 3.0, max: 15.0 },
      criticalRange: { min: 1.0, max: 20.0 },
      unit: 'K/uL',
      flag: 'WBC'
    },
    {
      testName: 'Glucose',
      normalRange: { min: 70, max: 100 },
      abnormalRange: { min: 60, max: 140 },
      criticalRange: { min: 40, max: 200 },
      unit: 'mg/dL',
      flag: 'GLU'
    },
    {
      testName: 'Cholesterol',
      normalRange: { min: 0, max: 200 },
      abnormalRange: { min: 0, max: 240 },
      criticalRange: { min: 0, max: 300 },
      unit: 'mg/dL',
      flag: 'CHOL'
    },
    {
      testName: 'Creatinine',
      normalRange: { min: 0.6, max: 1.2 },
      abnormalRange: { min: 0.4, max: 1.5 },
      criticalRange: { min: 0.2, max: 2.0 },
      unit: 'mg/dL',
      flag: 'CREA'
    }
  ]

  for (const configData of defaultConfigs) {
    const existing = await flaggingConfigs.findOne({ testName: configData.testName })
    if (!existing) {
      await createFlaggingConfig(configData, 'system')
    }
  }
}
