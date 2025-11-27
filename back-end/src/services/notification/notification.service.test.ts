import { ObjectId } from 'mongodb'
import * as notificationService from './notification.service'
import * as notificationModel from '~/models/notification.model'

jest.mock('~/models/notification.model')

describe('Notification Service', () => {
  let mockNotificationsCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockNotificationsCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn()
    }

    ;(notificationModel.getNotificationsCollection as jest.Mock).mockReturnValue(mockNotificationsCollection)
  })

  describe('createNotification', () => {
    // Bad case: invalid user id -> should throw
    it('throws when user id invalid', async () => {
      await expect(notificationService.createNotification({ userId: 'bad', type: 'message' } as any)).rejects.toThrow()
    })

    // Happy case: creates notification and returns the created document
    it('creates notification and returns created doc', async () => {
      const userId = new ObjectId()
      const insertedId = new ObjectId()
      const created = { _id: insertedId, userId, type: 'message', read: false }
      mockNotificationsCollection.insertOne.mockResolvedValueOnce({ insertedId })
      mockNotificationsCollection.findOne.mockResolvedValueOnce(created)

      const result = await notificationService.createNotification({ userId: userId.toHexString(), type: 'message', title: 'T' })
      expect(mockNotificationsCollection.insertOne).toHaveBeenCalled()
      expect(result).toEqual(created)
    })
  })

  describe('listNotifications', () => {
    // Bad case: invalid user id -> should throw
    it('throws when user id invalid', async () => {
      await expect(notificationService.listNotifications({ userId: 'x' } as any)).rejects.toThrow()
    })

    // Happy case: returns paginated notifications and applies filters
    it('returns paginated notifications and applies filters', async () => {
      const userId = new ObjectId()
      const items = [{ _id: new ObjectId(), title: 'A' }]
      const cursor = { sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue(items) }
      mockNotificationsCollection.find.mockReturnValue(cursor)
      mockNotificationsCollection.countDocuments.mockResolvedValueOnce(1)

      const res = await notificationService.listNotifications({ userId: userId.toHexString(), page: 2, limit: 1 })
      expect(cursor.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(res.notifications).toEqual(items)
      expect(res.pagination.page).toBe(2)
    })
  })

  describe('markAsRead', () => {
    // Bad case: invalid ids -> should throw
    it('throws when ids invalid', async () => {
      await expect(notificationService.markAsRead('bad', 'bad')).rejects.toThrow()
    })

    // Happy case: found -> returns updated notification
    it('returns updated notification when found', async () => {
      const id = new ObjectId()
      const userId = new ObjectId()
      const updated = { _id: id, userId, read: true }
      mockNotificationsCollection.findOneAndUpdate.mockResolvedValueOnce({ value: updated })

      const res = await notificationService.markAsRead(id.toHexString(), userId.toHexString())
      expect(res).toEqual(updated)
    })

    // Bad case: not found -> should throw 404
    it('throws 404 when not found', async () => {
      mockNotificationsCollection.findOneAndUpdate.mockResolvedValueOnce(null)
      await expect(notificationService.markAsRead(new ObjectId().toHexString(), new ObjectId().toHexString())).rejects.toThrow()
    })
  })

  describe('markAllRead', () => {
    // Bad case: invalid user id -> should throw
    it('throws for invalid user id', async () => {
      await expect(notificationService.markAllRead('bad')).rejects.toThrow()
    })

    // Happy case: updateMany called and returns success
    it('calls updateMany and returns success', async () => {
      mockNotificationsCollection.updateMany.mockResolvedValueOnce({ modifiedCount: 2 })
      const userId = new ObjectId().toHexString()
      const res = await notificationService.markAllRead(userId)
      expect(mockNotificationsCollection.updateMany).toHaveBeenCalled()
      expect(res).toEqual({ success: true })
    })
  })

  describe('summary', () => {
    // Bad case: invalid user id -> should throw
    it('throws for invalid user id', async () => {
      await expect(notificationService.summary('bad')).rejects.toThrow()
    })

    // Happy case: returns count and latest when default limit
    it('returns count and latest when limit default', async () => {
      const userId = new ObjectId()
      mockNotificationsCollection.countDocuments.mockResolvedValueOnce(3)
      mockNotificationsCollection.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([{ _id: new ObjectId(), title: 'L' }]) } as any)

      const res = await notificationService.summary(userId.toHexString())
      expect(res.count).toBe(3)
      expect(res.latest).toBeDefined()
    })

    // Happy case: returns array when limit > 1
    it('returns array when limit > 1', async () => {
      const userId = new ObjectId()
      mockNotificationsCollection.countDocuments.mockResolvedValueOnce(2)
      mockNotificationsCollection.find.mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([{ _id: new ObjectId() }, { _id: new ObjectId() }]) } as any)

      const res = await notificationService.summary(userId.toHexString(), 2)
      expect(res.count).toBe(2)
      expect(Array.isArray(res.latest)).toBe(true)
    })
  })

  describe('markConversationNotificationsAsRead', () => {
    // Happy case: marks relevant notifications and returns modifiedCount
    it('marks relevant notifications and returns modifiedCount', async () => {
      mockNotificationsCollection.updateMany.mockResolvedValueOnce({ modifiedCount: 5 })
      const res = await notificationService.markConversationNotificationsAsRead('conv1', new ObjectId().toHexString())
      expect(res.modifiedCount).toBe(5)
      expect(mockNotificationsCollection.updateMany).toHaveBeenCalled()
    })
  })
})
