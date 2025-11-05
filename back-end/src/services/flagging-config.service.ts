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
      testName: 'White Blood Cell Count',
      normalRange: { min: 4000, max: 10000 },
      abnormalRange: { min: 3000, max: 12000 },
      criticalRange: { min: 1000, max: 20000 },
      unit: 'cells/µL',
      flag: 'WBC'
    },
    {
      testName: 'Red Blood Cell Count',
      normalRange: { min: 4.2, max: 6.1 },
      abnormalRange: { min: 3.5, max: 6.5 },
      criticalRange: { min: 3.0, max: 7.0 },
      unit: 'million/µL',
      flag: 'RBC'
    },
    {
      testName: 'Hemoglobin',
      normalRange: { min: 12.0, max: 18.0 },
      abnormalRange: { min: 10.0, max: 20.0 },
      criticalRange: { min: 8.0, max: 22.0 },
      unit: 'g/dL',
      flag: 'HGB'
    },
    {
      testName: 'Hematocrit',
      normalRange: { min: 37, max: 52 },
      abnormalRange: { min: 30, max: 55 },
      criticalRange: { min: 25, max: 60 },
      unit: '%',
      flag: 'HCT'
    },
    {
      testName: 'Platelet Count',
      normalRange: { min: 150000, max: 350000 },
      abnormalRange: { min: 100000, max: 400000 },
      criticalRange: { min: 50000, max: 500000 },
      unit: 'cells/µL',
      flag: 'PLT'
    },
    {
      testName: 'Mean Corpuscular Volume',
      normalRange: { min: 80, max: 100 },
      abnormalRange: { min: 70, max: 110 },
      criticalRange: { min: 60, max: 120 },
      unit: 'fL',
      flag: 'MCV'
    },
    {
      testName: 'Mean Corpuscular Haemoglobin',
      normalRange: { min: 27, max: 33 },
      abnormalRange: { min: 20, max: 36 },
      criticalRange: { min: 15, max: 38 },
      unit: 'pg',
      flag: 'MCH'
    },
    {
      testName: 'Mean Corpuscular Haemoglobin Concentration',
      normalRange: { min: 32, max: 36 },
      abnormalRange: { min: 28, max: 38 },
      criticalRange: { min: 24, max: 40 },
      unit: 'g/dL',
      flag: 'MCHC'
    }
  ]

  for (const configData of defaultConfigs) {
    const existing = await flaggingConfigs.findOne({ testName: configData.testName })
    if (!existing) {
      await createFlaggingConfig(configData, 'system')
    }
  }
}
