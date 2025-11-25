import { ObjectId } from 'mongodb'
import {
  createInstrument,
  listInstruments,
  getInstrumentById,
  updateInstrument,
  deleteInstrument,
  type CreateInstrumentPayload
} from '../instrument.service'
import { HttpError } from '~/models/error.model'
import type { InstrumentDocument } from '~/models/instrument.model'
import * as instrumentModel from '~/models/instrument.model'
import * as instrumentReagentAssignmentModel from '~/models/instrument-reagent-assignment.model'
import * as userModel from '~/models/user.model'
import * as eventLogModel from '~/models/event-log.model'
import * as roleModel from '~/models/role.model'

jest.mock('~/models/instrument.model')
jest.mock('~/models/instrument-reagent-assignment.model')
jest.mock('~/models/user.model')
jest.mock('~/models/event-log.model')
jest.mock('~/models/role.model')

describe('Instrument Service', () => {
  let mockInstrumentsCollection: any
  let mockInstrumentReagentAssignmentCollection: any
  let mockUsersCollection: any
  let mockEventLogsCollection: any
  let mockRolesCollection: any

  const buildInstrument = (overrides: Partial<InstrumentDocument> = {}): InstrumentDocument => {
    return {
      _id: new ObjectId(),
      name: 'Analyzer X',
      model: 'X100',
      manufacturer: 'Acme',
      serialNumber: 'SN-001',
      location: 'Lab 1',
      description: 'General analyzer',
      categories: ['Hematology', 'Biochemistry'],
      isActive: true,
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(),
      ...overrides
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockInstrumentsCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      updateOne: jest.fn(),
      findOneAndDelete: jest.fn()
    }

    mockInstrumentReagentAssignmentCollection = {
      findOne: jest.fn()
    }

    mockUsersCollection = {
      findOne: jest.fn(),
      find: jest.fn()
    }

    mockEventLogsCollection = {
      insertOne: jest.fn()
    }

    mockRolesCollection = {
      findOne: jest.fn()
    }

    ;(instrumentModel.getInstrumentsCollection as jest.Mock).mockReturnValue(mockInstrumentsCollection)
    ;(instrumentReagentAssignmentModel.getInstrumentReagentAssignmentCollection as jest.Mock).mockReturnValue(
      mockInstrumentReagentAssignmentCollection
    )
    ;(userModel.getUsersCollection as jest.Mock).mockReturnValue(mockUsersCollection)
    ;(eventLogModel.getEventLogsCollection as jest.Mock).mockReturnValue(mockEventLogsCollection)
    ;(roleModel.getRolesCollection as jest.Mock).mockReturnValue(mockRolesCollection)
  })

  describe('createInstrument', () => {
    it('creates a new instrument and logs event', async () => {
      const createdBy = new ObjectId().toString()
      const insertedId = new ObjectId()
      const creator = { _id: new ObjectId(createdBy), fullName: 'Alice Admin', roleId: new ObjectId() }
      const createdDoc = buildInstrument({
        _id: insertedId,
        createdBy: creator._id,
        categories: ['Hematology']
      })

      mockInstrumentsCollection.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdDoc)
      mockInstrumentsCollection.insertOne.mockResolvedValue({ insertedId })
      mockUsersCollection.findOne.mockResolvedValue(creator)
      mockEventLogsCollection.insertOne.mockResolvedValue({})
      mockRolesCollection.findOne.mockResolvedValue({ code: 'ADMIN' })

      const payload: CreateInstrumentPayload = {
        name: 'Analyzer New',
        categories: ['Hematology', 'Hematology'],
        status: 'Maintenance' as const
      }

      const result = await createInstrument(payload, createdBy)

      expect(mockInstrumentsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: payload.name,
          categories: ['Hematology'],
          createdBy: new ObjectId(createdBy),
          createdByName: creator.fullName
        })
      )
      expect(result).toEqual(createdDoc)
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE_INSTRUMENT',
          details: `Created instrument: ${createdDoc.name}`
        })
      )
    })

    it('throws when instrument name already exists', async () => {
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(buildInstrument())

      await expect(
        createInstrument(
          {
            name: 'Analyzer Existing',
            categories: ['Hematology']
          },
          new ObjectId().toString()
        )
      ).rejects.toThrow(HttpError)
    })
  })

  describe('listInstruments', () => {
    it('returns paginated instruments with actor names', async () => {
      const createdBy = new ObjectId()
      const modifier = new ObjectId()
      const items = [
        buildInstrument({
          createdBy,
          lastModifiedBy: modifier
        })
      ]
      const cursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(items)
      }
      const usersCursor = {
        toArray: jest.fn().mockResolvedValue([
          { _id: createdBy, fullName: 'Creator' },
          { _id: modifier, fullName: 'Modifier' }
        ])
      }

      mockInstrumentsCollection.find.mockReturnValue(cursor)
      mockInstrumentsCollection.countDocuments.mockResolvedValue(1)
      mockUsersCollection.find.mockReturnValue(usersCursor)

      const result = await listInstruments({ page: 2, limit: 5, sortBy: 'name', sortOrder: 1 })

      expect(cursor.sort).toHaveBeenCalledWith({ name: 1 })
      expect(cursor.skip).toHaveBeenCalledWith(5)
      expect(result.pagination).toEqual(
        expect.objectContaining({
          page: 2,
          limit: 5,
          total: 1,
          totalPages: 1
        })
      )
      expect(result.instruments[0].createdByName).toBe('Creator')
      expect(result.instruments[0].lastModifiedByName).toBe('Modifier')
    })

    it('applies filters when search, status and isActive are provided', async () => {
      const cursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([])
      }
      mockInstrumentsCollection.find.mockReturnValue(cursor)
      mockInstrumentsCollection.countDocuments.mockResolvedValue(0)

      await listInstruments({
        search: 'Analyzer',
        status: 'Active',
        isActive: true
      })

      expect(mockInstrumentsCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.any(Array),
          status: 'Active',
          isActive: true
        })
      )
    })
  })

  describe('getInstrumentById', () => {
    it('returns instrument with actor names', async () => {
      const createdBy = new ObjectId()
      const modifier = new ObjectId()
      const instrument = buildInstrument({
        createdBy,
        lastModifiedBy: modifier,
        createdByName: undefined,
        lastModifiedByName: undefined
      })
      const userCursor = {
        toArray: jest.fn().mockResolvedValue([
          { _id: createdBy, fullName: 'Creator' },
          { _id: modifier, email: 'modifier@example.com' }
        ])
      }

      mockInstrumentsCollection.findOne.mockResolvedValue(instrument)
      mockUsersCollection.find.mockReturnValue(userCursor)

      const result = await getInstrumentById(instrument._id!.toString())

      expect(result.createdByName).toBe('Creator')
      expect(result.lastModifiedByName).toBe('modifier@example.com')
    })

    it('throws for invalid id format', async () => {
      await expect(getInstrumentById('invalid')).rejects.toThrow(HttpError)
    })

    it('throws when instrument not found', async () => {
      mockInstrumentsCollection.findOne.mockResolvedValue(null)

      await expect(getInstrumentById(new ObjectId().toString())).rejects.toThrow(HttpError)
    })
  })

  describe('updateInstrument', () => {
    it('updates instrument, deduplicates categories and logs event', async () => {
      const instrumentId = new ObjectId()
      const modifierId = new ObjectId()
      const existing = buildInstrument({ _id: instrumentId, name: 'Analyzer Old' })
      const updated = buildInstrument({
        _id: instrumentId,
        name: 'Analyzer New',
        categories: ['Hematology'],
        lastModifiedBy: modifierId,
        lastModifiedByName: 'Bob Modifier'
      })
      const modifier = { _id: modifierId, fullName: 'Bob Modifier', roleId: new ObjectId() }

      mockInstrumentsCollection.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(updated)
      mockInstrumentsCollection.updateOne.mockResolvedValue({ acknowledged: true })
      ;(mockUsersCollection.findOne as jest.Mock).mockImplementation(async (query: any) => {
        const id = query?._id
        if (id?.toString() === modifierId.toString()) {
          return modifier
        }
        if (id?.toString() === existing.createdBy.toString()) {
          return { _id: existing.createdBy, fullName: 'Creator' }
        }
        return null
      })
      mockRolesCollection.findOne.mockResolvedValue({ code: 'LAB_MANAGER' })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await updateInstrument(
        instrumentId.toString(),
        {
          name: 'Analyzer New',
          categories: ['Hematology', 'Hematology']
        },
        modifierId.toString()
      )

      expect(mockInstrumentsCollection.updateOne).toHaveBeenCalledWith(
        { _id: instrumentId },
        {
          $set: expect.objectContaining({
            name: 'Analyzer New',
            categories: ['Hematology'],
            lastModifiedBy: modifierId,
            updatedAt: expect.any(Date)
          })
        }
      )
      expect(result.name).toBe('Analyzer New')
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_INSTRUMENT',
          details: `Updated instrument: ${updated.name}`
        })
      )
    })

    it('throws when instrument id is invalid', async () => {
      await expect(
        updateInstrument('invalid', { name: 'Test' }, new ObjectId().toString())
      ).rejects.toThrow(HttpError)
    })

    it('throws when instrument not found', async () => {
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(null)

      await expect(
        updateInstrument(new ObjectId().toString(), { name: 'Test' }, new ObjectId().toString())
      ).rejects.toThrow(HttpError)
    })

    it('throws when new name already exists', async () => {
      const instrumentId = new ObjectId()
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(buildInstrument({ _id: instrumentId, name: 'A' }))
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(buildInstrument())

      await expect(
        updateInstrument(instrumentId.toString(), { name: 'B' }, new ObjectId().toString())
      ).rejects.toThrow(HttpError)
    })
  })

  describe('deleteInstrument', () => {
    it('deletes instrument without active assignments and logs event', async () => {
      const instrumentId = new ObjectId()
      const deletedBy = new ObjectId()
      const instrument = buildInstrument({ _id: instrumentId })
      const actor = { _id: deletedBy, fullName: 'Alice', roleId: new ObjectId() }

      mockInstrumentsCollection.findOne.mockResolvedValueOnce(instrument)
      mockInstrumentReagentAssignmentCollection.findOne.mockResolvedValue(null)
      mockInstrumentsCollection.findOneAndDelete.mockResolvedValue({ value: instrument })
      mockUsersCollection.findOne.mockResolvedValue(actor)
      mockRolesCollection.findOne.mockResolvedValue({ code: 'ADMIN' })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await deleteInstrument(instrumentId.toString(), deletedBy.toString())

      expect(result).toEqual(instrument)
      expect(mockInstrumentReagentAssignmentCollection.findOne).toHaveBeenCalledWith({
        instrumentId,
        isActive: true
      })
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE_INSTRUMENT',
          details: `Deleted instrument: ${instrument.name}`
        })
      )
    })

    it('throws when instrument id is invalid', async () => {
      await expect(deleteInstrument('invalid', new ObjectId().toString())).rejects.toThrow(HttpError)
    })

    it('throws when instrument not found', async () => {
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(null)

      await expect(deleteInstrument(new ObjectId().toString(), new ObjectId().toString())).rejects.toThrow(HttpError)
    })

    it('throws when instrument has active assignments', async () => {
      const instrumentId = new ObjectId()
      mockInstrumentsCollection.findOne.mockResolvedValueOnce(buildInstrument({ _id: instrumentId }))
      mockInstrumentReagentAssignmentCollection.findOne.mockResolvedValue({ instrumentId })

      await expect(deleteInstrument(instrumentId.toString(), new ObjectId().toString())).rejects.toThrow(HttpError)
    })
  })
})


