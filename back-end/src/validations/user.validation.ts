import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'

const ymdRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
const mdyRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(\d{4})$/

const parseDate = (s: string): Date | null => {
  if (typeof s !== 'string') return null

  let year: number
  let month: number
  let day: number

  if (ymdRegex.test(s)) {
    const match = s.match(ymdRegex)
    if (!match) return null
    year = Number(match[1])
    month = Number(match[2])
    day = Number(match[3])
  } else if (mdyRegex.test(s)) {
    const match = s.match(mdyRegex)
    if (!match) return null
    month = Number(match[1])
    day = Number(match[2])
    year = Number(match[3])
  } else {
    return null
  }

  const d = new Date(year, month - 1, day)

  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null
  }

  return d
}

const isValidDate = (s: string): boolean => {
  return parseDate(s) !== null
}

const isReasonableYear = (s: string): boolean => {
  if (typeof s !== 'string') return false

  let year: number | null = null

  if (ymdRegex.test(s)) {
    const match = s.match(ymdRegex)
    year = match ? Number(match[1]) : null
  } else if (mdyRegex.test(s)) {
    const match = s.match(mdyRegex)
    year = match ? Number(match[3]) : null
  }

  if (year === null) return false

  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear
}

const isNotFutureDate = (s: string): boolean => {
  const d = parseDate(s)
  if (!d) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)

  return d <= today
}

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Email format is invalid'),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone number must contain 10-11 digits'),
  identifyNumber: z
    .string()
    .regex(/^[0-9]{9,12}$/, 'ID number must contain 9-12 digits'),
  gender: z.enum(['male', 'female'], { message: 'Gender must be male or female' }),
  address: z.string().min(1).optional(),
  dateOfBirth: z
    .string()
    .refine(
      isValidDate,
      'Date of birth must be valid in MM/DD/YYYY or YYYY-MM-DD format'
    )
    .refine(isReasonableYear, 'Year of birth must be between 1900 and the current year')
    .refine(isNotFutureDate, 'Date of birth cannot be in the future'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z
    .string()
    .refine(isValidDate, {
      message: 'Date of birth must be valid in MM/DD/YYYY or YYYY-MM-DD format',
    })
    .refine(isReasonableYear, {
      message: 'Year of birth must be between 1900 and the current year',
    })
    .refine(isNotFutureDate, { message: 'Date of birth cannot be in the future' })
    .optional(),
  gender: z.enum(['male', 'female']).optional(),
  address: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^[0-9]{10,11}$/).optional(),
  identifyNumber: z.string().regex(/^[0-9]{9,12}$/).optional(),  
  roleId: z.string().min(1, 'Role ID is required').optional(),
  status: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
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

const verifyResetTokenSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
})

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
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

export const validateVerifyResetToken = (req: Request, _res: Response, next: NextFunction) => {
  const parse = verifyResetTokenSchema.safeParse(req.body)
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


