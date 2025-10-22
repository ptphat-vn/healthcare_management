import { Router } from 'express'
import { 
  validateCreateTestOrder, 
  validateUpdateTestOrder, 
  validateAddTestResult, 
  validateAddComment,
  validateUpdateComment,
  validateReviewTestOrder
} from '~/validations/test-order.validation'

import { 
  createTestOrderController, 
  updateTestOrderController, 
  deleteTestOrderController, 
  getTestOrderDetailController,
  getAllTestOrdersController,
  addTestResultsController,
  addCommentController,
  addTestResultsFromHL7Controller,
  reviewTestOrderController,
  aiReviewTestOrderController,
  updateCommentController,
  deleteCommentController
} from '~/controllers/test-order.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'

const testOrderRouter = Router()

// Test Order Management Routes
testOrderRouter.post('/test-orders', authMiddleware, validateCreateTestOrder, createTestOrderController)
testOrderRouter.get('/test-orders', authMiddleware, getAllTestOrdersController)
testOrderRouter.get('/test-orders/:id', authMiddleware, getTestOrderDetailController)
testOrderRouter.put('/test-orders/:id', authMiddleware, validateUpdateTestOrder, updateTestOrderController)
testOrderRouter.delete('/test-orders/:id', authMiddleware, roleMiddleware(['admin', 'manager']), deleteTestOrderController)

// Test Results Management
testOrderRouter.post('/test-orders/:id/results', authMiddleware, roleMiddleware(['admin', 'manager', 'lab_technician']), validateAddTestResult, addTestResultsController)
testOrderRouter.post('/test-orders/:id/hl7-results', authMiddleware, roleMiddleware(['admin', 'manager', 'lab_technician']), addTestResultsFromHL7Controller)

// Test Order Review
testOrderRouter.post('/test-orders/:id/review', authMiddleware, roleMiddleware(['admin', 'manager', 'lab_technician']), validateReviewTestOrder, reviewTestOrderController)
testOrderRouter.post('/test-orders/:id/ai-review', authMiddleware, roleMiddleware(['admin', 'manager', 'lab_technician']), aiReviewTestOrderController)

// Comment Management
testOrderRouter.post('/test-orders/:id/comments', authMiddleware, validateAddComment, addCommentController)
testOrderRouter.put('/test-orders/:testOrderId/comments/:commentId', authMiddleware, validateUpdateComment, updateCommentController)
testOrderRouter.delete('/test-orders/:testOrderId/comments/:commentId', authMiddleware, deleteCommentController)

export default testOrderRouter
