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
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'

const testOrderRouter = Router()

// Test Order Management Routes
testOrderRouter.post('/test-orders', authMiddleware, privilegeMiddleware(['create_test_order']), validateCreateTestOrder, createTestOrderController)
testOrderRouter.get('/test-orders', authMiddleware, privilegeMiddleware(['read_only']), getAllTestOrdersController)
testOrderRouter.get('/test-orders/:id', authMiddleware, privilegeMiddleware(['read_only']), getTestOrderDetailController)
testOrderRouter.put('/test-orders/:id', authMiddleware, privilegeMiddleware(['modify_test_order']), validateUpdateTestOrder, updateTestOrderController)
testOrderRouter.delete('/test-orders/:id', authMiddleware, privilegeMiddleware(['delete_test_order']), deleteTestOrderController)

// Test Results Management
testOrderRouter.post('/test-orders/:id/results', authMiddleware, privilegeMiddleware(['execute_blood_testing']), validateAddTestResult, addTestResultsController)
testOrderRouter.post('/test-orders/:id/hl7-results', authMiddleware, privilegeMiddleware(['execute_blood_testing']), addTestResultsFromHL7Controller)

// Test Order Review
testOrderRouter.post('/test-orders/:id/review', authMiddleware, privilegeMiddleware(['review_test_order']), validateReviewTestOrder, reviewTestOrderController)
testOrderRouter.post('/test-orders/:id/ai-review', authMiddleware, privilegeMiddleware(['review_test_order']), aiReviewTestOrderController)

// Comment Management
testOrderRouter.post('/test-orders/:id/comments', authMiddleware, privilegeMiddleware(['add_comment']), validateAddComment, addCommentController)
testOrderRouter.put('/test-orders/:testOrderId/comments/:commentId', authMiddleware, privilegeMiddleware(['modify_comment']), validateUpdateComment, updateCommentController)
testOrderRouter.delete('/test-orders/:testOrderId/comments/:commentId', authMiddleware, privilegeMiddleware(['delete_comment']), deleteCommentController)

export default testOrderRouter
