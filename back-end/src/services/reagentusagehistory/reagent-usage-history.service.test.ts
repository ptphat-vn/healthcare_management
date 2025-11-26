import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import { recordReagentUsage, listUsageHistory } from '../reagentusagehistory/reagent-usage-history.service'
import { getReagentsCollection } from '~/models/reagent.model'
import { getReagentUsageHistoryCollection } from '~/models/reagent-usage-history.model'
import { getUsersCollection } from '~/models/user.model'
import { getInstrumentsCollection } from '~/models/instrument.model'
import { getTestOrdersCollection } from '~/models/test-order.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'
import { getReagentInventoryFIFO } from '~/services/reagentinventory/reagent-inventory.service'

jest.mock('~/models/reagent.model', () => ({
  getReagentsCollection: jest.fn()
}))

jest.mock('~/models/reagent-usage-history.model', () => ({
  getReagentUsageHistoryCollection: jest.fn()
}))

jest.mock('~/models/user.model', () => ({
  getUsersCollection: jest.fn()
}))

jest.mock('~/models/instrument.model', () => ({
  getInstrumentsCollection: jest.fn()
}))

jest.mock('~/models/test-order.model', () => ({
  getTestOrdersCollection: jest.fn()
}))

jest.mock('~/models/event-log.model', () => ({
  getEventLogsCollection: jest.fn()
}))

jest.mock('~/models/role.model', () => ({
  getRolesCollection: jest.fn()
}))

jest.mock('~/services/reagent-inventory.service', () => ({
  getReagentInventoryFIFO: jest.fn()
}))

type FindOneFn = (query?: Record<string, unknown>) => Promise<any>
type InsertOneFn = (doc: Record<string, unknown>) => Promise<{ insertedId: ObjectId }>
type CountFn = (filter?: Record<string, unknown>) => Promise<number>

type CursorMock<T = any> = {
  sort: jest.MockedFunction<(sort: Record<string, number>) => CursorMock<T>>
  skip: jest.MockedFunction<(skip: number) => CursorMock<T>>
  limit: jest.MockedFunction<(limit: number) => CursorMock<T>>
  toArray: jest.MockedFunction<() => Promise<T[]>>
}

type SimpleCursorMock<T = any> = {
  toArray: jest.MockedFunction<() => Promise<T[]>>
}

const makeCursor = (): CursorMock => {
  const cursor: any = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    toArray: jest.fn()
  }
  cursor.sort.mockReturnValue(cursor)
  cursor.skip.mockReturnValue(cursor)
  cursor.limit.mockReturnValue(cursor)
  return cursor
}

const makeSimpleCursor = (): SimpleCursorMock => ({
  toArray: jest.fn()
})

const usageHistoryCursorMock = makeCursor()
const instrumentsFindCursor = makeSimpleCursor()
const testOrdersFindCursor = makeSimpleCursor()
const usersFindCursor = makeSimpleCursor()

const reagentsCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const usageHistoryCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as unknown as jest.MockedFunction<InsertOneFn>,
  find: jest.fn().mockReturnValue(usageHistoryCursorMock) as jest.MockedFunction<(filter?: Record<string, unknown>) => CursorMock>,
  countDocuments: jest.fn() as jest.MockedFunction<CountFn>
}

const usersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  find: jest.fn().mockReturnValue(usersFindCursor)
}

const instrumentsCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  find: jest.fn().mockReturnValue(instrumentsFindCursor)
}

const testOrdersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  find: jest.fn().mockReturnValue(testOrdersFindCursor)
}

const eventLogsCollectionMock = {
  insertOne: jest.fn()
}

const rolesCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const getReagentsCollectionMock = jest.mocked(getReagentsCollection)
const getUsageHistoryCollectionMock = jest.mocked(getReagentUsageHistoryCollection)
const getUsersCollectionMock = jest.mocked(getUsersCollection)
const getInstrumentsCollectionMock = jest.mocked(getInstrumentsCollection)
const getTestOrdersCollectionMock = jest.mocked(getTestOrdersCollection)
const getEventLogsCollectionMock = jest.mocked(getEventLogsCollection)
const getRolesCollectionMock = jest.mocked(getRolesCollection)
const getReagentInventoryFIFOmock = jest.mocked(getReagentInventoryFIFO)

