import { ObjectId } from 'mongodb'
import {
  updateUser,
  updateUserStatus,
  deleteUser,
  blockUser,
  listUsers,
  listUsersByRoleCodes,
  getUserDetail,
  uploadToCloudinary,
  deleteFromCloudinary
} from '../user.service'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as userModel from '~/models/user.model'
import * as roleModel from '~/models/role.model'
import * as eventLogModel from '~/models/event-log.model'
import cloudinary from '~/configs/cloundinary.config'
import streamifier from 'streamifier'

// Mock các dependencies
jest.mock('~/models/user.model')
jest.mock('~/models/role.model')
jest.mock('~/models/event-log.model')
jest.mock('~/configs/cloundinary.config')
jest.mock('streamifier')

describe('User Service', () => {
  let mockUsersCollection: any
  let mockRolesCollection: any
  let mockEventLogsCollection: any

  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks()

    // Tạo mock collections
    mockUsersCollection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn()
    }

    mockRolesCollection = {
      findOne: jest.fn(),
      find: jest.fn()
    }

    mockEventLogsCollection = {
      insertOne: jest.fn()
    }

    // Mock các hàm get collection
    ;(userModel.getUsersCollection as jest.Mock) = jest.fn(() => mockUsersCollection)
    ;(roleModel.getRolesCollection as jest.Mock) = jest.fn(() => mockRolesCollection)
    ;(eventLogModel.getEventLogsCollection as jest.Mock) = jest.fn(() => mockEventLogsCollection)
  })

  describe('updateUser', () => {
    const validUserId = new ObjectId().toString()
    const validRoleId = new ObjectId().toString()
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '123456789',
      roleId: new ObjectId(validRoleId),
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashedPassword'
    }

    it('should update user successfully', async () => {
      const updatePayload = { fullName: 'Updated Name' }
      const updatedUser = { ...mockUser, ...updatePayload }

      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await updateUser(validUserId, updatePayload)

      expect(mockUsersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(validUserId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            fullName: 'Updated Name',
            updatedAt: expect.any(Date)
          })
        }),
        { returnDocument: 'after' }
      )
      expect(result.fullName).toBe('Updated Name')
      expect(result.passwordHash).toBeUndefined()
    })

    it('should throw error for invalid user id', async () => {
      await expect(updateUser('invalid-id', { fullName: 'Test' })).rejects.toThrow(HttpError)
      await expect(updateUser('invalid-id', { fullName: 'Test' })).rejects.toThrow('Invalid user id')
    })

    it('should throw error if email already exists', async () => {
      const updatePayload = { email: 'existing@example.com' }
      // Mock findOne to return existing user with different ID (email duplicate check)
      mockUsersCollection.findOne.mockResolvedValue({ _id: new ObjectId() })

      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(HttpError)
      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(MESSAGES.EMAIL_EXISTS)
    })

    it('should throw error if phone number already exists', async () => {
      const updatePayload = { phoneNumber: '999999999' }
      mockUsersCollection.findOne
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce({ _id: new ObjectId() }) // Phone check fails

      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(HttpError)
      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(MESSAGES.PHONE_EXISTS)
    })

    it('should validate and update roleId', async () => {
      const updatePayload = { roleId: validRoleId }
      const mockRole = {
        _id: new ObjectId(validRoleId),
        name: 'Admin',
        code: 'ADMIN'
      }
      const updatedUser = { ...mockUser, roleId: new ObjectId(validRoleId) }

      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await updateUser(validUserId, updatePayload)

      expect(mockRolesCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(validRoleId) })
      expect(result.roleId).toEqual(new ObjectId(validRoleId))
    })

    it('should throw error for invalid roleId', async () => {
      const updatePayload = { roleId: 'invalid-role-id' }

      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(HttpError)
      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow('Invalid role ID')
    })

    it('should throw error if role not found', async () => {
      const updatePayload = { roleId: validRoleId }
      mockRolesCollection.findOne.mockResolvedValue(null)

      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(HttpError)
      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow('Role not found')
    })

    it('should throw error if user not found', async () => {
      const updatePayload = { fullName: 'Updated Name' }
      // Mock findOneAndUpdate to return null (user not found)
      mockUsersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow(HttpError)
      await expect(updateUser(validUserId, updatePayload)).rejects.toThrow('User not found')
    })

    it('should create event log when user is updated', async () => {
      const updatePayload = { fullName: 'Updated Name' }
      const updatedUser = { ...mockUser, ...updatePayload }

      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await updateUser(validUserId, updatePayload)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_UPDATED',
          details: `Updated user: ${updatedUser.fullName}`,
          timestamp: expect.any(Date)
        })
      )
    })

    it('should use performedBy for event log operator', async () => {
      const updatePayload = { fullName: 'Updated Name' }
      const updatedUser = { ...mockUser, ...updatePayload }
      const performerId = new ObjectId().toString()
      const performer = {
        _id: new ObjectId(performerId),
        fullName: 'Performer User',
        roleId: new ObjectId(validRoleId)
      }
      const performerRole = { _id: new ObjectId(validRoleId), code: 'ADMIN' }

      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockUsersCollection.findOne.mockResolvedValue(performer)
      mockRolesCollection.findOne.mockResolvedValue(performerRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await updateUser(validUserId, updatePayload, performerId)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          operator: expect.objectContaining({
            id: performer._id,
            name: performer.fullName,
            role: performerRole.code
          })
        })
      )
    })
  })

  describe('updateUserStatus', () => {
    const validUserId = new ObjectId().toString()
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      roleId: new ObjectId(),
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashedPassword'
    }

    it('should update user status to active (1)', async () => {
      const updatedUser = { ...mockUser, status: 1 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await updateUserStatus(validUserId, 1)

      expect(mockUsersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(validUserId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 1,
            updatedAt: expect.any(Date)
          })
        }),
        { returnDocument: 'after' }
      )
      expect(result.status).toBe(1)
      expect(result.passwordHash).toBeUndefined()
    })

    it('should update user status to inactive (0)', async () => {
      const updatedUser = { ...mockUser, status: 0 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await updateUserStatus(validUserId, 0)

      expect(result.status).toBe(0)
    })

    it('should update user status to locked (2)', async () => {
      const updatedUser = { ...mockUser, status: 2 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await updateUserStatus(validUserId, 2)

      expect(result.status).toBe(2)
    })

    it('should throw error for invalid user id', async () => {
      await expect(updateUserStatus('invalid-id', 1)).rejects.toThrow(HttpError)
      await expect(updateUserStatus('invalid-id', 1)).rejects.toThrow('Invalid user id')
    })

    it('should throw error if user not found', async () => {
      mockUsersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(updateUserStatus(validUserId, 1)).rejects.toThrow(HttpError)
      await expect(updateUserStatus(validUserId, 1)).rejects.toThrow('User not found')
    })

    it('should create event log with correct action for status 0', async () => {
      const updatedUser = { ...mockUser, status: 0 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await updateUserStatus(validUserId, 0)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_INACTIVE'
        })
      )
    })

    it('should create event log with correct action for status 1', async () => {
      const updatedUser = { ...mockUser, status: 1 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await updateUserStatus(validUserId, 1)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_ACTIVE'
        })
      )
    })

    it('should create event log with correct action for status 2', async () => {
      const updatedUser = { ...mockUser, status: 2 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await updateUserStatus(validUserId, 2)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_LOCKED'
        })
      )
    })
  })

  describe('deleteUser', () => {
    const validUserId = new ObjectId().toString()
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      roleId: new ObjectId(),
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashedPassword'
    }

    it('should set user status to 0 (inactive)', async () => {
      const updatedUser = { ...mockUser, status: 0 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await deleteUser(validUserId)

      expect(mockUsersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(validUserId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 0,
            updatedAt: expect.any(Date)
          })
        }),
        { returnDocument: 'after' }
      )
      expect(result.status).toBe(0)
      expect(result.passwordHash).toBeUndefined()
    })

    it('should throw error for invalid user id', async () => {
      await expect(deleteUser('invalid-id')).rejects.toThrow(HttpError)
      await expect(deleteUser('invalid-id')).rejects.toThrow('Invalid user id')
    })

    it('should throw error if user not found', async () => {
      mockUsersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(deleteUser(validUserId)).rejects.toThrow(HttpError)
      await expect(deleteUser(validUserId)).rejects.toThrow('User not found')
    })

    it('should create event log with USER_INACTIVE action', async () => {
      const updatedUser = { ...mockUser, status: 0 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await deleteUser(validUserId)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_INACTIVE',
          details: `User deleted: ${updatedUser.fullName}`
        })
      )
    })
  })

  describe('blockUser', () => {
    const validUserId = new ObjectId().toString()
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      roleId: new ObjectId(),
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashedPassword'
    }

    it('should set user status to 2 (locked)', async () => {
      const updatedUser = { ...mockUser, status: 2 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })

      const result = await blockUser(validUserId)

      expect(mockUsersCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(validUserId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 2,
            updatedAt: expect.any(Date)
          })
        }),
        { returnDocument: 'after' }
      )
      expect(result.status).toBe(2)
      expect(result.passwordHash).toBeUndefined()
    })

    it('should throw error for invalid user id', async () => {
      await expect(blockUser('invalid-id')).rejects.toThrow(HttpError)
      await expect(blockUser('invalid-id')).rejects.toThrow('Invalid user id')
    })

    it('should throw error if user not found', async () => {
      mockUsersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(blockUser(validUserId)).rejects.toThrow(HttpError)
      await expect(blockUser(validUserId)).rejects.toThrow('User not found')
    })

    it('should create event log with USER_LOCKED action', async () => {
      const updatedUser = { ...mockUser, status: 2 }
      mockUsersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedUser })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await blockUser(validUserId)

      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_LOCKED',
          details: `User blocked: ${updatedUser.fullName}`
        })
      )
    })
  })

  describe('listUsers', () => {
    const mockUsers = [
      {
        _id: new ObjectId(),
        fullName: 'User 1',
        email: 'user1@example.com',
        phoneNumber: '111111111',
        roleId: new ObjectId(),
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash1'
      },
      {
        _id: new ObjectId(),
        fullName: 'User 2',
        email: 'user2@example.com',
        phoneNumber: '222222222',
        roleId: new ObjectId(),
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash2'
      }
    ]

    const mockRoles = [
      {
        _id: mockUsers[0].roleId,
        code: 'ADMIN',
        name: 'Administrator'
      },
      {
        _id: mockUsers[1].roleId,
        code: 'USER',
        name: 'User'
      }
    ]

    it('should list users with default pagination', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue(mockRoles)
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(2)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      const result = await listUsers({})

      expect(result.users).toHaveLength(2)
      expect(result.users[0].passwordHash).toBeUndefined()
      expect(result.users[0].roleCode).toBe('ADMIN')
      expect(result.users[0].roleName).toBe('Administrator')
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBe(2)
    })

    it('should filter users by search query', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([mockUsers[0]])
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue([mockRoles[0]])
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(1)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      const result = await listUsers({ search: 'User 1' })

      expect(mockUsersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { email: { $regex: 'User 1', $options: 'i' } },
            { fullName: { $regex: 'User 1', $options: 'i' } },
            { phoneNumber: { $regex: 'User 1', $options: 'i' } }
          ])
        })
      )
      expect(result.users).toHaveLength(1)
    })

    it('should filter users by status', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue(mockRoles)
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(2)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      await listUsers({ status: 1 })

      expect(mockUsersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 1
        })
      )
    })

    it('should handle custom pagination', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([mockUsers[0]])
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue([mockRoles[0]])
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(2)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      const result = await listUsers({ page: 2, limit: 1 })

      expect(result.pagination.page).toBe(2)
      expect(result.pagination.limit).toBe(1)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.totalPages).toBe(2)
    })

    it('should sort users by specified field', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue(mockRoles)
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(2)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      await listUsers({ sortBy: 'fullName', sortOrder: 1 })

      expect(mockCursor.sort).toHaveBeenCalledWith({ fullName: 1 })
    })

    it('should handle users without roles', async () => {
      const userWithoutRole = {
        ...mockUsers[0],
        roleId: null
      }
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([userWithoutRole])
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue([])
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(1)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      const result = await listUsers({})

      expect(result.users[0].roleCode).toBeUndefined()
      expect(result.users[0].roleName).toBeUndefined()
    })
  })

  describe('listUsersByRoleCodes', () => {
    const roleId1 = new ObjectId()
    const roleId2 = new ObjectId()
    const mockRole1 = { _id: roleId1, code: 'ADMIN', name: 'Administrator' }
    const mockRole2 = { _id: roleId2, code: 'USER', name: 'User' }

    const mockUsers = [
      {
        _id: new ObjectId(),
        fullName: 'Admin User',
        email: 'admin@example.com',
        roleId: roleId1,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: 'hash1'
      }
    ]

    it('should filter users by role codes', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor1 = {
        toArray: jest.fn().mockResolvedValue([mockRole1])
      }

      const mockRoleCursor2 = {
        toArray: jest.fn().mockResolvedValue([mockRole1])
      }

      mockRolesCollection.find.mockReturnValueOnce(mockRoleCursor1).mockReturnValueOnce(mockRoleCursor2)
      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(1)

      const result = await listUsersByRoleCodes({ roleCodes: ['ADMIN'] })

      expect(mockRolesCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          code: { $in: ['ADMIN'] }
        })
      )
      expect(mockUsersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: { $in: [roleId1] }
        })
      )
      expect(result.users).toHaveLength(1)
    })

    it('should handle empty role codes', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor = {
        toArray: jest.fn().mockResolvedValue([mockRole1])
      }

      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(1)
      mockRolesCollection.find.mockReturnValue(mockRoleCursor)

      const result = await listUsersByRoleCodes({ roleCodes: [] })

      expect(mockUsersCollection.find).toHaveBeenCalledWith(
        expect.not.objectContaining({
          roleId: expect.anything()
        })
      )
      expect(result.users).toHaveLength(1)
    })

    it('should combine role filter with search and status', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockUsers)
      }

      const mockRoleCursor1 = {
        toArray: jest.fn().mockResolvedValue([mockRole1])
      }

      const mockRoleCursor2 = {
        toArray: jest.fn().mockResolvedValue([mockRole1])
      }

      mockRolesCollection.find.mockReturnValueOnce(mockRoleCursor1).mockReturnValueOnce(mockRoleCursor2)
      mockUsersCollection.find.mockReturnValue(mockCursor)
      mockUsersCollection.countDocuments.mockResolvedValue(1)

      await listUsersByRoleCodes({
        roleCodes: ['ADMIN'],
        search: 'Admin',
        status: 1
      })

      expect(mockUsersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          status: 1,
          roleId: { $in: [roleId1] }
        })
      )
    })
  })

  describe('getUserDetail', () => {
    const validUserId = new ObjectId().toString()
    const roleId = new ObjectId()
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      roleId: roleId,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hashedPassword'
    }

    const mockRole = {
      _id: roleId,
      name: 'Administrator',
      code: 'ADMIN'
    }

    it('should get user detail successfully', async () => {
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)

      const result = await getUserDetail(validUserId)

      expect(mockUsersCollection.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(validUserId)
      })
      expect(result).not.toHaveProperty('passwordHash')
      expect(result).not.toHaveProperty('roleId')
      expect(result.roleName).toBe('Administrator')
      expect(result.fullName).toBe('Test User')
      expect(result.email).toBe('test@example.com')
    })

    it('should throw error if user not found', async () => {
      mockUsersCollection.findOne.mockResolvedValue(null)

      await expect(getUserDetail(validUserId)).rejects.toThrow(HttpError)
      await expect(getUserDetail(validUserId)).rejects.toThrow(MESSAGES.USER_NOT_FOUND)
    })

    it('should handle user without role', async () => {
      const userWithoutRole = { ...mockUser, roleId: null }
      mockUsersCollection.findOne.mockResolvedValue(userWithoutRole)

      const result = await getUserDetail(validUserId)

      expect(result.roleName).toBeNull()
    })
  })

  describe('uploadToCloudinary', () => {
    const mockBuffer = Buffer.from('test image data')
    const mockResult = {
      secure_url: 'https://cloudinary.com/image.jpg',
      public_id: 'avatars/test123'
    }

    it('should upload buffer to cloudinary successfully', async () => {
      const mockUploadStream = {
        on: jest.fn(),
        pipe: jest.fn()
      }

      const mockReadStream = {
        pipe: jest.fn().mockReturnValue(mockUploadStream)
      }

      ;(streamifier.createReadStream as jest.Mock) = jest.fn().mockReturnValue(mockReadStream)
      ;(cloudinary.uploader.upload_stream as jest.Mock) = jest.fn((options, callback) => {
        callback(null, mockResult)
        return mockUploadStream
      })

      const result = await uploadToCloudinary(mockBuffer, 'avatars')

      expect(streamifier.createReadStream).toHaveBeenCalledWith(mockBuffer)
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'avatars' },
        expect.any(Function)
      )
      expect(result.url).toBe(mockResult.secure_url)
      expect(result.public_id).toBe(mockResult.public_id)
    })

    it('should use default folder if not provided', async () => {
      const mockUploadStream = {
        on: jest.fn(),
        pipe: jest.fn()
      }

      const mockReadStream = {
        pipe: jest.fn().mockReturnValue(mockUploadStream)
      }

      ;(streamifier.createReadStream as jest.Mock) = jest.fn().mockReturnValue(mockReadStream)
      ;(cloudinary.uploader.upload_stream as jest.Mock) = jest.fn((options, callback) => {
        callback(null, mockResult)
        return mockUploadStream
      })

      await uploadToCloudinary(mockBuffer)

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'avatars' },
        expect.any(Function)
      )
    })

    it('should reject on upload error', async () => {
      const mockError = new Error('Upload failed')
      const mockUploadStream = {
        on: jest.fn(),
        pipe: jest.fn()
      }

      const mockReadStream = {
        pipe: jest.fn().mockReturnValue(mockUploadStream)
      }

      ;(streamifier.createReadStream as jest.Mock) = jest.fn().mockReturnValue(mockReadStream)
      ;(cloudinary.uploader.upload_stream as jest.Mock) = jest.fn((options, callback) => {
        callback(mockError, null)
        return mockUploadStream
      })

      await expect(uploadToCloudinary(mockBuffer)).rejects.toThrow('Upload failed')
    })
  })

  describe('deleteFromCloudinary', () => {
    it('should delete from cloudinary successfully', async () => {
      const publicId = 'avatars/test123'
      const mockResult = { result: 'ok' }

      ;(cloudinary.uploader.destroy as jest.Mock) = jest.fn().mockResolvedValue(mockResult)

      const result = await deleteFromCloudinary(publicId)

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId)
      expect(result).toEqual(mockResult)
    })

    it('should return early if publicId is empty', async () => {
      const result = await deleteFromCloudinary('')

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should return early if publicId is not provided', async () => {
      const result = await deleteFromCloudinary(null as any)

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})

