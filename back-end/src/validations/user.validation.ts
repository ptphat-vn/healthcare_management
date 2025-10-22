import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'

const isValidDate = (s: string): boolean => {
  const ymd = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  const mdy = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
  return ymd.test(s) || mdy.test(s)
}

const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không đúng định dạng'),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/, 'Số CMND/CCCD phải có 9-12 chữ số'),
  gender: z.enum(['male', 'female'], { message: 'Giới tính phải là nam hoặc nữ' }),
  address: z.string().min(1).optional(),
  dateOfBirth: z.string().refine(isValidDate, 'Ngày sinh phải đúng định dạng MM/DD/YYYY hoặc YYYY-MM-DD'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.string().refine(isValidDate).optional(),
  gender: z.enum(['male', 'female']).optional(),
  address: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/).optional(),
})

export const statusSchema = z.object({
  status: z.union([z.literal(0), z.literal(1), z.literal(2)])
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
})

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const parse = registerSchema.safeParse(req.body)
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

export const validateLogin = (req: Request, _res: Response, next: NextFunction) => {
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

export const validateForgotPassword = (req: Request, _res: Response, next: NextFunction) => {
  const parse = forgotPasswordSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

export const validateResetPassword = (req: Request, _res: Response, next: NextFunction) => {
  const parse = resetPasswordSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

export const validateChangePassword = (req: Request, _res: Response, next: NextFunction) => {
  const parse = changePasswordSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export const validateRefreshToken = (req: Request, _res: Response, next: NextFunction) => {
  const parse = refreshTokenSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateUserSchema.safeParse(req.body)
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

export const validateStatusChange = (req: Request, _res: Response, next: NextFunction) => {
  const parse = statusSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}

// Search users validation
const searchUsersSchema = z.object({
  search: z.string().min(1).optional(),
  role: z.string().optional(),
  status: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
})

export const validateSearchUsers = (req: Request, _res: Response, next: NextFunction) => {
  const parse = searchUsersSchema.safeParse(req.query)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
  }
  next()
}