const resetMocks = () => {
  reagentsCollectionMock.findOne.mockReset()
  usageHistoryCollectionMock.findOne.mockReset()
  usageHistoryCollectionMock.insertOne.mockReset()
  usageHistoryCollectionMock.countDocuments.mockReset()
  usageHistoryCollectionMock.find.mockReturnValue(usageHistoryCursorMock)
  usageHistoryCursorMock.sort.mockClear()
  usageHistoryCursorMock.skip.mockClear()
  usageHistoryCursorMock.limit.mockClear()
  usageHistoryCursorMock.toArray.mockReset()
  usersCollectionMock.findOne.mockReset()
  usersCollectionMock.find.mockReturnValue(usersFindCursor)
  usersFindCursor.toArray.mockReset()
  instrumentsCollectionMock.findOne.mockReset()
  instrumentsCollectionMock.find.mockReturnValue(instrumentsFindCursor)
  instrumentsFindCursor.toArray.mockReset()
  testOrdersCollectionMock.findOne.mockReset()
  testOrdersCollectionMock.find.mockReturnValue(testOrdersFindCursor)
  testOrdersFindCursor.toArray.mockReset()
  eventLogsCollectionMock.insertOne.mockReset()
  rolesCollectionMock.findOne.mockReset()
  getReagentInventoryFIFOmock.mockReset()
}

beforeEach(() => {
  getReagentsCollectionMock.mockReturnValue(reagentsCollectionMock as any)
  getUsageHistoryCollectionMock.mockReturnValue(usageHistoryCollectionMock as any)
  getUsersCollectionMock.mockReturnValue(usersCollectionMock as any)
  getInstrumentsCollectionMock.mockReturnValue(instrumentsCollectionMock as any)
  getTestOrdersCollectionMock.mockReturnValue(testOrdersCollectionMock as any)
  getEventLogsCollectionMock.mockReturnValue(eventLogsCollectionMock as any)
  getRolesCollectionMock.mockReturnValue(rolesCollectionMock as any)
  resetMocks()
})

type InventoryItem = ReturnType<typeof createInventorySeed>

const inventoryResponse = (items: InventoryItem[]) => ({
  inventory: items,
  pagination: { page: 1, limit: 10, total: items.length, totalPages: 1 }
})

const makeInventoryItem = (overrides?: Partial<InventoryItem>) => {
  const seed = createInventorySeed()
  return { ...seed, ...(overrides || {}) }
}

function createInventorySeed() {
  return {
    vendorSupplyId: new ObjectId(),
    reagentId: new ObjectId(),
    reagentName: 'Diluent',
    vendorName: 'Vendor',
    lotNumber: 'LOT',
    expirationDate: new Date(),
    quantityReceived: 10,
    quantityUsed: 0,
    quantityAvailable: 5,
    unitOfMeasure: 'ml',
    status: 'Received' as const,
    daysUntilExpiration: 10,
    isExpired: false,
    isExpiringSoon: false
  }
}

const basePayload = {
  reagentId: new ObjectId().toHexString(),
  reagentName: 'Diluent',
  quantity: 5,
  unit: 'ml',
  action: 'Used' as const,
  performedBy: new ObjectId().toHexString()
}

