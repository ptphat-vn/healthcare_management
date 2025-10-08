import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/Error'
import { MESSAGES } from '~/constants/message'

const registerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không đúng định dạng'),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/, 'Số CMND/CCCD phải có 9-12 chữ số'),
  gender: z.enum(['male', 'female'], { message: 'Giới tính phải là nam hoặc nữ' }),
  age: z.number().int().min(1, 'Tuổi phải lớn hơn 0').max(120, 'Tuổi không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  dateOfBirth: z.string().regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, 'Ngày sinh phải đúng định dạng MM/DD/YYYY'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
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

export const validateRegister = (req: Request, _res: Response, next: NextFunction) => {
  const parse = registerSchema.safeParse(req.body)
  if (!parse.success) {
    return next(new HttpError(422, MESSAGES.VALIDATION_ERROR))
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

