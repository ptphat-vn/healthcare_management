import { ObjectId, WithId } from 'mongodb'
import { getReagentsCollection } from '~/models/reagent.model'
import { getReagentVendorSupplyCollection, type ReagentVendorSupplyDocument } from '~/models/reagent-vendor-supply.model'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'

export interface CreateVendorSupplyPayload {
  reagentId: string
  reagentName: string
  catalogNumber?: string
  manufacturer?: string
  casNumber?: string
  vendorName: string
  vendorId?: string
  purchaseOrderNumber: string
  orderDate: string | Date
  receiptDate: string | Date
  quantityReceived: number
  unitOfMeasure: string
  lotNumber: string
  expirationDate: string | Date
  receivedBy: string
  initialStorageLocation?: string
  status: 'Received' | 'Partial Shipment' | 'Returned'
}

export interface ListVendorSupplyParams {
  reagentId?: string
  vendorId?: string
  vendorName?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: 'receiptDate' | 'orderDate' | 'createdAt'
  sortOrder?: 1 | -1
}

export const createVendorSupply = async (
  payload: CreateVendorSupplyPayload
): Promise<WithId<ReagentVendorSupplyDocument>> => {
  let reagentObjectId: ObjectId
  try {
    reagentObjectId = new ObjectId(payload.reagentId)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  // Verify reagent exists
  const reagents = getReagentsCollection()
  const reagent = await reagents.findOne({ _id: reagentObjectId } as any)
  if (!reagent) {
    throw new HttpError(404, 'Reagent not found')
  }

  let receivedByObjectId: ObjectId
  try {
    receivedByObjectId = new ObjectId(payload.receivedBy)
  } catch {
    throw new HttpError(422, 'Invalid receivedBy user id')
  }

  // Verify user exists
  const users = getUsersCollection()
  const user = await users.findOne({ _id: receivedByObjectId } as any)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }

  const vendorSupplies = getReagentVendorSupplyCollection()
  const now = new Date()

  const doc: ReagentVendorSupplyDocument = {
    reagentId: reagentObjectId,
    reagentName: payload.reagentName,
    catalogNumber: payload.catalogNumber,
    manufacturer: payload.manufacturer,
    casNumber: payload.casNumber,
    vendorName: payload.vendorName,
    vendorId: payload.vendorId,
    purchaseOrderNumber: payload.purchaseOrderNumber,
    orderDate: typeof payload.orderDate === 'string' ? new Date(payload.orderDate) : payload.orderDate,
    receiptDate: typeof payload.receiptDate === 'string' ? new Date(payload.receiptDate) : payload.receiptDate,
    quantityReceived: payload.quantityReceived,
    unitOfMeasure: payload.unitOfMeasure,
    lotNumber: payload.lotNumber,
    expirationDate: typeof payload.expirationDate === 'string' ? new Date(payload.expirationDate) : payload.expirationDate,
    receivedBy: receivedByObjectId,
    receivedAt: now,
    initialStorageLocation: payload.initialStorageLocation,
    status: payload.status,
    createdAt: now,
    updatedAt: now
  }

  const result = await vendorSupplies.insertOne(doc as any)
  const created = await vendorSupplies.findOne({ _id: result.insertedId } as any)
  if (!created) {
    throw new HttpError(500, 'Failed to create vendor supply record')
  }

  // Event log - automatically log when new shipment is received
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
      action: 'CREATE_REAGENT_VENDOR_SUPPLY',
      details: `Received reagent shipment: ${payload.reagentName} (PO: ${payload.purchaseOrderNumber}, Lot: ${payload.lotNumber})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return created as WithId<ReagentVendorSupplyDocument>
}

export const listVendorSupplyHistory = async (params: ListVendorSupplyParams) => {
  const vendorSupplies = getReagentVendorSupplyCollection()
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

  if (params.vendorId) {
    filter.vendorId = params.vendorId
  }

  if (params.vendorName) {
    filter.vendorName = { $regex: params.vendorName, $options: 'i' }
  }

  if (params.startDate || params.endDate) {
    filter.receiptDate = {}
    if (params.startDate) {
      filter.receiptDate.$gte = new Date(params.startDate)
    }
    if (params.endDate) {
      filter.receiptDate.$lte = new Date(params.endDate)
    }
  }

  const sortField = params.sortBy || 'receiptDate'
  const sortOrder = params.sortOrder || -1

  const cursor = vendorSupplies
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)

  const [items, total] = await Promise.all([cursor.toArray(), vendorSupplies.countDocuments(filter as any)])

  return {
    vendorSupplies: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

