import { ObjectId } from 'mongodb'
import * as chatService from './chat.service'
import * as chatModel from '~/models/chat.model'
import * as userModel from '~/models/user.model'
import * as roleModel from '~/models/role.model'

jest.mock('~/models/chat.model')
jest.mock('~/models/user.model')
jest.mock('~/models/role.model')

describe('Chat Service', () => {
  let mockChatCollection: any
  let mockUsersCollection: any
  let mockRolesCollection: any
  beforeEach(() => {
    jest.clearAllMocks()

    mockChatCollection = {
      insertOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      updateMany: jest.fn()
    }

    mockUsersCollection = {
      findOne: jest.fn(),
      find: jest.fn()
    }

    mockRolesCollection = {
      find: jest.fn().mockReturnValue({ toArray: () => Promise.resolve([]) })
    }

    ;(chatModel.getChatCollection as jest.Mock).mockReturnValue(mockChatCollection)
    ;(userModel.getUsersCollection as jest.Mock).mockReturnValue(mockUsersCollection)
    ;(roleModel.getRolesCollection as jest.Mock).mockReturnValue(mockRolesCollection)
  })

  describe('getConversationId', () => {
    // Happy case: deterministic id generation regardless of input order
    it('returns deterministic id regardless of input order', () => {
      const a = new ObjectId().toString()
      const b = new ObjectId().toString()
      const id1 = chatService.getConversationId(a, b)
      const id2 = chatService.getConversationId(b, a)
      expect(id1).toBe(id2)
      expect(id1).toContain('_')
    })
  })

  describe('getSenderInfo', () => {
    // Happy case: user exists -> returns info
    it('returns user info when user exists', async () => {
      const id = new ObjectId().toString()
      mockUsersCollection.findOne.mockResolvedValueOnce({ _id: new ObjectId(id), fullName: 'Alice', avatar: 'a.png', email: 'a@x.com' })
      const info = await chatService.getSenderInfo(id)
      expect(info).toEqual({ fullName: 'Alice', avatar: 'a.png', email: 'a@x.com' })
    })

    // Bad case (not found): returns null when user missing
    it('returns null when user not found', async () => {
      mockUsersCollection.findOne.mockResolvedValueOnce(null)
      const info = await chatService.getSenderInfo(new ObjectId().toString())
      expect(info).toBeNull()
    })

    // Bad case (error): underlying DB call throws -> returns null
    it('returns null when underlying call throws', async () => {
      mockUsersCollection.findOne.mockImplementation(() => { throw new Error('db') })
      const info = await chatService.getSenderInfo(new ObjectId().toString())
      expect(info).toBeNull()
    })
  })

  describe('saveMessage & serializeMessage', () => {
    // Happy case: saveMessage persists and returns created document
    it('saves message and returns created doc', async () => {
      const payload = {
        conversationId: 'c1',
        senderId: new ObjectId().toString(),
        receiverId: new ObjectId().toString(),
        content: 'hello',
        metadata: { foo: 'bar' }
      }

      const insertedId = new ObjectId()
      mockChatCollection.insertOne.mockResolvedValueOnce({ insertedId })

      const result = await chatService.saveMessage(payload)

      expect(mockChatCollection.insertOne).toHaveBeenCalled()
      expect(result._id).toEqual(insertedId)
      expect(result.content).toBe('hello')
    })

    // Happy case: serializeMessage formats ids/dates and handles null
    it('serializeMessage converts ids and date to strings and handles null', () => {
      expect(chatService.serializeMessage(null)).toBeNull()

      const doc: any = {
        _id: new ObjectId(),
        conversationId: 'c1',
        senderId: new ObjectId(),
        receiverId: new ObjectId(),
        content: 'hi',
        metadata: { x: 1 },
        read: false,
        createdAt: new Date('2020-01-01T00:00:00.000Z')
      }

      const s = chatService.serializeMessage(doc) as any
      expect(typeof s._id).toBe('string')
      expect(typeof s.senderId).toBe('string')
      expect(typeof s.receiverId).toBe('string')
      expect(s.createdAt).toBe('2020-01-01T00:00:00.000Z')
    })
  })

  describe('getConversationMessages', () => {
    // Happy case: returns paginated messages with correct sort/skip/limit
    it('returns paginated messages and applies sort/skip/limit', async () => {
      const items = [{ _id: new ObjectId(), content: 'm' }]
      const cursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(items)
      }

      mockChatCollection.find.mockReturnValue(cursor)
      mockChatCollection.countDocuments.mockResolvedValue(1)

      const result = await chatService.getConversationMessages('conv1', 2, 5)

      expect(cursor.sort).toHaveBeenCalledWith({ createdAt: 1 })
      expect(cursor.skip).toHaveBeenCalledWith(5)
      expect(result.messages).toEqual(items)
      expect(result.pagination.page).toBe(2)
    })
  })

  describe('getRecentConversations', () => {
    // Happy case: maps conversations to partner info and role code
    it('maps conversations to partner info and role code', async () => {
      const authUserId = new ObjectId().toString()

      const convs = [
        {
          _id: 'u1_u2',
          lastMessage: 'hello world',
          lastMessageTime: new Date(),
          senderId: new ObjectId(authUserId),
          receiverId: new ObjectId()
        }
      ]

      ;(mockChatCollection.aggregate as jest.Mock).mockReturnValue({ toArray: () => Promise.resolve(convs) })

      const partner = { _id: convs[0].receiverId, fullName: 'Partner', avatar: 'p.png', roleId: new ObjectId() }
      mockUsersCollection.find.mockReturnValue({ toArray: () => Promise.resolve([partner]) } as any)

      const rolesCol: any = { find: jest.fn().mockReturnValue({ toArray: () => Promise.resolve([{ _id: partner.roleId, code: 'LAB' }]) }) }
      const roleModel = require('~/models/role.model')
      ;(roleModel.getRolesCollection as jest.Mock).mockReturnValue(rolesCol)

      const result = await chatService.getRecentConversations(authUserId, 10)

      expect(Array.isArray(result)).toBe(true)
      expect(result[0].userName).toBe('Partner')
      expect(result[0].roleCode).toBe('LAB')
    })

    // Happy/edge case: no conversations -> returns empty array
    it('returns empty array when no conversations', async () => {
      mockChatCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) })
      const res = await chatService.getRecentConversations(new ObjectId().toString())
      expect(res).toEqual([])
    })
  })

  describe('markConversationAsRead', () => {
    // Happy case: marks conversation messages as read and returns count
    it('marks messages read and returns modifiedCount', async () => {
      mockChatCollection.updateMany.mockResolvedValueOnce({ modifiedCount: 3 })
      const res = await chatService.markConversationAsRead('conv1', new ObjectId().toString())
      expect(res.modifiedCount).toBe(3)
      expect(mockChatCollection.updateMany).toHaveBeenCalled()
    })
  })
})
