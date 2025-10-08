import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/Error'
import { MESSAGES } from '~/constants/message'

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
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

