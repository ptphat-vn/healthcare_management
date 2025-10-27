import { Router } from 'express'
import { 
  createFlaggingConfigController,
  getAllFlaggingConfigsController,
  getFlaggingConfigByIdController,
  updateFlaggingConfigController,
  deleteFlaggingConfigController
} from '~/controllers/flagging-config.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'

const flaggingConfigRouter = Router()

// Flagging Configuration Management Routes
flaggingConfigRouter.post('/flagging-configs', authMiddleware, privilegeMiddleware(['create_config']), createFlaggingConfigController)

flaggingConfigRouter.get('/flagging-configs', authMiddleware, privilegeMiddleware(['view_config']), getAllFlaggingConfigsController)

flaggingConfigRouter.get('/flagging-configs/:id', authMiddleware, privilegeMiddleware(['view_config']), getFlaggingConfigByIdController)

flaggingConfigRouter.put('/flagging-configs/:id', authMiddleware, privilegeMiddleware(['modify_config']), updateFlaggingConfigController)

flaggingConfigRouter.delete('/flagging-configs/:id', authMiddleware, privilegeMiddleware(['delete_config']), deleteFlaggingConfigController)

export default flaggingConfigRouter
