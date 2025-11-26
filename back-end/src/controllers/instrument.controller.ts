import { Request, Response, NextFunction } from 'express'
import * as instrumentService from '~/services/instrument/instrument.service'
import * as instrumentReagentAssignmentService from '~/services/instrusmentreagentassignment/instrument-reagent-assignment.service'

export const createInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const created = await instrumentService.createInstrument(req.body, authUserId)
    return res.status(200).json({ message: 'Instrument created successfully', data: created })
  } catch (err) {
    next(err)
  }
}

export const listInstrumentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await instrumentService.listInstruments({
      search: req.query.search as string,
      status: req.query.status as any,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      sortBy: (req.query.sortBy as any) || 'updatedAt',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : -1) as 1 | -1,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({
        message: 'No Data',
        data: {
          instruments: [],
          pagination: data.pagination
        }
      })
    }
    return res.status(200).json({
      message: 'Get instruments successfully',
      data: {
        instruments: data.instruments,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getInstrumentByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const instrument = await instrumentService.getInstrumentById(id)
    return res.status(200).json({ message: 'Get instrument successfully', data: instrument })
  } catch (err) {
    next(err)
  }
}

export const updateInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const updated = await instrumentService.updateInstrument(id, req.body, authUserId)
    return res.status(200).json({ message: 'Instrument updated successfully', data: updated })
  } catch (err) {
    next(err)
  }
}

export const deleteInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const deleted = await instrumentService.deleteInstrument(id, authUserId)
    return res.status(200).json({ message: 'Instrument deleted successfully', data: deleted })
  } catch (err) {
    next(err)
  }
}

export const addReagentToInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instrumentId = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const assignment = await instrumentReagentAssignmentService.addReagentToInstrument(
      instrumentId,
      req.body,
      authUserId
    )
    return res.status(200).json({
      message: 'Reagent added to instrument successfully using FIFO',
      data: assignment
    })
  } catch (err) {
    next(err)
  }
}

export const removeReagentFromInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = (req.params as { assignmentId: string }).assignmentId
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const removed = await instrumentReagentAssignmentService.removeReagentFromInstrument(assignmentId, authUserId)
    return res.status(200).json({
      message: 'Reagent removed from instrument successfully',
      data: removed
    })
  } catch (err) {
    next(err)
  }
}

export const getInstrumentReagentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instrumentId = (req.params as { id: string }).id
    const data = await instrumentReagentAssignmentService.getInstrumentReagents(instrumentId)
    return res.status(200).json({
      message: 'Get instrument reagents successfully',
      data: data
    })
  } catch (err) {
    next(err)
  }
}

