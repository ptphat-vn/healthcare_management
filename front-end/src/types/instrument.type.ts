export interface Instrument {
  _id: string;
  name: string; // Tên thiết bị
  code: string; // Mã thiết bị
  model: string; // Model
  manufacturer: string; // Hãng SX
  purchaseDate: string; // Ngày mua
  lastMaintenanceDate?: string; // Ngày bảo trì gần nhất
  lastCalibrationDate?: string; // Lần hiệu chuẩn gần nhất
  responsiblePerson?: string; // Người phụ trách
  responsiblePersonId?: string; // ID người phụ trách
  status: InstrumentStatus; // Tình trạng
  mode: InstrumentMode; // Ready, Maintenance, Inactive
  nextMaintenanceDate?: string; // Lịch bảo trì kế tiếp
  notes?: string; // Ghi chú
  reagentLevel?: number; // Mức thuốc thử (%)
  modeHistory?: ModeHistory[]; // Lịch sử thay đổi mode
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export type InstrumentStatus = 'active' | 'inactive' | 'maintenance';

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
  code: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  responsiblePersonId?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  reagentLevel?: number;
}

export interface UpdateInstrumentRequest {
  _id: string;
  name?: string;
  code?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  lastCalibrationDate?: string;
  responsiblePersonId?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  reagentLevel?: number;
}
