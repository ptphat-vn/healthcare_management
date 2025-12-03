import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/error.model'
import type { CBCPanelTestName } from '~/models/test-order.model'
import { MESSAGES } from '~/constants/message.constant'

const isValidDate = (s: string): boolean => {
  const ymd = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  const mdy = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
  return ymd.test(s) || mdy.test(s)
}

const CBC_TESTS: readonly CBCPanelTestName[] = [
  'White Blood Cell Count',
  'Red Blood Cell Count',
  'Hemoglobin',
  'Hematocrit',
  'Platelet Count',
  'Mean Corpuscular Volume',
  'Mean Corpuscular Haemoglobin',
  'Mean Corpuscular Haemoglobin Concentration'
] as const

const createTestOrderSchema = z.object({
  medicalRecordId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Medical record ID is invalid'),
  requestedTests: z
    .array(z.enum(CBC_TESTS as [CBCPanelTestName, ...CBCPanelTestName[]]))
    .min(1, 'At least one test type must be selected')
})

const updateTestOrderSchema = z.object({
  patientName: z.string().min(1).optional(),
  dateOfBirth: z.string().refine(isValidDate).optional(),
  gender: z.enum(['male', 'female']).optional(),
  address: z.string().min(1).optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/).optional(),
  email: z.string().email().optional()
})

const testResultSchema = z.object({
  testName: z.string().min(1, 'Test name is required'),
  result: z.string().min(1, 'Result is required'),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  status: z.enum(['normal', 'abnormal', 'critical'], { message: 'Result status is invalid' })
})

const addTestResultSchema = z.object({
  testResults: z.array(testResultSchema).min(1, 'At least one test result is required')
})

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required')
})

const searchTestOrdersSchema = z.object({
  search: z.string().min(1).optional(),
  status: z.enum(['pending', 'cancelled', 'completed', 'reviewed', 'ai_reviewed']).optional(),
  sortBy: z.enum(['patientName', 'createdDate', 'runDate', 'status']).optional(),
  sortOrder: z.string().regex(/^[1-]$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
})

export const validateCreateTestOrder = (req: Request, res: Response, next: NextFunction) => {
  const parse = createTestOrderSchema.safeParse(req.body)
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

export const validateUpdateTestOrder = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateTestOrderSchema.safeParse(req.body)
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

export const validateAddTestResult = (req: Request, res: Response, next: NextFunction) => {
  const parse = addTestResultSchema.safeParse(req.body)
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

export const validateAddComment = (req: Request, res: Response, next: NextFunction) => {
  const parse = addCommentSchema.safeParse(req.body)
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

// Run with instrument validation
const runWithInstrumentSchema = z.object({
  instrumentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Instrument ID is invalid')
})

export const validateRunWithInstrument = (req: Request, res: Response, next: NextFunction) => {
  const parse = runWithInstrumentSchema.safeParse(req.body)
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

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required')
})

const reviewTestOrderSchema = z.object({
  resultUpdates: z.array(z.object({
    testResultId: z.string().min(1, 'Test result ID is required'),
    newResult: z.string().min(1, 'New result is required')
  })).optional()
})

export const validateUpdateComment = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateCommentSchema.safeParse(req.body)
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

export const validateReviewTestOrder = (req: Request, res: Response, next: NextFunction) => {
  const parse = reviewTestOrderSchema.safeParse(req.body)
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
