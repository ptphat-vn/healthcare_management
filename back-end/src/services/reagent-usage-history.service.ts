import { ObjectId, WithId } from 'mongodb'
import { getReagentsCollection } from '~/models/reagent.model'
import { getReagentUsageHistoryCollection, type ReagentUsageHistoryDocument } from '~/models/reagent-usage-history.model'
import { HttpError } from '~/models/error.model'
import { getReagentInventoryFIFO } from '~/services/reagent-inventory.service'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'
import { getInstrumentsCollection } from '~/models/instrument.model'
import { getTestOrdersCollection } from '~/models/test-order.model'

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
  search?: string
  reagentName?: string
  startDate?: string
  endDate?: string
  action?: 'Used' | 'Consumed' | 'Wasted' | 'Expired' | 'Returned'
  testOrderName?: string
  instrumentName?: string
  performedByName?: string
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
  const performedByName = user.fullName || user.email || performedByObjectId.toString()

  const usageHistory = getReagentUsageHistoryCollection()
  const now = new Date()

  let testOrderObjectId: ObjectId | undefined
  let testOrderName: string | undefined
  if (payload.testOrderId) {
    try {
      testOrderObjectId = new ObjectId(payload.testOrderId)
    } catch {
      throw new HttpError(422, 'Invalid testOrderId')
    }

    const testOrders = getTestOrdersCollection()
    const testOrder = await testOrders.findOne({ _id: testOrderObjectId } as any)
    if (!testOrder) {
      throw new HttpError(404, 'Test order not found')
    }

    if (testOrder.patientName) {
      testOrderName = testOrder.patientName
    } else if (Array.isArray(testOrder.requestedTests) && testOrder.requestedTests.length) {
      testOrderName = testOrder.requestedTests.join(', ')
    }
  }

  let instrumentObjectId: ObjectId | undefined
  let instrumentName: string | undefined
  if (payload.instrumentId) {
    try {
      instrumentObjectId = new ObjectId(payload.instrumentId)
    } catch {
      throw new HttpError(422, 'Invalid instrumentId')
    }

    const instruments = getInstrumentsCollection()
    const instrument = await instruments.findOne({ _id: instrumentObjectId } as any)
    if (!instrument) {
      throw new HttpError(404, 'Instrument not found')
    }

    instrumentName = instrument.name
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
          testOrderName,
          instrumentId: instrumentObjectId,
          instrumentName,
          batchLotNumber: lot.lotNumber,
          performedBy: performedByObjectId,
          performedByName,
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
    testOrderName,
    instrumentId: instrumentObjectId,
    instrumentName,
    batchLotNumber: selectedLotNumber,
    performedBy: performedByObjectId,
    performedByName,
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

  if (params.reagentName) {
    filter.reagentName = { $regex: params.reagentName, $options: 'i' }
  }

  if (params.action) {
    filter.action = params.action
  }

  if (params.testOrderName) {
    filter.testOrderName = { $regex: params.testOrderName, $options: 'i' }
  }

  if (params.instrumentName) {
    filter.instrumentName = { $regex: params.instrumentName, $options: 'i' }
  }

  if (params.performedByName) {
    filter.performedByName = { $regex: params.performedByName, $options: 'i' }
  }

  if (params.search) {
    const pattern = { $regex: params.search, $options: 'i' }
    filter.$or = [
      { reagentName: pattern },
      { testOrderName: pattern },
      { instrumentName: pattern },
      { batchLotNumber: pattern },
      { notes: pattern },
      { performedByName: pattern }
    ]
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

  const instrumentIdsNeedingLookup = Array.from(
    new Set(
      items
        .filter((item) => item.instrumentId && !item.instrumentName)
        .map((item) => (item.instrumentId as ObjectId).toString())
    )
  )

  const testOrderIdsNeedingLookup = Array.from(
    new Set(
      items
        .filter((item) => item.testOrderId && !item.testOrderName)
        .map((item) => (item.testOrderId as ObjectId).toString())
    )
  )

  const performerIdsNeedingLookup = Array.from(
    new Set(
      items
        .filter((item) => item.performedBy && !item.performedByName)
        .map((item) => (item.performedBy as ObjectId).toString())
    )
  )

  const [instrumentDocs, testOrderDocs] = await Promise.all([
    instrumentIdsNeedingLookup.length
      ? getInstrumentsCollection()
          .find(
            { _id: { $in: instrumentIdsNeedingLookup.map((id) => new ObjectId(id)) } } as any,
            { projection: { name: 1 } }
          )
          .toArray()
      : Promise.resolve([]),
    testOrderIdsNeedingLookup.length
      ? getTestOrdersCollection()
          .find(
            { _id: { $in: testOrderIdsNeedingLookup.map((id) => new ObjectId(id)) } } as any,
            { projection: { patientName: 1, requestedTests: 1 } }
          )
          .toArray()
      : Promise.resolve([])
  ])

  const performerDocs = performerIdsNeedingLookup.length
    ? await getUsersCollection()
        .find(
          { _id: { $in: performerIdsNeedingLookup.map((id) => new ObjectId(id)) } } as any,
          { projection: { fullName: 1, username: 1, email: 1 } }
        )
        .toArray()
    : []

  if (instrumentDocs.length) {
    const instrumentNameMap = new Map<string, string>()
    instrumentDocs.forEach((doc) => {
      if (doc?._id && doc?.name) {
        instrumentNameMap.set(doc._id.toString(), doc.name)
      }
    })

    items.forEach((item) => {
      if (item.instrumentId && !item.instrumentName) {
        const name = instrumentNameMap.get(item.instrumentId.toString())
        if (name) {
          item.instrumentName = name
        }
      }
    })
  }

  if (testOrderDocs.length) {
    const testOrderNameMap = new Map<string, string>()
    testOrderDocs.forEach((doc) => {
      if (!doc?._id) return
      let derivedName = ''
      if (doc.patientName) {
        derivedName = doc.patientName
      } else if (Array.isArray(doc.requestedTests) && doc.requestedTests.length) {
        derivedName = doc.requestedTests.join(', ')
      }
      if (derivedName) {
        testOrderNameMap.set(doc._id.toString(), derivedName)
      }
    })

    items.forEach((item) => {
      if (item.testOrderId && !item.testOrderName) {
        const name = testOrderNameMap.get(item.testOrderId.toString())
        if (name) {
          item.testOrderName = name
        }
      }
    })
  }

  if (performerDocs.length) {
    const performerNameMap = new Map<string, string>()
    performerDocs.forEach((doc: any) => {
      if (!doc?._id) return
      const name = doc.fullName || doc.email
      if (name) {
        performerNameMap.set(doc._id.toString(), name)
      }
    })

    items.forEach((item) => {
      if (item.performedBy && !item.performedByName) {
        const name = performerNameMap.get(item.performedBy.toString())
        if (name) {
          item.performedByName = name
        }
      }
    })
  }

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

