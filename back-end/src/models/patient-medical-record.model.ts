import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'
import type { CBCPanelTestName, TestResult } from '~/models/test-order.model'

export const PATIENT_MEDICAL_RECORDS_COLLECTION = 'patient_medical_records'

export interface PatientMedicalRecordDocument {
  _id?: ObjectId
  patientId: string 
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  phoneNumber: string
  email?: string
  address: string
  identifyNumber?: string 
  emergencyContact?: {
    name: string
    phoneNumber: string
    relationship: string
  }
  medicalHistory?: {
    allergies?: string[]
    chronicConditions?: string[]
    medications?: string[]
    previousSurgeries?: string[]
  }
  insuranceInfo?: {
    provider: string
    policyNumber: string
    expiryDate?: string
  }

  testOrders?: ObjectId[]
  testResults?: MedicalRecordTestResult[]
  clinicalNotes?: ClinicalNote[]
  versionHistory?: RecordVersion[]
  isDeleted?: boolean
  deletedAt?: Date
  deletedBy?: ObjectId
  deletedByName?: string
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId
  createdByName?: string
  lastModifiedBy?: ObjectId
  lastModifiedByName?: string
}

export interface MedicalRecordTestResult {
  testOrderId: ObjectId
  testOrderStatus: 'pending' | 'cancelled' | 'completed' | 'reviewed' | 'ai_reviewed'
  runDate?: Date
  requestedTests?: CBCPanelTestName[]
  testResults: TestResult[]
  syncedAt: Date
}

export interface ClinicalNote {
  _id?: ObjectId
  content: string
  noteType: 'general' | 'diagnosis' | 'treatment' | 'follow_up' | 'other'
  createdBy: ObjectId
  createdAt: Date
  updatedAt?: Date
  modifiedBy?: ObjectId
  isDeleted?: boolean
}

export interface RecordVersion {
  _id?: ObjectId
  version: number
  changes: Record<string, any>
  changedBy: ObjectId
  changeReason?: string
  timestamp: Date
}

export const getPatientMedicalRecordsCollection = (): Collection<PatientMedicalRecordDocument> => {
  return getDb().collection<PatientMedicalRecordDocument>(PATIENT_MEDICAL_RECORDS_COLLECTION)
}
