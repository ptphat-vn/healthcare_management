import type { Collection, ObjectId } from 'mongodb'
import { getDb } from '~/configs/mongodb.config'

export const TEST_ORDERS_COLLECTION = 'test_orders'

export interface TestOrderDocument {
  _id?: ObjectId
  patientName: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female'
  address: string
  phoneNumber: string
  email: string
  status: 'pending' | 'cancelled' | 'completed' | 'reviewed' | 'ai_reviewed'
  createdDate: Date
  createdBy: ObjectId
  runDate?: Date
  runBy?: ObjectId
  testResults?: TestResult[]
  comments?: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface TestResult {
  _id?: ObjectId
  testName: string
  result: string
  unit?: string
  normalRange?: string
  status: 'normal' | 'abnormal' | 'critical'
  flag?: string
  hl7MessageId?: string
  rawHl7Data?: string
  processedData?: any
  createdAt: Date
  updatedAt?: Date
  reviewedBy?: ObjectId
  aiReviewedAt?: Date
}

export interface Comment {
  _id?: ObjectId
  content: string
  createdBy: ObjectId
  createdAt: Date
  updatedAt?: Date
  modifiedBy?: ObjectId
  isDeleted?: boolean
}

export interface FlaggingConfiguration {
  _id?: ObjectId
  testName: string
  normalRange: {
    min: number
    max: number
  }
  abnormalRange: {
    min?: number
    max?: number
  }
  criticalRange: {
    min?: number
    max?: number
  }
  unit: string
  flag: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const FLAGGING_CONFIG_COLLECTION = 'flagging_configurations'

export const getTestOrdersCollection = (): Collection<TestOrderDocument> => {
  return getDb().collection<TestOrderDocument>(TEST_ORDERS_COLLECTION)
}

export const getFlaggingConfigCollection = (): Collection<FlaggingConfiguration> => {
  return getDb().collection<FlaggingConfiguration>(FLAGGING_CONFIG_COLLECTION)
}
