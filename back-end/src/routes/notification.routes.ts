import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import {
  getNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  getNotificationsSummaryController
} from '~/controllers/notification.controller'

const router = Router()

// list notifications for authenticated user
router.get('/notifications', authMiddleware, getNotificationsController)

// summary: unread count + latest notification (useful for badge + dropdown preview)
router.get('/notifications/summary', authMiddleware, getNotificationsSummaryController)

// mark single notification as read
router.put('/notifications/:id/read', authMiddleware, markNotificationReadController)

// mark all notifications read
router.put('/notifications/read-all', authMiddleware, markAllNotificationsReadController)

export default router
