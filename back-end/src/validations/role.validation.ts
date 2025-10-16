import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { MESSAGES } from '~/constants/message.constant'

const privilegesEnum = z.array(z.string().min(1)).default(['read_only'])

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  code: z.string().regex(/^[a-z0-9_\-]+$/i, 'Role code is invalid'),
  description: z.string().optional(),
  privileges: privilegesEnum.optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  privileges: privilegesEnum.optional(),
})

export const validateCreateRole = (req: Request, res: Response, next: NextFunction) => {
  const parse = createRoleSchema.safeParse(req.body)
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

export const validateUpdateRole = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateRoleSchema.safeParse(req.body)
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


