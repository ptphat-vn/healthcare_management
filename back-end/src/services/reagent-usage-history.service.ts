import { ObjectId, WithId } from 'mongodb'
import { getReagentsCollection } from '~/models/reagent.model'
import { getReagentUsageHistoryCollection, type ReagentUsageHistoryDocument } from '~/models/reagent-usage-history.model'
import { HttpError } from '~/models/error.model'
import { getReagentInventoryFIFO } from '~/services/reagent-inventory.service'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'

export interface CreateUsageHistoryPayload {
  reagentId: string
  reagentName: string
  quantity: number
  unit: string
  action: 'Used' | 'Consumed' | 'Wasted' | 'Expired' | 'Returned'
  testOrderId?: string
  instrumentId?: string
  batchLotNumber?: string
  performedBy: string
  performedAt?: string | Date
  notes?: string
}

export interface ListUsageHistoryParams {
  reagentId?: string
  startDate?: string
  endDate?: string
  action?: 'Used' | 'Consumed' | 'Wasted' | 'Expired' | 'Returned'
  testOrderId?: string
  instrumentId?: string
  page?: number
  limit?: number
  sortBy?: 'performedAt' | 'createdAt'
  sortOrder?: 1 | -1
}

export const recordReagentUsage = async (
  payload: CreateUsageHistoryPayload
): Promise<WithId<ReagentUsageHistoryDocument> | WithId<ReagentUsageHistoryDocument>[]> => {
  let reagentObjectId: ObjectId
  try {
    reagentObjectId = new ObjectId(payload.reagentId)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  const reagents = getReagentsCollection()
  const reagent = await reagents.findOne({ _id: reagentObjectId } as any)
  if (!reagent) {
    throw new HttpError(404, 'Reagent not found')
  }

  let performedByObjectId: ObjectId
  try {
    performedByObjectId = new ObjectId(payload.performedBy)
  } catch {
    throw new HttpError(422, 'Invalid performedBy user id')
  }

  const users = getUsersCollection()
  const user = await users.findOne({ _id: performedByObjectId } as any)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }

  const usageHistory = getReagentUsageHistoryCollection()
  const now = new Date()

  let testOrderObjectId: ObjectId | undefined
  if (payload.testOrderId) {
    try {
      testOrderObjectId = new ObjectId(payload.testOrderId)
    } catch {
      throw new HttpError(422, 'Invalid testOrderId')
    }
  }

  let instrumentObjectId: ObjectId | undefined
  if (payload.instrumentId) {
    try {
      instrumentObjectId = new ObjectId(payload.instrumentId)
    } catch {
      throw new HttpError(422, 'Invalid instrumentId')
    }
  }

  const inventory = await getReagentInventoryFIFO({
    reagentId: payload.reagentId,
    includeExpired: false
  })

  if (!inventory || inventory.length === 0) {
    throw new HttpError(409, 'No inventory available for this reagent')
  }

  let selectedLotNumber: string | undefined = payload.batchLotNumber

  if (payload.batchLotNumber) {
    const lot = inventory.find(
      (i) => i.lotNumber === payload.batchLotNumber && i.unitOfMeasure === payload.unit
    )
    if (!lot) {
      throw new HttpError(409, 'Specified lot not available or unit mismatch')
    }
    if (lot.quantityAvailable < payload.quantity) {
      throw new HttpError(409, 'Insufficient quantity available in specified lot')
    }
  } else {
    const singleLot = inventory.find((i) => i.unitOfMeasure === payload.unit && i.quantityAvailable >= payload.quantity)
    if (!singleLot) {
      // Multi-lot allocation across FIFO
      let remaining = payload.quantity
      const candidateLots = inventory.filter((i) => i.unitOfMeasure === payload.unit && i.quantityAvailable > 0)
      if (candidateLots.length === 0) {
        throw new HttpError(409, 'No inventory available for this reagent in the requested unit')
      }

      const createdDocs: WithId<ReagentUsageHistoryDocument>[] = []
      for (const lot of candidateLots) {
        if (remaining <= 0) break
        const allocate = Math.min(remaining, lot.quantityAvailable)

        const partDoc: ReagentUsageHistoryDocument = {
          reagentId: reagentObjectId,
          reagentName: payload.reagentName,
          quantity: allocate,
          unit: payload.unit,
          action: payload.action,
          testOrderId: testOrderObjectId,
          instrumentId: instrumentObjectId,
          batchLotNumber: lot.lotNumber,
          performedBy: performedByObjectId,
          performedAt: payload.performedAt
            ? typeof payload.performedAt === 'string'
              ? new Date(payload.performedAt)
              : payload.performedAt
            : now,
          notes: payload.notes,
          createdAt: now
        }

        const ins = await usageHistory.insertOne(partDoc as any)
        const createdPart = await usageHistory.findOne({ _id: ins.insertedId } as any)
        if (!createdPart) {
          throw new HttpError(500, 'Failed to create usage history record')
        }

        // Event log for each allocation
        try {
          const eventLogs = getEventLogsCollection()
          const roleCol = getRolesCollection()
          const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
          await eventLogs.insertOne({
            operator: {
              id: user._id || 'system',
              name: user.fullName || 'system',
              role: actorRoleDoc?.code || 'system'
            },
            action: 'CREATE_REAGENT_USAGE',
            details: `Reagent usage recorded: ${payload.reagentName} - ${allocate} ${payload.unit} (${payload.action}) [Lot ${lot.lotNumber}]`,
            timestamp: now
          } as any)
        } catch {
          // swallow logging errors
        }

        createdDocs.push(createdPart as WithId<ReagentUsageHistoryDocument>)
        remaining -= allocate
      }

      if (remaining > 0) {
        throw new HttpError(409, 'Insufficient total inventory across lots to fulfill requested quantity')
      }

      return createdDocs
    }
    selectedLotNumber = singleLot.lotNumber
  }

  const doc: ReagentUsageHistoryDocument = {
    reagentId: reagentObjectId,
    reagentName: payload.reagentName,
    quantity: payload.quantity,
    unit: payload.unit,
    action: payload.action,
    testOrderId: testOrderObjectId,
    instrumentId: instrumentObjectId,
    batchLotNumber: selectedLotNumber,
    performedBy: performedByObjectId,
    performedAt: payload.performedAt
      ? typeof payload.performedAt === 'string'
        ? new Date(payload.performedAt)
        : payload.performedAt
      : now,
    notes: payload.notes,
    createdAt: now
  }

  const result = await usageHistory.insertOne(doc as any)
  const created = await usageHistory.findOne({ _id: result.insertedId } as any)
  if (!created) {
    throw new HttpError(500, 'Failed to create usage history record')
  }

  // Event log - automatically log when reagent usage occurs
  try {
    const eventLogs = getEventLogsCollection()
    const roleCol = getRolesCollection()
    const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: user._id || 'system',
        name: user.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
      action: 'CREATE_REAGENT_USAGE',
      details: `Reagent usage recorded: ${payload.reagentName} - ${payload.quantity} ${payload.unit} (${payload.action})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return created as WithId<ReagentUsageHistoryDocument>
}

export const listUsageHistory = async (params: ListUsageHistoryParams) => {
  const usageHistory = getReagentUsageHistoryCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  const filter: Record<string, any> = {}

  if (params.reagentId) {
    try {
      filter.reagentId = new ObjectId(params.reagentId)
    } catch {
      throw new HttpError(422, 'Invalid reagent id')
    }
  }

  if (params.action) {
    filter.action = params.action
  }

  if (params.testOrderId) {
    try {
      filter.testOrderId = new ObjectId(params.testOrderId)
    } catch {
      throw new HttpError(422, 'Invalid testOrderId')
    }
  }

  if (params.instrumentId) {
    try {
      filter.instrumentId = new ObjectId(params.instrumentId)
    } catch {
      throw new HttpError(422, 'Invalid instrumentId')
    }
  }

  if (params.startDate || params.endDate) {
    filter.performedAt = {}
    if (params.startDate) {
      filter.performedAt.$gte = new Date(params.startDate)
    }
    if (params.endDate) {
      filter.performedAt.$lte = new Date(params.endDate)
    }
  }

  const sortField = params.sortBy || 'performedAt'
  const sortOrder = params.sortOrder || -1

  const cursor = usageHistory
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)

  const [items, total] = await Promise.all([cursor.toArray(), usageHistory.countDocuments(filter as any)])

  return {
    usageHistory: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

