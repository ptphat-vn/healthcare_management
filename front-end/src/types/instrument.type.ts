import type { ReagentInstrument } from "./reagent.type";

export interface Instrument {
  _id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  description: string;
  isActive: boolean;
  status: InstrumentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

// Backend uses: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
export type InstrumentStatus =
  | "Active"
  | "Inactive"
  | "Maintenance"
  | "Out of Service";

export type InstrumentMode = "ready" | "maintenance" | "inactive";

export interface ModeHistory {
  _id?: string;
  previousMode: InstrumentMode;
  newMode: InstrumentMode;
  reason?: string;
  changedBy: string;
  changedByName?: string;
  timestamp: Date;
  qcPassed?: boolean; // Cho trường hợp chuyển sang Ready
}

export interface ChangeInstrumentModeRequest {
  newMode: InstrumentMode;
  reason?: string;
  qcPassed?: boolean;
}

export interface CreateInstrumentRequest {
  name: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  description?: string;
  status?: InstrumentStatus;
}

export interface UpdateInstrumentRequest {
  name?: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
  status?: InstrumentStatus;
}
export interface InstrumentReagents {
  instrument: Instrument;
  reagents: ReagentInstrument[];
}
