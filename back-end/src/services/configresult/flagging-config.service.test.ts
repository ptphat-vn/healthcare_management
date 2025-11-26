import { ObjectId } from 'mongodb'
import * as flaggingService from '~/services/configresult/flagging-config.service'
import { HttpError } from '~/models/error.model'
import * as testOrderModel from '~/models/test-order.model'
import * as userModel from '~/models/user.model'
import * as eventLogModel from '~/models/event-log.model'
import * as roleModel from '~/models/role.model'

jest.mock('~/models/test-order.model', () => ({
  getFlaggingConfigCollection: jest.fn()
}))
jest.mock('~/models/user.model', () => ({
  getUsersCollection: jest.fn()
}))
jest.mock('~/models/event-log.model', () => ({
  getEventLogsCollection: jest.fn()
}))
jest.mock('~/models/role.model', () => ({
  getRolesCollection: jest.fn()
}))

describe('Flagging Config Service', () => {
  let mockFlaggingCollection: any
  let mockUsersCollection: any
  let mockEventLogsCollection: any
  let mockRolesCollection: any

  const payload = {
    testName: 'Hemoglobin',
    normalRange: { min: 12, max: 18 },
    abnormalRange: { min: 10, max: 20 },
    criticalRange: { min: 8, max: 22 },
    unit: 'g/dL',
    flag: 'HGB'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockFlaggingCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn()
    }

    mockUsersCollection = {
      findOne: jest.fn()
    }

    mockEventLogsCollection = {
      insertOne: jest.fn()
    }

    mockRolesCollection = {
      findOne: jest.fn()
    }

    ;(testOrderModel.getFlaggingConfigCollection as jest.Mock).mockReturnValue(mockFlaggingCollection)
    ;(userModel.getUsersCollection as jest.Mock).mockReturnValue(mockUsersCollection)
    ;(eventLogModel.getEventLogsCollection as jest.Mock).mockReturnValue(mockEventLogsCollection)
    ;(roleModel.getRolesCollection as jest.Mock).mockReturnValue(mockRolesCollection)
  })

  describe('createFlaggingConfig', () => {
    it('creates config and logs event when performed by system', async () => {
      const insertedId = new ObjectId()
      mockFlaggingCollection.insertOne.mockResolvedValue({ insertedId })

      const result = await flaggingService.createFlaggingConfig(payload, 'system')

      expect(mockFlaggingCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          testName: payload.testName,
          isActive: true
        })
      )
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          operator: expect.objectContaining({ id: 'system' }),
          action: 'FLAGGING_CONFIG_CREATED'
        })
      )
      expect(result._id).toEqual(insertedId)
    })

    it('creates config and logs event when performed by user', async () => {
      const insertedId = new ObjectId()
      const actorId = new ObjectId()
      const roleId = new ObjectId()
      mockFlaggingCollection.insertOne.mockResolvedValue({ insertedId })
      mockUsersCollection.findOne.mockResolvedValue({ _id: actorId, fullName: 'Alice', roleId })
      mockRolesCollection.findOne.mockResolvedValue({ code: 'ADMIN' })

      const result = await flaggingService.createFlaggingConfig(payload, actorId.toString())

      expect(mockUsersCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(actorId.toString()) })
      expect(mockRolesCollection.findOne).toHaveBeenCalledWith({ _id: roleId })
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          operator: expect.objectContaining({ id: new ObjectId(actorId.toString()), role: 'ADMIN' }),
          action: 'FLAGGING_CONFIG_CREATED'
        })
      )
      expect(result._id).toEqual(insertedId)
    })
  })

  describe('updateFlaggingConfig', () => {
    it('throws when id is invalid', async () => {
      await expect(flaggingService.updateFlaggingConfig('bad-id', {}, 'system')).rejects.toThrow(HttpError)
    })

    it('throws when config not found', async () => {
      const id = new ObjectId().toString()
      mockFlaggingCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(flaggingService.updateFlaggingConfig(id, {}, 'system')).rejects.toThrow(HttpError)
    })

    it('updates config and logs event', async () => {
      const id = new ObjectId().toString()
      const actorId = new ObjectId()
      const roleId = new ObjectId()
      const updatedDoc = { ...payload, _id: new ObjectId() }
      mockFlaggingCollection.findOneAndUpdate.mockResolvedValue({ value: updatedDoc })
      mockUsersCollection.findOne.mockResolvedValue({ _id: actorId, fullName: 'Bob', roleId })
      mockRolesCollection.findOne.mockResolvedValue({ code: 'SUP' })

      const data = { unit: 'g/dL', flag: 'HGB' }
      const result = await flaggingService.updateFlaggingConfig(id, data, actorId.toString())

      expect(mockFlaggingCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        { $set: expect.objectContaining({ ...data, updatedAt: expect.any(Date) }) },
        { returnDocument: 'after' }
      )
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'FLAGGING_CONFIG_UPDATED',
          operator: expect.objectContaining({ id: new ObjectId(actorId.toString()), role: 'SUP' })
        })
      )
      expect(result).toEqual(updatedDoc)
    })
  })

  describe('deleteFlaggingConfig', () => {
    it('throws when id invalid', async () => {
      await expect(flaggingService.deleteFlaggingConfig('bad-id', 'system')).rejects.toThrow(HttpError)
    })

    it('throws when config not found', async () => {
      const id = new ObjectId()
      mockFlaggingCollection.findOne.mockResolvedValue(null)

      await expect(flaggingService.deleteFlaggingConfig(id.toString(), 'system')).rejects.toThrow(HttpError)
    })

    it('deletes config and logs event', async () => {
      const id = new ObjectId()
      const actorId = new ObjectId()
      const roleId = new ObjectId()
      const configDoc = { ...payload, _id: id }
      mockFlaggingCollection.findOne.mockResolvedValue(configDoc)
      mockUsersCollection.findOne.mockResolvedValue({ _id: actorId, fullName: 'Dana', roleId })
      mockRolesCollection.findOne.mockResolvedValue({ code: 'ADMIN' })

      await flaggingService.deleteFlaggingConfig(id.toString(), actorId.toString())

      expect(mockFlaggingCollection.deleteOne).toHaveBeenCalledWith({ _id: id })
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'FLAGGING_CONFIG_DELETED',
          details: `Deleted flagging configuration for test: ${configDoc.testName}`
        })
      )
    })
  })

  describe('queries', () => {
    it('getAllFlaggingConfigs returns sorted configs', async () => {
      const configs = [{ ...payload }]
      const cursor = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(configs)
      }
      mockFlaggingCollection.find.mockReturnValue(cursor)

      const result = await flaggingService.getAllFlaggingConfigs()

      expect(mockFlaggingCollection.find).toHaveBeenCalledWith({})
      expect(cursor.sort).toHaveBeenCalledWith({ testName: 1 })
      expect(result).toEqual(configs)
    })

    it('getActiveFlaggingConfigs filters by active', async () => {
      const configs = [{ ...payload, isActive: true }]
      const cursor = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(configs)
      }
      mockFlaggingCollection.find.mockReturnValue(cursor)

      const result = await flaggingService.getActiveFlaggingConfigs()

      expect(mockFlaggingCollection.find).toHaveBeenCalledWith({ isActive: true })
      expect(result).toEqual(configs)
    })

    it('getFlaggingConfigByTestName returns single config', async () => {
      const config = { ...payload, isActive: true }
      mockFlaggingCollection.findOne.mockResolvedValue(config)

      const result = await flaggingService.getFlaggingConfigByTestName(payload.testName)

      expect(mockFlaggingCollection.findOne).toHaveBeenCalledWith({ testName: payload.testName, isActive: true })
      expect(result).toEqual(config)
    })
  })

  describe('initializeDefaultFlaggingConfigs', () => {
    it('creates missing defaults only', async () => {
      const existingConfig = { ...payload }
      mockFlaggingCollection.findOne
        .mockResolvedValueOnce(existingConfig) // first default exists
        .mockResolvedValue(null) // others missing
      mockFlaggingCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() })

      await flaggingService.initializeDefaultFlaggingConfigs()

      expect(mockFlaggingCollection.insertOne).toHaveBeenCalledTimes(7)
      const firstInsertArg = mockFlaggingCollection.insertOne.mock.calls[0][0]
      expect(firstInsertArg.testName).toBe('Red Blood Cell Count')
    })
  })
})


