import { ObjectId } from 'mongodb'
import { getReagentVendorSupplyCollection } from '~/models/reagent-vendor-supply.model'
import { getReagentUsageHistoryCollection } from '~/models/reagent-usage-history.model'
import { HttpError } from '~/models/error.model'

export interface ReagentInventoryItem {
  vendorSupplyId: ObjectId
  reagentId: ObjectId
  reagentName: string
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
  reagentId?: string
  reagentName?: string
  includeExpired?: boolean
  includeExpiringSoon?: boolean
}

export const getReagentInventoryFIFO = async (
  params: GetReagentInventoryParams
): Promise<ReagentInventoryItem[]> => {
  const vendorSupplies = getReagentVendorSupplyCollection()
  const usageHistory = getReagentUsageHistoryCollection()
  const now = new Date()

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

  return inventoryItems
}

export const getNextReagentLotFIFO = async (
  reagentId: string,
  requiredQuantity?: number
): Promise<ReagentInventoryItem | null> => {
  const inventory = await getReagentInventoryFIFO({
    reagentId,
    includeExpired: false
  })

  if (inventory.length === 0) {
    return null
  }

  if (requiredQuantity !== undefined) {
    const availableLot = inventory.find(item => item.quantityAvailable >= requiredQuantity)
    return availableLot || null
  }
  return inventory[0]
}

