export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms: string[];
  treatment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordRequest {
  patientId: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms: string[];
  treatment?: string;
  status?: string;
}

export interface UpdateMedicalRecordRequest {
  id: string;
  patientId: string;
  recordType: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms: string[];
  treatment?: string;
  status?: string;
}
