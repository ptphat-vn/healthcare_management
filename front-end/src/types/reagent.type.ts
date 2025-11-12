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
  createdBy: string | {
        _id: string;
        fullName: string;
        email: string;
      };
  category?: string;
  storageConditions?: string;
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
  category?: string;
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
