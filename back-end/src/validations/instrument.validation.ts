import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { MESSAGES } from '~/constants/message.constant'

// Instrument Validations
export const createInstrumentSchema = z.object({
  name: z.string().min(1, 'Instrument name is required'),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Maintenance', 'Out of Service']).optional()
})

export const updateInstrumentSchema = z.object({
  name: z.string().min(1).optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['Active', 'Inactive', 'Maintenance', 'Out of Service']).optional()
})

export const validateCreateInstrument = (req: Request, res: Response, next: NextFunction) => {
  const parse = createInstrumentSchema.safeParse(req.body)
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

export const validateUpdateInstrument = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateInstrumentSchema.safeParse(req.body)
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

export const validateInstrumentId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id?: string }
  if (!id) return res.status(400).json({ message: 'Instrument id is required' })

  const objIdRegex = /^[0-9a-fA-F]{24}$/
  if (!objIdRegex.test(id)) return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR })

  next()
}

// Reagent Assignment Validations
export const addReagentToInstrumentSchema = z.object({
  reagentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reagent id'),
  quantity: z.number().positive('Quantity must be positive'),
  lotNumber: z.string().optional(),
  notes: z.string().optional()
})

export const validateAddReagentToInstrument = (req: Request, res: Response, next: NextFunction) => {
  const parse = addReagentToInstrumentSchema.safeParse(req.body)
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

export const validateAssignmentId = (req: Request, res: Response, next: NextFunction) => {
  const { assignmentId } = req.params as { assignmentId?: string }
  if (!assignmentId) return res.status(400).json({ message: 'Assignment id is required' })

  const objIdRegex = /^[0-9a-fA-F]{24}$/
  if (!objIdRegex.test(assignmentId)) return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR })

  next()
}

