import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const REAGENT_VENDOR_SUPPLY_COLLECTION = 'reagent_vendor_supplies'

export interface ReagentVendorSupplyDocument {
  _id?: ObjectId
  reagentId: ObjectId
  reagentName: string
  catalogNumber?: string
  manufacturer?: string
  casNumber?: string
  vendorName: string
  vendorId?: string
  purchaseOrderNumber: string 
  orderDate: Date
  receiptDate: Date
  quantityReceived: number
  unitOfMeasure: string 
  lotNumber: string
  expirationDate: Date 
  receivedBy: ObjectId 
  receivedAt: Date
  initialStorageLocation?: string
  status: 'Received' | 'Partial Shipment' | 'Returned'
  createdAt: Date
  updatedAt: Date
}

export const getReagentVendorSupplyCollection = (): Collection<ReagentVendorSupplyDocument> => {
  return getDb().collection<ReagentVendorSupplyDocument>(REAGENT_VENDOR_SUPPLY_COLLECTION)
}

