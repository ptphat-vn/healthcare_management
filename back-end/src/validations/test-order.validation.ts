import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'

const isValidDate = (s: string): boolean => {
  const ymd = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  const mdy = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
  return ymd.test(s) || mdy.test(s)
}

const createTestOrderSchema = z.object({
  patientName: z.string().min(1, 'Tên bệnh nhân không được để trống'),
  dateOfBirth: z.string().refine(isValidDate, 'Ngày sinh phải đúng định dạng MM/DD/YYYY'),
  gender: z.enum(['male', 'female'], { message: 'Giới tính phải là nam hoặc nữ' }),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  email: z.string().email('Email không đúng định dạng')
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
  testName: z.string().min(1, 'Tên xét nghiệm không được để trống'),
  result: z.string().min(1, 'Kết quả không được để trống'),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  status: z.enum(['normal', 'abnormal', 'critical'], { message: 'Trạng thái kết quả không hợp lệ' })
})

const addTestResultSchema = z.object({
  testResults: z.array(testResultSchema).min(1, 'Phải có ít nhất một kết quả xét nghiệm')
})

const addCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống')
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

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống')
})

const reviewTestOrderSchema = z.object({
  resultUpdates: z.array(z.object({
    testResultId: z.string().min(1, 'Test result ID không được để trống'),
    newResult: z.string().min(1, 'Kết quả mới không được để trống')
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
