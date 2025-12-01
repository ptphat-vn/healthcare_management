import { ObjectId, WithId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import {
  getPatientMedicalRecordsCollection,
  type PatientMedicalRecordDocument,
  type ClinicalNote
} from '~/models/patient-medical-record.model'
import { getTestOrdersCollection } from '~/models/test-order.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'

export interface CreatePatientRecordPayload {
  userId: string
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
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
  authUserId?: string
  authUserRole?: string
}

export const createPatientRecord = async (
  payload: CreatePatientRecordPayload,
  createdBy: string
): Promise<WithId<PatientMedicalRecordDocument>> => {
  const patientRecords = getPatientMedicalRecordsCollection()
  const users = getUsersCollection()
  const roles = getRolesCollection()

  let userObjectId: ObjectId
  try {
    userObjectId = new ObjectId(payload.userId)
  } catch {
    throw new HttpError(422, 'Invalid user id')
  }

  const user = await users.findOne({ _id: userObjectId } as any)
  if (!user) throw new HttpError(404, 'User not found')
  if (!user.patientId) throw new HttpError(409, 'User does not have a patientId')

  const roleDoc = user.roleId ? await roles.findOne({ _id: user.roleId } as any) : null
  if (roleDoc?.code !== 'patient') throw new HttpError(409, 'Selected user is not a patient')

  const existingRecord = await patientRecords.findOne({ patientId: user.patientId, isDeleted: { $ne: true } } as any)
  if (existingRecord) throw new HttpError(409, 'Medical record already exists for this patient')

  const now = new Date()
  const createdByObjectId = new ObjectId(createdBy)
  const creatorUser = await users.findOne({ _id: createdByObjectId } as any)

  const doc: PatientMedicalRecordDocument = {
    patientId: user.patientId,
    fullName: (user as any).fullName,
    dateOfBirth: (user as any).dateOfBirth,
    gender: (user as any).gender,
    phoneNumber: (user as any).phoneNumber,
    email: (user as any).email,
    address: (user as any).address,
    identifyNumber: (user as any).identifyNumber,
    bloodType: payload.bloodType,
    emergencyContact: payload.emergencyContact,
    medicalHistory: payload.medicalHistory,
    insuranceInfo: payload.insuranceInfo,
    testOrders: [],
    testResults: [],
    clinicalNotes: [],
    versionHistory: [],
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
    createdBy: createdByObjectId,
    createdByName: creatorUser?.fullName || creatorUser?.email || createdByObjectId.toString()
  }

  const result = await patientRecords.insertOne(doc as any)
  const created = await patientRecords.findOne({ _id: result.insertedId } as any)

  if (!created) {
    throw new HttpError(500, 'Failed to create patient record')
  }
  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = await usersCol.findOne({ _id: createdByObjectId })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await actorRoleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: createdByObjectId, name: actor?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'CREATE_PATIENT_RECORD',
      details: `Created patient record: ID: ${doc.fullName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  await populateActorNames(created as PatientMedicalRecordDocument)

  return created as WithId<PatientMedicalRecordDocument>
}

export const updatePatientRecord = async (
  id: string,
  payload: UpdatePatientRecordPayload,
  updatedBy: string,
  authUserRole?: string
): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  const users = getUsersCollection()

  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  let updatedByUserDoc: any = null
  if (authUserRole === 'patient') {
    let updatedByObjectId: ObjectId
    try {
      updatedByObjectId = new ObjectId(updatedBy)
    } catch {
      throw new HttpError(422, 'Invalid updatedBy user id')
    }
    const authUser = await users.findOne({ _id: updatedByObjectId } as any)
    if (!authUser) {
      throw new HttpError(404, 'Authenticated user not found')
    }
    if (!authUser.patientId) {
      throw new HttpError(403, 'User does not have a patientId')
    }
    if (existingRecord.patientId !== authUser.patientId) {
      throw new HttpError(403, 'Access denied: You can only update your own medical records')
    }
    updatedByUserDoc = authUser
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
  let updatedByObjectId: ObjectId
  try {
    updatedByObjectId = new ObjectId(updatedBy)
  } catch {
    throw new HttpError(422, 'Invalid updatedBy user id')
  }
  if (!updatedByUserDoc) {
    updatedByUserDoc = await users.findOne({ _id: updatedByObjectId } as any)
  }

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
    timestamp: now
  }

  const updateData = {
    ...payload,
    updatedAt: now,
    lastModifiedBy: updatedByObjectId,
    lastModifiedByName:
      updatedByUserDoc?.fullName || updatedByUserDoc?.email || updatedByObjectId.toString()
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
  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = await usersCol.findOne({ _id: updatedByObjectId })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await actorRoleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: updatedByObjectId, name: actor?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'UPDATE_PATIENT_RECORD',
      details: `Updated patient record: ${updated.fullName} (ID: ${updated.patientId})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  await populateActorNames(updated as PatientMedicalRecordDocument)

  return updated as WithId<PatientMedicalRecordDocument>
}

export const deletePatientRecord = async (
  id: string,
  deletedBy: string,
  authUserRole?: string
): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()

  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  let deletedByUserDoc: any = null
  // If user is a patient, verify they can only delete their own record
  if (authUserRole === 'patient') {
    let deletedByObjectId: ObjectId
    try {
      deletedByObjectId = new ObjectId(deletedBy)
    } catch {
      throw new HttpError(422, 'Invalid deletedBy user id')
    }
    const authUser = await users.findOne({ _id: deletedByObjectId } as any)
    if (!authUser) {
      throw new HttpError(404, 'Authenticated user not found')
    }
    if (!authUser.patientId) {
      throw new HttpError(403, 'User does not have a patientId')
    }
    if (existingRecord.patientId !== authUser.patientId) {
      throw new HttpError(403, 'Access denied: You can only delete your own medical records')
    }
    deletedByUserDoc = authUser
  }

  const hasActiveTestOrders = await testOrders.findOne({
    patientId: existingRecord.patientId,
    status: { $in: ['pending', 'completed', 'reviewed'] }
  } as any)

  if (hasActiveTestOrders) {
    throw new HttpError(409, 'Cannot delete patient record with active test orders')
  }

  const now = new Date()
  let deletedByObjectId: ObjectId
  try {
    deletedByObjectId = new ObjectId(deletedBy)
  } catch {
    throw new HttpError(422, 'Invalid deletedBy user id')
  }
  if (!deletedByUserDoc) {
    deletedByUserDoc = await users.findOne({ _id: deletedByObjectId } as any)
  }

  const result = await patientRecords.findOneAndUpdate(
    { _id: patientObjectId } as any,
    {
      $set: {
        isDeleted: true,
        deletedAt: now,
        deletedBy: deletedByObjectId,
        deletedByName:
          deletedByUserDoc?.fullName || deletedByUserDoc?.email || deletedByObjectId.toString(),
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  )

  const deleted: any = (result as any)?.value ?? result
  if (!deleted) {
    throw new HttpError(500, 'Failed to delete patient record')
  }
  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = await usersCol.findOne({ _id: deletedByObjectId })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await actorRoleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: deletedByObjectId, name: actor?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'DELETE_PATIENT_RECORD',
      details: `Deleted patient record: ${deleted.fullName} (ID: ${deleted.patientId})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  await populateActorNames(deleted as PatientMedicalRecordDocument)

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

  if (params.authUserRole === 'patient' && params.authUserId) {
    let authUserObjectId: ObjectId
    try {
      authUserObjectId = new ObjectId(params.authUserId)
    } catch {
      throw new HttpError(422, 'Invalid auth user id')
    }
    const authUser = await users.findOne({ _id: authUserObjectId } as any)
    if (!authUser) {
      throw new HttpError(404, 'Authenticated user not found')
    }
    if (!authUser.patientId) {
      throw new HttpError(403, 'User does not have a patientId')
    }
    filter.patientId = authUser.patientId
  }

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

  const cursor = patientRecords
    .find(filter as any)
    .sort({ [sortField]: sortOrder } as any)
    .skip(skip)
    .limit(limit)
  const [patientItems, total] = await Promise.all([cursor.toArray(), patientRecords.countDocuments(filter as any)])

  const patientIds = patientItems.map((p) => p.patientId)
  const testOrderDocs = patientIds.length
    ? await testOrders
        .find({
          patientId: { $in: patientIds },
          status: { $ne: 'cancelled' }
        })
        .sort({ createdDate: -1 })
        .toArray()
    : []

  const lastTestByPatient = new Map<string, any>()
  for (const testOrder of testOrderDocs as any[]) {
    if (!lastTestByPatient.has(testOrder.patientId)) {
      lastTestByPatient.set(testOrder.patientId, testOrder)
    }
  }
  const actorIds = Array.from(
    new Set(
      patientItems
        .flatMap((patient) => [
          patient.createdBy ? patient.createdBy.toString() : null,
          patient.lastModifiedBy ? patient.lastModifiedBy.toString() : null,
          patient.deletedBy ? patient.deletedBy.toString() : null
        ])
        .filter(Boolean)
    )
  ) as string[]
  const userDocs = actorIds.length
    ? await users.find({ _id: { $in: actorIds.map((id) => new ObjectId(id)) } }).toArray()
    : []
  const idToUser = new Map<string, { fullName?: string; email?: string }>()
  const idToName = new Map<string, string>()
  for (const u of userDocs as any[]) {
    const id = String(u._id)
    idToUser.set(id, { fullName: u.fullName, email: u.email })
    idToName.set(id, u.fullName || u.email || id)
  }

  const enrichedPatients = patientItems.map((patient: any) => {
    const lastTest = lastTestByPatient.get(patient.patientId)
    const createdById = patient.createdBy ? patient.createdBy.toString() : undefined
    const lastModifiedById = patient.lastModifiedBy ? patient.lastModifiedBy.toString() : undefined
    const deletedById = patient.deletedBy ? patient.deletedBy.toString() : undefined
    const createdByUser = createdById ? idToUser.get(createdById) : undefined
    const lastModifiedByUser = lastModifiedById ? idToUser.get(lastModifiedById) : undefined
    const deletedByUser = deletedById ? idToUser.get(deletedById) : undefined
    const createdByName = patient.createdByName || (createdById ? idToName.get(createdById) : undefined)
    const lastModifiedByName =
      patient.lastModifiedByName || (lastModifiedById ? idToName.get(lastModifiedById) : undefined)
    const deletedByName = patient.deletedByName || (deletedById ? idToName.get(deletedById) : undefined)

    return {
      ...patient,
      lastTestDate: lastTest?.createdDate,
      lastTestStatus: lastTest?.status,
      createdByUser,
      lastModifiedByUser,
      deletedByUser,
      createdByName,
      lastModifiedByName,
      deletedByName
    }
  })

  return {
    patients: enrichedPatients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  }
}

export const getPatientRecordDetail = async (id: string, authUserId?: string, authUserRole?: string) => {
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

  if (authUserRole === 'patient' && authUserId) {
    let authUserObjectId: ObjectId
    try {
      authUserObjectId = new ObjectId(authUserId)
    } catch {
      throw new HttpError(422, 'Invalid auth user id')
    }
    const authUser = await users.findOne({ _id: authUserObjectId } as any)
    if (!authUser) {
      throw new HttpError(404, 'Authenticated user not found')
    }
    if (!authUser.patientId) {
      throw new HttpError(403, 'User does not have a patientId')
    }
    if (patient.patientId !== authUser.patientId) {
      throw new HttpError(403, 'Access denied: You can only view your own medical records')
    }
  }
  const patientTestOrders = await testOrders
    .find({
      patientId: patient.patientId,
      status: { $ne: 'cancelled' }
    })
    .sort({ createdDate: -1 })
    .toArray()

  const userIds = Array.from(
    new Set(
      [
        patient.createdBy,
        patient.lastModifiedBy,
        ...patientTestOrders.map((to) => to.createdBy).filter(Boolean),
        ...patientTestOrders.map((to) => to.runBy).filter(Boolean)
      ].filter(Boolean)
    )
  ) as ObjectId[]

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
  const deletedByUser = patient.deletedBy ? idToUser.get(String(patient.deletedBy)) : null
  const createdByName =
    patient.createdByName ||
    (patient.createdBy ? idToUser.get(String(patient.createdBy))?.fullName ||
      idToUser.get(String(patient.createdBy))?.email ||
      String(patient.createdBy) : undefined)
  const lastModifiedByName =
    patient.lastModifiedByName ||
    (patient.lastModifiedBy
      ? idToUser.get(String(patient.lastModifiedBy))?.fullName ||
        idToUser.get(String(patient.lastModifiedBy))?.email ||
        String(patient.lastModifiedBy)
      : undefined)
  const deletedByName =
    patient.deletedByName ||
    (patient.deletedBy
      ? idToUser.get(String(patient.deletedBy))?.fullName ||
        idToUser.get(String(patient.deletedBy))?.email ||
        String(patient.deletedBy)
      : undefined)

  return {
    ...patient,
    testOrders: enrichedTestOrders,
    createdByUser,
    lastModifiedByUser,
    deletedByUser,
    createdByName,
    lastModifiedByName,
    deletedByName
  }
}

export const addClinicalNote = async (
  patientId: string,
  note: Omit<ClinicalNote, '_id' | 'createdAt'>,
  addedBy: string,
  authUserRole?: string
): Promise<WithId<PatientMedicalRecordDocument>> => {
  let patientObjectId: ObjectId
  try {
    patientObjectId = new ObjectId(patientId)
  } catch {
    throw new HttpError(422, 'Invalid patient record id')
  }

  const patientRecords = getPatientMedicalRecordsCollection()
  const users = getUsersCollection()

  const existingRecord = await patientRecords.findOne({ _id: patientObjectId, isDeleted: { $ne: true } } as any)
  if (!existingRecord) {
    throw new HttpError(404, 'Patient record not found')
  }

  const now = new Date()
  let addedByObjectId: ObjectId
  try {
    addedByObjectId = new ObjectId(addedBy)
  } catch {
    throw new HttpError(422, 'Invalid addedBy user id')
  }

  let addedByUserDoc: any = null
  if (authUserRole === 'patient') {
    const authUser = await users.findOne({ _id: addedByObjectId } as any)
    if (!authUser) {
      throw new HttpError(404, 'Authenticated user not found')
    }
    if (!authUser.patientId) {
      throw new HttpError(403, 'User does not have a patientId')
    }
    if (existingRecord.patientId !== authUser.patientId) {
      throw new HttpError(403, 'Access denied: You can only add notes to your own medical records')
    }
    addedByUserDoc = authUser
  }
  if (!addedByUserDoc) {
    addedByUserDoc = await users.findOne({ _id: addedByObjectId } as any)
  }

  const newNote: ClinicalNote = {
    _id: new ObjectId(),
    ...note,
    createdBy: addedByObjectId,
    createdAt: now
  }

  const result = await patientRecords.findOneAndUpdate(
    { _id: patientObjectId } as any,
    {
      $push: { clinicalNotes: newNote },
      $set: {
        updatedAt: now,
        lastModifiedBy: addedByObjectId,
        lastModifiedByName:
          addedByUserDoc?.fullName || addedByUserDoc?.email || addedByObjectId.toString()
      }
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(500, 'Failed to add clinical note')
  }

  try {
    const eventLogs = getEventLogsCollection()
    const usersCol = getUsersCollection()
    const actor = await usersCol.findOne({ _id: addedByObjectId })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actor?.roleId ? await actorRoleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: addedByObjectId, name: actor?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'ADD_CLINICAL_NOTE',
      details: `Added clinical note to patient: ${updated.fullName} (ID: ${updated.patientId})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  await populateActorNames(updated as PatientMedicalRecordDocument)

  return updated as WithId<PatientMedicalRecordDocument>
}

const populateActorNames = async (
  records: PatientMedicalRecordDocument | PatientMedicalRecordDocument[]
) => {
  const items = Array.isArray(records) ? records : [records]
  const missingIds = new Set<string>()

  items.forEach((item) => {
    if (item?.createdBy && !item.createdByName) {
      missingIds.add(item.createdBy.toString())
    }
    if (item?.lastModifiedBy && !item.lastModifiedByName) {
      missingIds.add(item.lastModifiedBy.toString())
    }
    if (item?.deletedBy && !item.deletedByName) {
      missingIds.add(item.deletedBy.toString())
    }
  })

  if (missingIds.size === 0) {
    return
  }

  const users = getUsersCollection()
  const userDocs = await users
    .find(
      { _id: { $in: Array.from(missingIds).map((id) => new ObjectId(id)) } } as any,
      { projection: { fullName: 1, email: 1 } }
    )
    .toArray()

  const nameMap = new Map<string, string>(
    userDocs
      .filter((user) => user?._id)
      .map((user) => [user._id!.toString(), user.fullName || user.email || user._id!.toString()])
  )

  items.forEach((item) => {
    if (item.createdBy && !item.createdByName) {
      item.createdByName = nameMap.get(item.createdBy.toString()) || item.createdBy.toString()
    }
    if (item.lastModifiedBy && !item.lastModifiedByName) {
      item.lastModifiedByName =
        nameMap.get(item.lastModifiedBy.toString()) || item.lastModifiedBy.toString()
    }
    if (item.deletedBy && !item.deletedByName) {
      item.deletedByName = nameMap.get(item.deletedBy.toString()) || item.deletedBy.toString()
    }
  })
}
