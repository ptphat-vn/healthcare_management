import type { TestResults } from "./testOrder.type";

export interface MedicalRecord {
  _id?: string;
  id?: string;
  patientId: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phoneNumber: string;
  email?: string;
  address: string;
  identifyNumber?: string;
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[];
    previousSurgeries?: string[];
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate?: string;
  };
  testOrders?: string[];
  clinicalNotes?: any[];
  testResults?: PatientTestOrderWithResults[];
  versionHistory?: any[];
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy?: string;
  lastTestDate?: string
  lastTestStatus?: string

}

export interface PatientTestOrderWithResults {
  _id?: string;
  testOrderId?: string;
  testResults?: TestResults[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalRecordRequest {
  userId: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[];
    previousSurgeries?: string[];
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate?: string;
  };
}

export interface UpdateMedicalRecordRequest {
  _id: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phoneNumber?: string;
  email?: string;
  address?: string;
  identifyNumber?: string;
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[];
    previousSurgeries?: string[];
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate?: string;
  };
}
