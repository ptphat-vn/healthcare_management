import { Request, Response, NextFunction } from 'express'
import * as notificationService from '~/services/notification/notification.service'

export const getNotificationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })

    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const unreadOnly = req.query.unreadOnly === '1' || req.query.unreadOnly === 'true'

    const data = await notificationService.listNotifications({ userId: String(authUserId), page, limit, unreadOnly })
    return res.status(200).json({ message: 'Notifications fetched', data })
  } catch (err) {
    next(err)
  }
}

export const markNotificationReadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
    const id = (req.params as { id?: string }).id
    if (!id) return res.status(400).json({ message: 'Notification id is required' })

    const data = await notificationService.markAsRead(id, String(authUserId))
    return res.status(200).json({ message: 'Notification marked as read', data })
  } catch (err) {
    next(err)
  }
}

export const markAllNotificationsReadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
    const data = await notificationService.markAllRead(String(authUserId))
    return res.status(200).json({ message: 'All notifications marked as read', data })
  } catch (err) {
    next(err)
  }
}

export const getNotificationsSummaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' })
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 1
    const data = await notificationService.summary(String(authUserId), limit)
    return res.status(200).json({ message: 'Notifications summary', data })
  } catch (err) {
    next(err)
  }
}

export default { getNotificationsController, markNotificationReadController, markAllNotificationsReadController, getNotificationsSummaryController }
