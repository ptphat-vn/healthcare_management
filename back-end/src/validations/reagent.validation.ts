import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { MESSAGES } from '~/constants/message.constant'
import { REAGENT_CATEGORIES } from '~/models/reagent.model'

const isValidDate = (s: string) => {
  const ymd = /^\d{4}-\d{2}-\d{2}$/
  const mdy = /^\d{2}\/\d{2}\/\d{4}$/
  return ymd.test(s) || mdy.test(s)
}

const usagePerRunSchema = z.object({
  min: z.number().positive('Min usage must be positive'),
  max: z.number().positive('Max usage must be positive'),
  unit: z.enum(['ml', 'μL', 'L'], { message: 'Unit must be ml, μL, or L' })
}).refine((data) => data.max >= data.min, {
  message: 'Max usage must be greater than or equal to min usage',
  path: ['max']
})

// CAS Number format: số-số-số (ví dụ: 7732-18-5)
const casNumberRegex = /^\d{2,7}-\d{2}-\d$/

export const createReagentSchema = z.object({
  name: z.string().min(1, 'Reagent name is required'),
  catalogNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  casNumber: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      return casNumberRegex.test(val)
    }, {
      message: 'CAS Number must be in format: number-number-number (e.g., 7732-18-5)'
    }),
  description: z.string().min(1, 'Description is required'),
  usagePerRun: usagePerRunSchema,
  ratio: z.string().optional(),
  categories: z.array(z.string()).refine(
    (categories) => categories.every(cat => REAGENT_CATEGORIES.includes(cat as any)),
    {
      message: `Each category must be one of: ${REAGENT_CATEGORIES.join(', ')}`
    }
  ).optional(),
  storageCondition: z.number().optional()
})

export const updateReagentSchema = z.object({
  name: z.string().min(1).optional(),
  catalogNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  casNumber: z.string()
    .min(1, 'CAS Number is required')
    .regex(casNumberRegex, 'CAS Number must be in format: number-number-number (e.g., 7732-18-5)')
    .optional(),
  description: z.string().min(1).optional(),
  usagePerRun: usagePerRunSchema.optional(),
  ratio: z.string().optional(),
  categories: z.array(z.string()).refine(
    (categories) => categories.every(cat => REAGENT_CATEGORIES.includes(cat as any)),
    {
      message: `Each category must be one of: ${REAGENT_CATEGORIES.join(', ')}`
    }
  ).optional(),
  storageCondition: z.number().optional(),
  isActive: z.boolean().optional()
})

export const validateCreateReagent = (req: Request, res: Response, next: NextFunction) => {
  const parse = createReagentSchema.safeParse(req.body)
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

export const validateUpdateReagent = (req: Request, res: Response, next: NextFunction) => {
  const parse = updateReagentSchema.safeParse(req.body)
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

export const validateReagentId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id?: string }
  if (!id) return res.status(400).json({ message: 'Reagent id is required' })

  const objIdRegex = /^[0-9a-fA-F]{24}$/
  if (!objIdRegex.test(id)) return res.status(422).json({ message: MESSAGES.VALIDATION_ERROR })

  next()
}

// Vendor Supply History Validations
export const createVendorSupplySchema = z.object({
  reagentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reagent id'),
  reagentName: z.string().min(1, 'Reagent name is required').optional(),
  catalogNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  casNumber: z.string().optional(),
  vendorName: z.string().min(1, 'Vendor name is required'),
  vendorId: z.string().optional(),
  purchaseOrderNumber: z.string().min(1, 'Purchase order number is required'),
  orderDate: z.string().refine(isValidDate, 'Invalid order date format').or(z.date()),
  receiptDate: z.string().refine(isValidDate, 'Invalid receipt date format').or(z.date()),
  quantityReceived: z.number().positive('Quantity received must be positive'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  lotNumber: z.string().min(1, 'Lot number is required'),
  expirationDate: z.string().refine(isValidDate, 'Invalid expiration date format').or(z.date()),
  receivedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid receivedBy user id').optional(),
  initialStorageLocation: z.string().optional(),
  status: z.enum(['Received', 'Partial Shipment', 'Returned'], {
    message: 'Status must be Received, Partial Shipment, or Returned'
  })
})

export const validateCreateVendorSupply = (req: Request, res: Response, next: NextFunction) => {
  const parse = createVendorSupplySchema.safeParse(req.body)
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

