import { ObjectId, WithId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { getPatientMedicalRecordsCollection, type PatientMedicalRecordDocument, type ClinicalNote } from '~/models/patient-medical-record.model'
import { getTestOrdersCollection } from '~/models/test-order.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'

export interface CreatePatientRecordPayload {
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
}

export interface UpdatePatientRecordPayload {
  fullName?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  phoneNumber?: string
  email?: string
  address?: string
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
}

export interface ListPatientRecordsParams {
  search?: string
  gender?: 'male' | 'female'
  dateOfBirthFrom?: string
  dateOfBirthTo?: string
  testType?: string
  instrumentUsed?: string
  dateRangeFrom?: string
  dateRangeTo?: string
  sortBy?: 'fullName' | 'email' | 'createdAt' | 'lastTestDate'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export const createPatientRecord = async (payload: CreatePatientRecordPayload, createdBy: string): Promise<WithId<PatientMedicalRecordDocument>> => {
  const patientRecords = getPatientMedicalRecordsCollection()
  
  const existingPatient = await patientRecords.findOne({ patientId: payload.patientId, isDeleted: { $ne: true } } as any)
  if (existingPatient) {
    throw new HttpError(409, 'Patient ID already exists')
  }

  if (payload.identifyNumber) {
    const existingIdentify = await patientRecords.findOne({ identifyNumber: payload.identifyNumber, isDeleted: { $ne: true } } as any)
    if (existingIdentify) {
      throw new HttpError(409, 'Identity number already exists')
    }
  }

  const now = new Date()
  const createdByObjectId = new ObjectId(createdBy)
  
  const doc: PatientMedicalRecordDocument = {
    ...payload,
    testOrders: [],
    clinicalNotes: [],
    versionHistory: [],
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: createdByObjectId,
  }

  const result = await patientRecords.insertOne(doc as any)
  const created = await patientRecords.findOne({ _id: result.insertedId } as any)
  
  if (!created) {
    throw new HttpError(500, 'Failed to create patient record')
  }
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: createdByObjectId,
    action: 'CREATE_PATIENT_RECORD',
    details: `Created patient record for ${payload.fullName} (ID: ${payload.patientId})`,
    timestamp: now,
  } as any)

  return created as WithId<PatientMedicalRecordDocument>
}

export const updatePatientRecord = async (id: string, payload: UpdatePatientRecordPayload, updatedBy: string): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  
  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  if (payload.identifyNumber && payload.identifyNumber !== existingRecord.identifyNumber) {
    const duplicateIdentify = await patientRecords.findOne({ 
      identifyNumber: payload.identifyNumber, 
      _id: { $ne: patientObjectId },
      isDeleted: { $ne: true }
    } as any)
    if (duplicateIdentify) {
      throw new HttpError(409, 'Identity number already exists')
    }
  }

  const now = new Date()
  const updatedByObjectId = new ObjectId(updatedBy)

  const changes: Record<string, any> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && existingRecord[key as keyof PatientMedicalRecordDocument] !== value) {
      changes[key] = {
        old: existingRecord[key as keyof PatientMedicalRecordDocument],
        new: value
      }
    }
  }

  const versionEntry = {
    _id: new ObjectId(),
    version: (existingRecord.versionHistory?.length || 0) + 1,
    changes,
    changedBy: updatedByObjectId,
    timestamp: now,
  }

  const updateData = {
    ...payload,
    updatedAt: now,
    lastModifiedBy: updatedByObjectId
  }

  const result = await patientRecords.findOneAndUpdate(
    { _id: patientObjectId } as any,
    { 
      $set: updateData,
      $push: { versionHistory: versionEntry }
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(500, 'Failed to update patient record')
  }
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: updatedByObjectId,
    action: 'UPDATE_PATIENT_RECORD',
    details: `Updated patient record for ${updated.fullName} (ID: ${updated.patientId})`,
    timestamp: now,
  } as any)

  return updated as WithId<PatientMedicalRecordDocument>
}

export const deletePatientRecord = async (id: string, deletedBy: string): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  const testOrders = getTestOrdersCollection()
  
  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  const hasActiveTestOrders = await testOrders.findOne({
    patientId: existingRecord.patientId,
    status: { $in: ['pending', 'completed', 'reviewed'] }
  } as any)

  if (hasActiveTestOrders) {
    throw new HttpError(409, 'Cannot delete patient record with active test orders')
  }

  const now = new Date()
  const deletedByObjectId = new ObjectId(deletedBy)

  const result = await patientRecords.findOneAndUpdate(
    { _id: patientObjectId } as any,
    { 
      $set: { 
        isDeleted: true,
        deletedAt: now,
        deletedBy: deletedByObjectId,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  )

  const deleted: any = (result as any)?.value ?? result
  if (!deleted) {
    throw new HttpError(500, 'Failed to delete patient record')
  }
  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: deletedByObjectId,
    action: 'DELETE_PATIENT_RECORD',
    details: `Deleted patient record for ${deleted.fullName} (ID: ${deleted.patientId})`,
    timestamp: now,
  } as any)

  return deleted as WithId<PatientMedicalRecordDocument>
}

