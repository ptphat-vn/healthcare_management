import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import {
  createVendorSupply,
  listVendorSupplyHistory
} from '../reagent-vendor-supply.service'
import { getReagentsCollection } from '~/models/reagent.model'
import { getReagentVendorSupplyCollection } from '~/models/reagent-vendor-supply.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'

jest.mock('~/models/reagent.model', () => ({
  getReagentsCollection: jest.fn()
}))

jest.mock('~/models/reagent-vendor-supply.model', () => ({
  getReagentVendorSupplyCollection: jest.fn()
}))

jest.mock('~/models/user.model', () => ({
  getUsersCollection: jest.fn()
}))

jest.mock('~/models/event-log.model', () => ({
  getEventLogsCollection: jest.fn()
}))

jest.mock('~/models/role.model', () => ({
  getRolesCollection: jest.fn()
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

const vendorSupplyCursorMock: CursorMock = {
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  toArray: jest.fn()
}
vendorSupplyCursorMock.sort.mockReturnValue(vendorSupplyCursorMock)
vendorSupplyCursorMock.skip.mockReturnValue(vendorSupplyCursorMock)
vendorSupplyCursorMock.limit.mockReturnValue(vendorSupplyCursorMock)

const reagentsCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const vendorSupplyCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as unknown as jest.MockedFunction<InsertOneFn>,
  find: jest.fn().mockReturnValue(vendorSupplyCursorMock) as jest.MockedFunction<(filter?: Record<string, unknown>) => CursorMock>,
  countDocuments: jest.fn() as jest.MockedFunction<CountFn>
}

const usersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  find: jest.fn().mockReturnValue(vendorSupplyCursorMock) as jest.MockedFunction<() => CursorMock>
}

const eventLogsCollectionMock = {
  insertOne: jest.fn()
}

const rolesCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const getReagentsCollectionMock = jest.mocked(getReagentsCollection)
const getVendorSupplyCollectionMock = jest.mocked(getReagentVendorSupplyCollection)
const getUsersCollectionMock = jest.mocked(getUsersCollection)
const getEventLogsCollectionMock = jest.mocked(getEventLogsCollection)
const getRolesCollectionMock = jest.mocked(getRolesCollection)

const resetMocks = () => {
  reagentsCollectionMock.findOne.mockReset()
  vendorSupplyCollectionMock.findOne.mockReset()
  vendorSupplyCollectionMock.insertOne.mockReset()
  vendorSupplyCollectionMock.countDocuments.mockReset()
  vendorSupplyCollectionMock.find.mockReturnValue(vendorSupplyCursorMock)
  vendorSupplyCursorMock.sort.mockClear()
  vendorSupplyCursorMock.skip.mockClear()
  vendorSupplyCursorMock.limit.mockClear()
  vendorSupplyCursorMock.toArray.mockReset()
  usersCollectionMock.findOne.mockReset()
  usersCollectionMock.find.mockReturnValue(vendorSupplyCursorMock)
  eventLogsCollectionMock.insertOne.mockReset()
  rolesCollectionMock.findOne.mockReset()
}

beforeEach(() => {
  getReagentsCollectionMock.mockReturnValue(reagentsCollectionMock as any)
  getVendorSupplyCollectionMock.mockReturnValue(vendorSupplyCollectionMock as any)
  getUsersCollectionMock.mockReturnValue(usersCollectionMock as any)
  getEventLogsCollectionMock.mockReturnValue(eventLogsCollectionMock as any)
  getRolesCollectionMock.mockReturnValue(rolesCollectionMock as any)
  resetMocks()
})

describe('createVendorSupply', () => {
  const basePayload = {
    reagentId: new ObjectId().toHexString(),
    vendorName: 'Vendor A',
    purchaseOrderNumber: 'PO123',
    orderDate: new Date().toISOString(),
    receiptDate: new Date().toISOString(),
    quantityReceived: 10,
    unitOfMeasure: 'bottle',
    lotNumber: 'LOT-1',
    expirationDate: new Date().toISOString(),
    receivedBy: new ObjectId().toHexString(),
    status: 'Received' as const
  }

  it('throws when reagent id invalid', async () => {
    await expect(createVendorSupply({ ...basePayload, reagentId: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid reagent id' })
    )
  })

  it('throws when reagent not found', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(createVendorSupply(basePayload)).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Reagent not found' })
    )
  })

  it('throws when lot number already exists', async () => {
    const reagentId = new ObjectId()
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: reagentId, name: 'Reagent' })
    vendorSupplyCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(createVendorSupply({ ...basePayload, reagentId: reagentId.toHexString() })).rejects.toEqual(
      expect.objectContaining({ status: 409 })
    )
  })

  it('throws when receivedBy invalid', async () => {
    const reagentId = new ObjectId()
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: reagentId, name: 'Reagent' })
    vendorSupplyCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(createVendorSupply({ ...basePayload, reagentId: reagentId.toHexString(), receivedBy: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid receivedBy user id' })
    )
  })

  it('throws when user not found', async () => {
    const reagentId = new ObjectId()
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: reagentId, name: 'Reagent' })
    vendorSupplyCollectionMock.findOne.mockResolvedValueOnce(null)
    usersCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(createVendorSupply({ ...basePayload, reagentId: reagentId.toHexString() })).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'User not found' })
    )
  })

  it('creates record and logs event', async () => {
    const reagentId = new ObjectId()
    const receivedBy = new ObjectId()
    const createdDoc = { _id: new ObjectId(), reagentName: 'Reagent' }
    reagentsCollectionMock.findOne.mockResolvedValueOnce({
      _id: reagentId,
      name: 'Reagent',
      catalogNumber: 'CAT',
      manufacturer: 'Manu',
      casNumber: '111'
    })
    vendorSupplyCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdDoc)
    vendorSupplyCollectionMock.insertOne.mockResolvedValueOnce({ insertedId: createdDoc._id })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: receivedBy, fullName: 'Receiver', roleId: new ObjectId() })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await createVendorSupply({
      ...basePayload,
      reagentId: reagentId.toHexString(),
      receivedBy: receivedBy.toHexString(),
      reagentName: undefined,
      catalogNumber: undefined,
      manufacturer: undefined,
      casNumber: undefined
    })

    expect(vendorSupplyCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        reagentName: 'Reagent',
        catalogNumber: 'CAT',
        manufacturer: 'Manu',
        casNumber: '111',
        receivedByName: 'Receiver'
      })
    )
    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_REAGENT_VENDOR_SUPPLY',
        details: expect.stringContaining('PO123')
      })
    )
    expect(result).toEqual(createdDoc)
  })
})

