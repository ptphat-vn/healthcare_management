export interface Reagent {
  _id: string;
  name: string;
  catalogNumber?: string;
  manufacturer: string;
  casNumber?: string;
  description?: string;
  usagePerRun?: {
    min: number;
    max: number;
    unit: string;
  };
  ratio?: string;
  preciseAmount?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
  categories?: string[];
  storageCondition?: string;
  safetyInstructions?: string;
}

export interface ListReagentsParams {
  search?: string;
  sortBy?: "name" | "catalogNumber" | "manufacturer" | "updatedAt";
  sortOrder?: 1 | -1;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface CreateReagentRequest {
  name: string;
  catalogNumber?: string;
  manufacturer: string;
  casNumber?: string;
  description?: string;
  usagePerRun?: {
    min: number;
    max: number;
    unit: string;
  };
  ratio?: string;
  preciseAmount?: number | null;
  categories?: string;
  storageConditions?: string;
  safetyInstructions?: string;
  isActive?: boolean;
}
export interface ReagentInstrument {
  _id: string;
  instrumentId: string;
  reagentId: string;
  reagentName: string;
  lotNumber: string;
  quantity: number;
  unitOfMeasure: string;
  expirationDate: string;
  vendorSupplyId: string;
  assignedBy: string;
  assignedAt: string;
  removedAt: null;
  removedBy: null;
  isActive: true;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
export interface UsageReagentHistory {
  _id: string;
  reagentId: string;
  reagentName: string;
  quantity: number;
  unit: string;
  action: string;
  testOrderId: string;
  testOrderName: string;
  instrumentId: string;
  instrumentName: string;
  batchLotNumber: string;
  performedByName: string;
  performedAt: string;
  notes: string;
  createdAt: string;
}
export interface SearchHistory {
  search: string;
  reagentName?: string;
  action?: "Used" | "Consumed" | "Wasted" | "Expired" | "Returned";
  testOrderId?: string;
  intrusmentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "performedAt" | "createdAt";
  sortOrder?: 1 | -1;
}
export interface VendorSupplyReagent {
  _id: string;
  reagentId: string;
  reagentName: string;
  catalogNumber: string;
  manufacturer: string;
  casNumber: string;
  vendorName: string;
  vendorId: string;
  purchaseOrderNumber: string;
  orderDate: string;
  receiptDate: string;
  quantityReceived: number;
  unitOfMeasure: string;
  lotNumber: string;
  expirationDate: string;
  receivedBy: string;
  receivedAt: string;
  initialStorageLocation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSupplyHisSearch {
  search: string;
  reagentId?: string;
  vendorId?: string;
  vendorName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "receiptDate" | "orderDate" | "createdAt";
  sortOrder?: 1 | -1;
}
export interface ReagentInventory {
  vendorSupplyId: string;
  reagentId: string;
  reagentName: string;
  lotNumber: string;
  expirationDate: string;
  quantityReceived: number;
  quantityUsed: number;
  quantityAvailable: number;
  unitOfMeasure: string;
  status: string;
  daysUntilExpiration: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}
export interface ReagentInventorySearch {
  search?: string;
  reagentId?: string;
  reagentName?: string;
  includeExpired?: boolean;
  includeExpiringSoon?: boolean;
  page: number;
  limit: number;
}

export interface VendorSupplyHistory {
  _id: string;
  reagentId: string;
  reagentName: string;
  catalogNumber: string;
  manufacturer: string;
  casNumber: string;
  vendorName: string;
  vendorId: string;
  purchaseOrderNumber: string;
  orderDate: string;
  receiptDate: string;
  quantityReceived: number;
  unitOfMeasure: string;
  lotNumber: string;
  expirationDate: string;
  receivedBy: string;
  receivedAt: string;
  initialStorageLocation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  receivedByName: string;
}