export const listPatientRecords = async (params: ListPatientRecordsParams) => {
  const patientRecords = getPatientMedicalRecordsCollection()
  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()
  
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  
  const filter: Record<string, any> = { isDeleted: { $ne: true } }
  
  if (params.search) {
    const q = params.search
    filter.$or = [
      { fullName: { $regex: q, $options: 'i' } },
      { patientId: { $regex: q, $options: 'i' } },
      { identifyNumber: { $regex: q, $options: 'i' } },
      { phoneNumber: { $regex: q, $options: 'i' } }
    ]
  }
  
  if (params.gender) {
    filter.gender = params.gender
  }
  if (params.dateOfBirthFrom || params.dateOfBirthTo) {
    filter.dateOfBirth = {}
    if (params.dateOfBirthFrom) {
      filter.dateOfBirth.$gte = params.dateOfBirthFrom
    }
    if (params.dateOfBirthTo) {
      filter.dateOfBirth.$lte = params.dateOfBirthTo
    }
  }
  
  const sortField = params.sortBy || 'createdAt'
  const sortOrder = params.sortOrder || -1
  
  const cursor = patientRecords.find(filter as any).sort({ [sortField]: sortOrder } as any).skip(skip).limit(limit)
  const [patientItems, total] = await Promise.all([
    cursor.toArray(),
    patientRecords.countDocuments(filter as any),
  ])
  
  const patientIds = patientItems.map(p => p.patientId)
  const testOrderDocs = patientIds.length ? await testOrders.find({ 
    patientId: { $in: patientIds },
    status: { $ne: 'cancelled' }
  }).sort({ createdDate: -1 }).toArray() : []
  
  const lastTestByPatient = new Map<string, any>()
  for (const testOrder of testOrderDocs as any[]) {
    if (!lastTestByPatient.has(testOrder.patientId)) {
      lastTestByPatient.set(testOrder.patientId, testOrder)
    }
  }
  const userIds = Array.from(new Set(patientItems.map(p => p.createdBy).filter(Boolean))) as ObjectId[]
  const userDocs = userIds.length ? await users.find({ _id: { $in: userIds } }).toArray() : []
  const idToUser = new Map<string, { fullName?: string; email?: string }>()
  for (const u of userDocs as any[]) {
    idToUser.set(String(u._id), { fullName: u.fullName, email: u.email })
  }
  
  const enrichedPatients = patientItems.map((patient: any) => {
    const lastTest = lastTestByPatient.get(patient.patientId)
    const createdByUser = idToUser.get(String(patient.createdBy))
    
    return {
      ...patient,
      lastTestDate: lastTest?.createdDate,
      lastTestStatus: lastTest?.status,
      createdByUser
    }
  })
  
  return {
    patients: enrichedPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export const getPatientRecordDetail = async (id: string) => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()
  
  const patient = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!patient) {
    throw new HttpError(404, 'Patient record not found')
  }

  const patientTestOrders = await testOrders.find({ 
    patientId: patient.patientId,
    status: { $ne: 'cancelled' }
  }).sort({ createdDate: -1 }).toArray()

  const userIds = Array.from(new Set([
    patient.createdBy,
    patient.lastModifiedBy,
    ...patientTestOrders.map(to => to.createdBy).filter(Boolean),
    ...patientTestOrders.map(to => to.runBy).filter(Boolean)
  ].filter(Boolean))) as ObjectId[]
  
  const userDocs = userIds.length ? await users.find({ _id: { $in: userIds } }).toArray() : []
  const idToUser = new Map<string, { fullName?: string; email?: string }>()
  for (const u of userDocs as any[]) {
    idToUser.set(String(u._id), { fullName: u.fullName, email: u.email })
  }

  const enrichedTestOrders = patientTestOrders.map((testOrder: any) => {
    const createdByUser = testOrder.createdBy ? idToUser.get(String(testOrder.createdBy)) : null
    const runByUser = testOrder.runBy ? idToUser.get(String(testOrder.runBy)) : null
    
    return {
      ...testOrder,
      createdByUser,
      runByUser
    }
  })

  const createdByUser = idToUser.get(String(patient.createdBy))
  const lastModifiedByUser = patient.lastModifiedBy ? idToUser.get(String(patient.lastModifiedBy)) : null

  return {
    ...patient,
    testOrders: enrichedTestOrders,
    createdByUser,
    lastModifiedByUser
  }
}

export const addClinicalNote = async (patientId: string, note: Omit<ClinicalNote, '_id' | 'createdAt'>, addedBy: string): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(patientId)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  
  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  const now = new Date()
  const addedByObjectId = new ObjectId(addedBy)
  
  const newNote: ClinicalNote = {
    _id: new ObjectId(),
    ...note,
    createdBy: addedByObjectId,
    createdAt: now,
  }

  const result = await patientRecords.findOneAndUpdate(
    { _id: patientObjectId } as any,
    { 
      $push: { clinicalNotes: newNote },
      $set: { updatedAt: now, lastModifiedBy: addedByObjectId }
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(500, 'Failed to add clinical note')
  }

  const eventLogs = getEventLogsCollection()
  await eventLogs.insertOne({
    userId: addedByObjectId,
    action: 'ADD_CLINICAL_NOTE',
    details: `Added clinical note to patient ${updated.fullName} (ID: ${updated.patientId})`,
    timestamp: now,
  } as any)

  return updated as WithId<PatientMedicalRecordDocument>
}