describe('recordReagentUsage', () => {
  it('throws when reagent id invalid', async () => {
    await expect(recordReagentUsage({ ...basePayload, reagentId: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid reagent id' })
    )
  })

  it('throws when reagent not found', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null)
    await expect(recordReagentUsage(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Reagent not found' })
    )
  })

  it('throws when performedBy invalid', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    await expect(recordReagentUsage({ ...basePayload, performedBy: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid performedBy user id' })
    )
  })

  it('throws when user not found', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce(null)
    await expect(recordReagentUsage(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'User not found' })
    )
  })

  it('validates test order id', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), fullName: 'Tech' })
    await expect(recordReagentUsage({ ...basePayload, testOrderId: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid testOrderId' })
    )
  })

  it('validates instrument id', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), fullName: 'Tech' })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([makeInventoryItem({ lotNumber: 'LOT1', unitOfMeasure: 'ml', quantityAvailable: 10 })])
    )
    await expect(recordReagentUsage({ ...basePayload, instrumentId: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid instrumentId' })
    )
  })

  it('throws when no inventory available', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), fullName: 'Tech' })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(inventoryResponse([]))
    await expect(recordReagentUsage(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'No inventory available for this reagent' })
    )
  })

  it('throws when specified lot unavailable', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), fullName: 'Tech' })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([makeInventoryItem({ lotNumber: 'LOT2', unitOfMeasure: 'ml', quantityAvailable: 5 })])
    )
    await expect(recordReagentUsage({ ...basePayload, batchLotNumber: 'LOT1' })).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Specified lot not available or unit mismatch' })
    )
  })

  it('throws when specified lot insufficient quantity', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), fullName: 'Tech' })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([makeInventoryItem({ lotNumber: 'LOT1', unitOfMeasure: 'ml', quantityAvailable: 2 })])
    )
    await expect(recordReagentUsage({ ...basePayload, batchLotNumber: 'LOT1', quantity: 5 })).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Insufficient quantity available in specified lot' })
    )
  })

  it('records usage from single lot and logs event', async () => {
    const reagentId = new ObjectId()
    const performer = new ObjectId()
    const createdDoc = { _id: new ObjectId(), reagentName: 'Diluent', batchLotNumber: 'LOT1' }
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: reagentId, name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: performer, fullName: 'Tech', roleId: new ObjectId() })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([makeInventoryItem({ lotNumber: 'LOT1', unitOfMeasure: 'ml', quantityAvailable: 10 })])
    )
    usageHistoryCollectionMock.insertOne.mockResolvedValueOnce({ insertedId: createdDoc._id })
    usageHistoryCollectionMock.findOne.mockResolvedValueOnce(createdDoc)
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await recordReagentUsage({
      ...basePayload,
      reagentId: reagentId.toHexString(),
      performedBy: performer.toHexString(),
      batchLotNumber: 'LOT1'
    })

    expect(usageHistoryCollectionMock.insertOne).toHaveBeenCalledWith(expect.objectContaining({ batchLotNumber: 'LOT1' }))
    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_REAGENT_USAGE',
        details: expect.stringContaining('Diluent')
      })
    )
    expect(result).toEqual(createdDoc)
  })

  it('allocates across multiple lots when needed', async () => {
    const reagentId = new ObjectId()
    const performer = new ObjectId()
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: reagentId, name: 'Diluent' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: performer, fullName: 'Tech', roleId: new ObjectId() })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([
        makeInventoryItem({ lotNumber: 'LOT1', unitOfMeasure: 'ml', quantityAvailable: 3 }),
        makeInventoryItem({ lotNumber: 'LOT2', unitOfMeasure: 'ml', quantityAvailable: 4 })
      ])
    )
    const insertedIds = [new ObjectId(), new ObjectId()]
    usageHistoryCollectionMock.insertOne
      .mockResolvedValueOnce({ insertedId: insertedIds[0] })
      .mockResolvedValueOnce({ insertedId: insertedIds[1] })
    usageHistoryCollectionMock.findOne
      .mockResolvedValueOnce({ _id: insertedIds[0], batchLotNumber: 'LOT1' })
      .mockResolvedValueOnce({ _id: insertedIds[1], batchLotNumber: 'LOT2' })
    rolesCollectionMock.findOne.mockResolvedValue({ code: 'admin' })

    const result = await recordReagentUsage({
      ...basePayload,
      reagentId: reagentId.toHexString(),
      performedBy: performer.toHexString(),
      quantity: 6,
      batchLotNumber: undefined
    })

    expect(Array.isArray(result)).toBe(true)
    expect((result as any[]).map((r) => r.batchLotNumber)).toEqual(['LOT1', 'LOT2'])
  })

  it('throws when multi-lot still insufficient', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), name: 'Diluent' })
    const performer = new ObjectId()
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: performer, fullName: 'Tech', roleId: new ObjectId() })
    getReagentInventoryFIFOmock.mockResolvedValueOnce(
      inventoryResponse([makeInventoryItem({ lotNumber: 'LOT1', unitOfMeasure: 'ml', quantityAvailable: 2 })])
    )
    const partialId = new ObjectId()
    usageHistoryCollectionMock.insertOne.mockResolvedValueOnce({ insertedId: partialId })
    usageHistoryCollectionMock.findOne.mockResolvedValueOnce({ _id: partialId, batchLotNumber: 'LOT1' })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    await expect(recordReagentUsage({ ...basePayload, quantity: 5 })).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Insufficient total inventory across lots to fulfill requested quantity' })
    )
  })
})

describe('listUsageHistory', () => {
  it('applies filters and resolves missing names', async () => {
    const instrumentId = new ObjectId()
    const testOrderId = new ObjectId()
    const performerId = new ObjectId()
    const usageItems = [
      {
        _id: new ObjectId(),
        reagentName: 'Diluent',
        instrumentId,
        testOrderId,
        performedBy: performerId,
        batchLotNumber: 'LOT1',
        performedAt: new Date()
      }
    ]
    usageHistoryCursorMock.toArray.mockResolvedValueOnce(usageItems as any)
    usageHistoryCollectionMock.countDocuments.mockResolvedValueOnce(1)
    instrumentsFindCursor.toArray.mockResolvedValueOnce([{ _id: instrumentId, name: 'Analyzer' }])
    testOrdersFindCursor.toArray.mockResolvedValueOnce([{ _id: testOrderId, patientName: 'John Doe' }])
    usersFindCursor.toArray.mockResolvedValueOnce([{ _id: performerId, fullName: 'Tech' }])

    const result = await listUsageHistory({
      search: 'Dil',
      reagentName: 'Diluent',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      action: 'Used',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 1
    })

    expect(usageHistoryCollectionMock.find).toHaveBeenCalledWith(expect.objectContaining({ reagentName: expect.any(Object) }))
    expect(usageHistoryCursorMock.sort).toHaveBeenCalledWith({ createdAt: 1 })
    expect(result.usageHistory[0]).toMatchObject({
      instrumentName: 'Analyzer',
      testOrderName: 'John Doe',
      performedByName: 'Tech'
    })
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 })
  })
})

