import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import * as reagentInventoryService from './reagent-inventory.service'
import { getReagentVendorSupplyCollection } from '~/models/reagent-vendor-supply.model'
import { getReagentUsageHistoryCollection } from '~/models/reagent-usage-history.model'
import { HttpError } from '~/models/error.model'

const { getReagentInventoryFIFO, getNextReagentLotFIFO } = reagentInventoryService

jest.mock('~/models/reagent-vendor-supply.model', () => ({
  getReagentVendorSupplyCollection: jest.fn()
}))

jest.mock('~/models/reagent-usage-history.model', () => ({
  getReagentUsageHistoryCollection: jest.fn()
}))

type FindReturn<T = any> = {
  toArray: jest.MockedFunction<() => Promise<T[]>>
}

const createCursor = <T = any>(): FindReturn<T> => ({
  toArray: jest.fn()
})

const vendorSupplyCursor = createCursor()
const usageHistoryCursor = createCursor()

const vendorSupplyCollectionMock = {
  find: jest.fn().mockReturnValue(vendorSupplyCursor)
}

const usageHistoryCollectionMock = {
  find: jest.fn().mockReturnValue(usageHistoryCursor)
}

const getVendorSupplyCollectionMock = jest.mocked(getReagentVendorSupplyCollection)
const getUsageHistoryCollectionMock = jest.mocked(getReagentUsageHistoryCollection)

const resetMocks = () => {
  vendorSupplyCollectionMock.find.mockReturnValue(vendorSupplyCursor)
  vendorSupplyCursor.toArray.mockReset()
  usageHistoryCollectionMock.find.mockReturnValue(usageHistoryCursor)
  usageHistoryCursor.toArray.mockReset()
}

beforeEach(() => {
  getVendorSupplyCollectionMock.mockReturnValue(vendorSupplyCollectionMock as any)
  getUsageHistoryCollectionMock.mockReturnValue(usageHistoryCollectionMock as any)
  resetMocks()
})

const supplySeed = (overrides?: Partial<any>) => ({
  _id: new ObjectId(),
  reagentId: new ObjectId(),
  reagentName: 'Diluent',
  vendorName: 'Vendor',
  lotNumber: 'LOT1',
  expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  quantityReceived: 10,
  unitOfMeasure: 'ml',
  status: 'Received',
  ...overrides
})

const usageSeed = (overrides?: Partial<any>) => ({
  reagentId: new ObjectId(),
  batchLotNumber: 'LOT1',
  action: 'Used',
  unit: 'ml',
  quantity: 2,
  ...overrides
})

describe('getReagentInventoryFIFO', () => {
  it('throws when reagentId invalid', async () => {
    await expect(getReagentInventoryFIFO({ reagentId: 'bad' })).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid reagent id' })
    )
  })

  it('filters expired lots when includeExpired false', async () => {
    const expiredSupply = supplySeed({ expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000) })
    vendorSupplyCursor.toArray.mockResolvedValueOnce([expiredSupply])
    usageHistoryCursor.toArray.mockResolvedValueOnce([])

    const result = await getReagentInventoryFIFO({})

    expect(result.inventory).toHaveLength(0)
  })

  it('includes expiring soon when requested', async () => {
    const soonSupply = supplySeed({ expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) })
    vendorSupplyCursor.toArray.mockResolvedValueOnce([soonSupply])
    usageHistoryCursor.toArray.mockResolvedValueOnce([])

    const result = await getReagentInventoryFIFO({ includeExpiringSoon: true })

    expect(result.inventory).toHaveLength(1)
    expect(result.inventory[0]).toMatchObject({ lotNumber: 'LOT1', isExpiringSoon: true })
  })

  it('skips fully used lots', async () => {
    const supply = supplySeed()
    vendorSupplyCursor.toArray.mockResolvedValueOnce([supply])
    usageHistoryCursor.toArray.mockResolvedValueOnce([usageSeed({ reagentId: supply.reagentId, quantity: 10 })])

    const result = await getReagentInventoryFIFO({})

    expect(result.inventory).toHaveLength(0)
  })

  it('calculates quantityAvailable and sorts FIFO', async () => {
    const supply1 = supplySeed({ lotNumber: 'LOT1', expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) })
    const supply2 = supplySeed({ lotNumber: 'LOT2', expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) })
    vendorSupplyCursor.toArray.mockResolvedValueOnce([supply2, supply1])
    usageHistoryCursor.toArray.mockResolvedValueOnce([usageSeed({ reagentId: supply2.reagentId, quantity: 4, unit: 'ml', batchLotNumber: 'LOT2' })])
    usageHistoryCursor.toArray.mockResolvedValueOnce([])

    const result = await getReagentInventoryFIFO({})

    expect(result.inventory.map((i) => i.lotNumber)).toEqual(['LOT1', 'LOT2'])
    expect(result.inventory[1].quantityAvailable).toBe(6)
  })
})

describe('getNextReagentLotFIFO', () => {
  it('returns null when no inventory', async () => {
    jest.spyOn(reagentInventoryService, 'getReagentInventoryFIFO').mockResolvedValueOnce({
      inventory: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    })

    const result = await getNextReagentLotFIFO(new ObjectId().toHexString())

    expect(result).toBeNull()
  })

  it('returns first lot when no quantity specified', async () => {
    const lot = {
      vendorSupplyId: new ObjectId(),
      reagentId: new ObjectId(),
      reagentName: 'Diluent',
      vendorName: 'Vendor',
      lotNumber: 'LOT1',
      expirationDate: new Date(),
      quantityReceived: 10,
      quantityUsed: 2,
      quantityAvailable: 8,
      unitOfMeasure: 'ml',
      status: 'Received' as const,
      daysUntilExpiration: 5,
      isExpired: false,
      isExpiringSoon: false
    }
    jest.spyOn(reagentInventoryService, 'getReagentInventoryFIFO').mockResolvedValueOnce({
      inventory: [lot],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    })

    const result = await getNextReagentLotFIFO(new ObjectId().toHexString())

    expect(result).toEqual(lot)
  })

  it('returns lot meeting required quantity', async () => {
    const lots = [
      { ...supplySeed(), vendorSupplyId: new ObjectId(), quantityAvailable: 3 },
      { ...supplySeed(), vendorSupplyId: new ObjectId(), quantityAvailable: 6 }
    ] as any
    jest.spyOn(reagentInventoryService, 'getReagentInventoryFIFO').mockResolvedValueOnce({
      inventory: lots,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    })

    const result = await getNextReagentLotFIFO(new ObjectId().toHexString(), 5)

    expect(result?.quantityAvailable).toBe(6)
  })
})

