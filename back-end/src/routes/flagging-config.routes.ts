import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as flaggingConfigService from '~/services/flagging-config.service'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'

const flaggingConfigRouter = Router()

// Flagging Configuration Management Routes
flaggingConfigRouter.post('/flagging-configs', authMiddleware, roleMiddleware(['admin', 'manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await flaggingConfigService.createFlaggingConfig(req.body, authUserId.toString())
    return res.status(201).json({ 
      message: 'Flagging configuration created successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
})

flaggingConfigRouter.get('/flagging-configs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active === 'true'
    const data = activeOnly 
      ? await flaggingConfigService.getActiveFlaggingConfigs()
      : await flaggingConfigService.getAllFlaggingConfigs()
    
    return res.status(200).json({ 
      message: 'Flagging configurations retrieved successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
})

flaggingConfigRouter.get('/flagging-configs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await flaggingConfigService.getFlaggingConfigByTestName((req.params as { id: string }).id)
    if (!data) {
      return res.status(404).json({ message: 'Flagging configuration not found' })
    }
    
    return res.status(200).json({ 
      message: 'Flagging configuration retrieved successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
})

flaggingConfigRouter.put('/flagging-configs/:id', authMiddleware, roleMiddleware(['admin', 'manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await flaggingConfigService.updateFlaggingConfig(
      (req.params as { id: string }).id, 
      req.body, 
      authUserId.toString()
    )
    return res.status(200).json({ 
      message: 'Flagging configuration updated successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
})

flaggingConfigRouter.delete('/flagging-configs/:id', authMiddleware, roleMiddleware(['admin', 'manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await flaggingConfigService.deleteFlaggingConfig(
      (req.params as { id: string }).id, 
      authUserId.toString()
    )
    return res.status(200).json({ 
      message: 'Flagging configuration deleted successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
})

export default flaggingConfigRouter
