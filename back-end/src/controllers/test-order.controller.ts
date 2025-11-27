import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as testOrderService from '~/services/testorder/test-order.service'

export const createTestOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.createTestOrder(req.body, authUserId.toString())
    return res.status(201).json({
      message: MESSAGES.TEST_ORDER_CREATED_SUCCESS,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const updateTestOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const allowedFields = ['patientName', 'dateOfBirth', 'gender', 'address', 'phoneNumber', 'email'] as const
    const updatePayload: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in req.body) updatePayload[key] = (req.body as any)[key]
    }
    if (Object.keys(updatePayload).length === 0) {
      throw new HttpError(422, MESSAGES.VALIDATION_ERROR)
    }

    const data = await testOrderService.updateTestOrder(
      (req.params as { id: string }).id,
      updatePayload,
      authUserId.toString()
    )
    return res.status(200).json({
      message: MESSAGES.TEST_ORDER_UPDATED_SUCCESS,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const deleteTestOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.deleteTestOrder((req.params as { id: string }).id, authUserId.toString())
    return res.status(200).json({
      message: MESSAGES.TEST_ORDER_DELETED_SUCCESS,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const getTestOrderDetailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole
    const data = await testOrderService.getTestOrderDetail(
      (req.params as { id: string }).id,
      authUserId ? authUserId.toString() : undefined,
      authUserRole
    )
    return res.status(200).json({
      message: MESSAGES.GET_TEST_ORDER_DETAIL_SUCCESS,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const getAllTestOrdersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole

    const params = {
      search: req.query.search as string,
      status: req.query.status as 'pending' | 'cancelled' | 'completed' | 'reviewed' | 'ai_reviewed',
      sortBy: req.query.sortBy as 'patientName' | 'createdDate' | 'runDate' | 'status',
      sortOrder: req.query.sortOrder ? (parseInt(req.query.sortOrder as string) as 1 | -1) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      authUserId: authUserId ? authUserId.toString() : undefined,
      authUserRole: authUserRole
    }

    const data = await testOrderService.listTestOrders(params)

    if (data.testOrders.length === 0) {
      return res.status(200).json({
        message: MESSAGES.TEST_ORDERS_NOT_FOUND,
        data: {
          testOrder: [],
          pagination: data.pagination
        }
      })
    }

    return res.status(200).json({
      message: MESSAGES.GET_TEST_ORDERS_SUCCESS,
      data: {
        testOrder: data.testOrders,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const addTestResultsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.addTestResults(
      (req.params as { id: string }).id,
      req.body.testResults,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'Test results added successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const addCommentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.addComment(
      (req.params as { id: string }).id,
      req.body.content,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'Comment added successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

// New controllers for enhanced functionality
export const addTestResultsFromHL7Controller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const { addTestResultsFromHL7 } = await import('~/services/configresult/hl7-processing.service')
    const data = await addTestResultsFromHL7((req.params as { id: string }).id, authUserId.toString())
    return res.status(200).json({
      message: 'HL7 test results processed successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const runWithInstrumentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const { addTestResultsFromHL7UsingInstrument } = await import('~/services/configresult/hl7-processing.service')
    const data = await addTestResultsFromHL7UsingInstrument(
      (req.params as { id: string }).id,
      (req.body as { instrumentId: string }).instrumentId,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'HL7 test results processed successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const reviewTestOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.reviewTestOrderResults(
      (req.params as { id: string }).id,
      authUserId.toString(),
      req.body.resultUpdates
    )
    return res.status(200).json({
      message: 'Test order reviewed successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const aiReviewTestOrderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.aiReviewTestOrderResults(
      (req.params as { id: string }).id,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'AI review completed successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const updateCommentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.updateComment(
      (req.params as { testOrderId: string }).testOrderId,
      (req.params as { commentId: string }).commentId,
      req.body.content,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'Comment updated successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const deleteCommentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await testOrderService.deleteComment(
      (req.params as { testOrderId: string }).testOrderId,
      (req.params as { commentId: string }).commentId,
      authUserId.toString()
    )
    return res.status(200).json({
      message: 'Comment deleted successfully',
      data
    })
  } catch (err) {
    next(err)
  }
}
