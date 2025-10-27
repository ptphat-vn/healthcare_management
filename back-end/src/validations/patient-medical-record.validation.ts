import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'

const isValidDate = (s: string): boolean => {
  const ymd = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  const mdy = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
  return ymd.test(s) || mdy.test(s)
}

const createPatientRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().refine(isValidDate, 'Date of birth must be in MM/DD/YYYY or YYYY-MM-DD format'),
  gender: z.enum(['male', 'female'], { message: 'Gender must be male or female' }),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { message: 'Invalid blood type' }).optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/, 'Identity number must be 9-12 digits').optional().or(z.literal('')),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Emergency contact phone must be 10-11 digits'),
    relationship: z.string().min(1, 'Relationship is required')
  }).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    previousSurgeries: z.array(z.string()).optional()
  }).optional(),
  insuranceInfo: z.object({
    provider: z.string().min(1, 'Insurance provider is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    expiryDate: z.string().refine(isValidDate, 'Expiry date must be in MM/DD/YYYY or YYYY-MM-DD format').optional().or(z.literal(''))
  }).optional()
})

const updatePatientRecordSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.string().refine(isValidDate).optional(),
  gender: z.enum(['male', 'female']).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(1).optional(),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/).optional().or(z.literal('')),
  emergencyContact: z.object({
    name: z.string().min(1),
    phoneNumber: z.string().regex(/^[0-9]{10,11}$/),
    relationship: z.string().min(1)
  }).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    previousSurgeries: z.array(z.string()).optional()
  }).optional(),
  insuranceInfo: z.object({
    provider: z.string().min(1),
    policyNumber: z.string().min(1),
    expiryDate: z.string().refine(isValidDate).optional().or(z.literal(''))
  }).optional()
})

const addClinicalNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  noteType: z.enum(['general', 'diagnosis', 'treatment', 'follow_up', 'other'], {
    message: 'Note type must be one of: general, diagnosis, treatment, follow_up, other'
  })
})

const searchPatientRecordsSchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  dateOfBirthFrom: z.string().optional(),
  dateOfBirthTo: z.string().optional(),
  testType: z.string().optional(),
  instrumentUsed: z.string().optional(),
  dateRangeFrom: z.string().optional(),
  dateRangeTo: z.string().optional(),
  sortBy: z.enum(['fullName', 'dateOfBirth', 'createdAt', 'lastTestDate']).optional(),
  sortOrder: z.string().regex(/^-?1$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
})

export const validateCreatePatientRecord = (req: Request, res: Response, next: NextFunction) => {
  const parse = createPatientRecordSchema.safeParse(req.body)
  if (!parse.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const path = issue.path.join('.') || 'form'
      if (!fieldErrors[path]) fieldErrors[path] = issue.message
    }
    return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR, errors: fieldErrors })
  }
  next()
}

export const validateUpdatePatientRecord = (req: Request, res: Response, next: NextFunction) => {
  const parse = updatePatientRecordSchema.safeParse(req.body)
  if (!parse.success || Object.keys(req.body || {}).length === 0) {
    const fieldErrors: Record<string, string> = {}
    if (!parse.success) {
      for (const issue of parse.error.issues) {
        const path = issue.path.join('.') || 'form'
        if (!fieldErrors[path]) fieldErrors[path] = issue.message
      }
    }
    return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR, errors: fieldErrors })
  }
  next()
}

export const validateAddClinicalNote = (req: Request, res: Response, next: NextFunction) => {
  const parse = addClinicalNoteSchema.safeParse(req.body)
  if (!parse.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const path = issue.path.join('.') || 'form'
      if (!fieldErrors[path]) fieldErrors[path] = issue.message
    }
    return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR, errors: fieldErrors })
  }
  next()
}

export const validateSearchPatientRecords = (req: Request, res: Response, next: NextFunction) => {
  const parse = searchPatientRecordsSchema.safeParse(req.query)
  if (!parse.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const path = issue.path.join('.') || 'form'
      if (!fieldErrors[path]) fieldErrors[path] = issue.message
    }
    return res.status(422).json({ 
      success: 'error',
      message: MESSAGES.VALIDATION_ERROR, 
      errors: fieldErrors 
    })
  }
  next()
}
