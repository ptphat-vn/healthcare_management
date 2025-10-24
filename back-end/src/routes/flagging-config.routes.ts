import { Router } from 'express'
import { 
  createFlaggingConfigController,
  getAllFlaggingConfigsController,
  getFlaggingConfigByIdController,
  updateFlaggingConfigController,
  deleteFlaggingConfigController
} from '~/controllers/flagging-config.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'

const flaggingConfigRouter = Router()

// Flagging Configuration Management Routes
flaggingConfigRouter.post('/flagging-configs', authMiddleware, roleMiddleware(['admin', 'manager']), createFlaggingConfigController)

flaggingConfigRouter.get('/flagging-configs', getAllFlaggingConfigsController)

flaggingConfigRouter.get('/flagging-configs/:id', getFlaggingConfigByIdController)

flaggingConfigRouter.put('/flagging-configs/:id', authMiddleware, roleMiddleware(['admin', 'manager']), updateFlaggingConfigController)

flaggingConfigRouter.delete('/flagging-configs/:id', authMiddleware, roleMiddleware(['admin', 'manager']), deleteFlaggingConfigController)

export default flaggingConfigRouter