describe('listVendorSupplyHistory', () => {
  it('applies filters, pagination, and resolves receiver names', async () => {
    const receiverId = new ObjectId()
    const vendorItems = [
      {
        _id: new ObjectId(),
        reagentName: 'Reagent',
        vendorName: 'Vendor',
        lotNumber: 'LOT-1',
        receiptDate: new Date(),
        receivedBy: receiverId
      }
    ]
    vendorSupplyCursorMock.toArray.mockResolvedValueOnce(vendorItems as any)
    vendorSupplyCollectionMock.countDocuments.mockResolvedValueOnce(5)
    vendorSupplyCursorMock.toArray.mockResolvedValueOnce([{ _id: receiverId, fullName: 'Receiver' }] as any)

    const result = await listVendorSupplyHistory({
      search: 'Rea',
      vendorName: 'Ven',
      reagentName: 'Rea',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      page: 2,
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: 1
    })

    expect(vendorSupplyCollectionMock.find).toHaveBeenCalledWith(expect.objectContaining({ vendorName: expect.any(Object) }))
    expect(vendorSupplyCursorMock.sort).toHaveBeenCalledWith({ createdAt: 1 })
    expect(vendorSupplyCursorMock.skip).toHaveBeenCalledWith(1)
    expect(result.vendorSupplies[0]).toMatchObject({ receivedByName: 'Receiver' })
    expect(result.pagination).toEqual({ page: 2, limit: 1, total: 5, totalPages: 5 })
  })
})

