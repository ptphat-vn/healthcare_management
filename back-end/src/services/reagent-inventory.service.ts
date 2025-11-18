import { ObjectId } from 'mongodb'
import { getReagentVendorSupplyCollection } from '~/models/reagent-vendor-supply.model'
import { getReagentUsageHistoryCollection } from '~/models/reagent-usage-history.model'
import { HttpError } from '~/models/error.model'

export interface ReagentInventoryItem {
  vendorSupplyId: ObjectId
  reagentId: ObjectId
  reagentName: string
  vendorName: string
  lotNumber: string
  expirationDate: Date
  quantityReceived: number
  quantityUsed: number
  quantityAvailable: number
  unitOfMeasure: string
  status: 'Received' | 'Partial Shipment' | 'Returned'
  daysUntilExpiration: number
  isExpired: boolean
  isExpiringSoon: boolean // Within 30 days
}

export interface GetReagentInventoryParams {
  search?: string
  reagentId?: string
  reagentName?: string
  vendorName?: string
  includeExpired?: boolean
  includeExpiringSoon?: boolean
  page?: number
  limit?: number
}

export const getReagentInventoryFIFO = async (
  params: GetReagentInventoryParams
): Promise<{ inventory: ReagentInventoryItem[], pagination: { page: number, limit: number, total: number, totalPages: number } }> => {
  const vendorSupplies = getReagentVendorSupplyCollection()
  const usageHistory = getReagentUsageHistoryCollection()
  const now = new Date()

  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10

  const filter: Record<string, any> = {
    status: 'Received' 
  }

  if (params.reagentId) {
    try {
      filter.reagentId = new ObjectId(params.reagentId)
    } catch {
      throw new HttpError(422, 'Invalid reagent id')
    }
  }

  if (params.reagentName) {
    filter.reagentName = { $regex: params.reagentName, $options: 'i' }
  }

  if (params.vendorName) {
    filter.vendorName = { $regex: params.vendorName, $options: 'i' }
  }

  if (params.search) {
    const pattern = { $regex: params.search, $options: 'i' }
    filter.$or = [
      { reagentName: pattern },
      { vendorName: pattern },
      { lotNumber: pattern },
      { purchaseOrderNumber: pattern },
      { catalogNumber: pattern },
      { manufacturer: pattern }
    ]
  }

  const supplies = await vendorSupplies.find(filter as any).toArray()

  const inventoryItems: ReagentInventoryItem[] = []

  for (const supply of supplies) {
    const usageRecords = await usageHistory.find({
      reagentId: supply.reagentId,
      batchLotNumber: supply.lotNumber,
      action: { $in: ['Used', 'Consumed', 'Wasted'] }
    } as any).toArray()

    const quantityUsed = usageRecords.reduce((sum, record) => {
      if (record.unit === supply.unitOfMeasure) {
        return sum + record.quantity
      }
      return sum
    }, 0)

    const quantityAvailable = supply.quantityReceived - quantityUsed

    if (quantityAvailable <= 0) {
      continue
    }

    const expirationDate = new Date(supply.expirationDate)
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpired = expirationDate < now
    const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration >= 0

    if (!params.includeExpired && isExpired) {
      continue
    }

    if (params.includeExpiringSoon && !isExpiringSoon && !isExpired) {
      continue
    }

    inventoryItems.push({
      vendorSupplyId: supply._id!,
      reagentId: supply.reagentId,
      reagentName: supply.reagentName,
      vendorName: supply.vendorName,
      lotNumber: supply.lotNumber,
      expirationDate: expirationDate,
      quantityReceived: supply.quantityReceived,
      quantityUsed: quantityUsed,
      quantityAvailable: quantityAvailable,
      unitOfMeasure: supply.unitOfMeasure,
      status: supply.status,
      daysUntilExpiration: daysUntilExpiration,
      isExpired: isExpired,
      isExpiringSoon: isExpiringSoon
    })
  }

  inventoryItems.sort((a, b) => {
    if (a.expirationDate.getTime() !== b.expirationDate.getTime()) {
      return a.expirationDate.getTime() - b.expirationDate.getTime()
    }
    return 0 
  })

  const total = inventoryItems.length
  const skip = (page - 1) * limit
  const paginatedItems = inventoryItems.slice(skip, skip + limit)

  return {
    inventory: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export const getNextReagentLotFIFO = async (
  reagentId: string,
  requiredQuantity?: number
): Promise<ReagentInventoryItem | null> => {
  const result = await getReagentInventoryFIFO({
    reagentId,
    includeExpired: false
  })

  if (result.inventory.length === 0) {
    return null
  }

  if (requiredQuantity !== undefined) {
    const availableLot = result.inventory.find(item => item.quantityAvailable >= requiredQuantity)
    return availableLot || null
  }
  return result.inventory[0]
}

