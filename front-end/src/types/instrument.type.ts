export interface Instrument {
  _id: string;
  name: string; // Tên thiết bị
  code?: string; // Mã thiết bị (optional in backend)
  model?: string; // Model
  manufacturer?: string; // Hãng SX
  serialNumber?: string; // Serial number (backend field)
  location?: string; // Location (backend field)
  purchaseDate?: string; // Ngày mua (optional for display)
  lastMaintenanceDate?: string; // Ngày bảo trì gần nhất
  lastCalibrationDate?: string; // Lần hiệu chuẩn gần nhất
  responsiblePerson?: string; // Người phụ trách (for display)
  responsiblePersonId?: string; // ID người phụ trách
  status: InstrumentStatus; // Tình trạng
  mode?: InstrumentMode; // Ready, Maintenance, Inactive (optional for frontend)
  nextMaintenanceDate?: string; // Lịch bảo trì kế tiếp
  description?: string; // Mô tả (backend uses 'description' instead of 'notes')
  notes?: string; // Ghi chú (for compatibility)
  reagentLevel?: number; // Mức thuốc thử (%)
  modeHistory?: ModeHistory[]; // Lịch sử thay đổi mode
  isActive: boolean; // Backend field
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Backend uses: 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service'
export type InstrumentStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Out of Service';

export type InstrumentMode = 'ready' | 'maintenance' | 'inactive';

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
