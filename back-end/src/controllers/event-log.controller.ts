import { Request, Response, NextFunction } from 'express'
import * as eventLogService from '~/services/eventlog/event-log.service'
import { authMiddleware } from '~/middlewares/auth.middleware'

export const listEventLogsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await eventLogService.listEventLogs({
      search: req.query.search as string,
      action: req.query.action as string,
      operatorName: req.query.operatorName as string,
      operatorRole: req.query.operatorRole as string,
      sortBy: (req.query.sortBy as any) || 'timestamp',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : -1) as 1 | -1,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    })

    return res.status(200).json({ message: 'Event logs retrieved', data })
  } catch (err) {
    next(err)
  }
}

export const getEventLogController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const data = await eventLogService.getEventLogById(id)
    return res.status(200).json({ message: 'Event log retrieved', data })
  } catch (err) {
    next(err)
  }
}

export default {
  listEventLogsController,
  getEventLogController,
}
