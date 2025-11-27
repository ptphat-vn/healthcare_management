import { ObjectId } from 'mongodb'
import {
  addReagentToInstrument,
  getInstrumentReagents,
  removeReagentFromInstrument
} from './instrument-reagent-assignment.service'
import { HttpError } from '~/models/error.model'
import * as instrumentModel from '~/models/instrument.model'
import * as reagentModel from '~/models/reagent.model'
import * as assignmentModel from '~/models/instrument-reagent-assignment.model'
import * as userModel from '~/models/user.model'
import * as vendorSupplyModel from '~/models/reagent-vendor-supply.model'
import * as eventLogModel from '~/models/event-log.model'
import * as roleModel from '~/models/role.model'
import * as inventoryService from '~/services/reagentinventory/reagent-inventory.service'
import * as usageHistoryService from '~/services/reagentusagehistory/reagent-usage-history.service'

jest.mock('~/models/instrument.model')
jest.mock('~/models/reagent.model')
jest.mock('~/models/instrument-reagent-assignment.model')
jest.mock('~/models/user.model')
jest.mock('~/models/reagent-vendor-supply.model')
jest.mock('~/models/event-log.model')
jest.mock('~/models/role.model')
jest.mock('~/services/reagentinventory/reagent-inventory.service')
jest.mock('~/services/reagentusagehistory/reagent-usage-history.service')

describe('Instrument Reagent Assignment Service', () => {
  let mockInstrumentsCollection: any
  let mockReagentsCollection: any
  let mockAssignmentsCollection: any
  let mockUsersCollection: any
  let mockVendorSupplyCollection: any
  let mockEventLogsCollection: any
  let mockRolesCollection: any

  const buildInstrument = (overrides: Record<string, any> = {}) => ({
    _id: new ObjectId(),
    name: 'Analyzer 1',
    categories: ['Chemistry'],
    isActive: true,
    status: 'Active',
    ...overrides
  })

  const buildReagent = (overrides: Record<string, any> = {}) => ({
    _id: new ObjectId(),
    name: 'Reagent A',
    categories: ['Chemistry'],
    ...overrides
  })

  const buildAssignment = (overrides: Record<string, any> = {}) => ({
    _id: new ObjectId(),
    instrumentId: new ObjectId(),
    reagentId: new ObjectId(),
    reagentName: 'Reagent A',
    lotNumber: 'LOT-1',
    unitOfMeasure: 'mL',
    isActive: true,
    assignedBy: new ObjectId(),
    ...overrides
  })

  const buildInventoryLot = (overrides: Record<string, any> = {}) => ({
    vendorSupplyId: new ObjectId(),
    reagentId: new ObjectId(),
    reagentName: 'Reagent A',
    vendorName: 'Trusted Vendor',
    lotNumber: 'LOT-1',
    expirationDate: new Date('2030-01-01'),
    quantityReceived: 50,
    quantityUsed: 0,
    quantityAvailable: 50,
    unitOfMeasure: 'mL',
    status: 'Received',
    daysUntilExpiration: 365,
    isExpired: false,
    isExpiringSoon: false,
    ...overrides
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockInstrumentsCollection = {
      findOne: jest.fn()
    }
    mockReagentsCollection = {
      findOne: jest.fn()
    }
    mockAssignmentsCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      find: jest.fn()
    }
    mockUsersCollection = {
      findOne: jest.fn(),
      find: jest.fn()
    }
    mockVendorSupplyCollection = {
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
    ;(reagentModel.getReagentsCollection as jest.Mock).mockReturnValue(mockReagentsCollection)
    ;(assignmentModel.getInstrumentReagentAssignmentCollection as jest.Mock).mockReturnValue(mockAssignmentsCollection)
    ;(userModel.getUsersCollection as jest.Mock).mockReturnValue(mockUsersCollection)
    ;(vendorSupplyModel.getReagentVendorSupplyCollection as jest.Mock).mockReturnValue(mockVendorSupplyCollection)
    ;(eventLogModel.getEventLogsCollection as jest.Mock).mockReturnValue(mockEventLogsCollection)
    ;(roleModel.getRolesCollection as jest.Mock).mockReturnValue(mockRolesCollection)
  })

  describe('addReagentToInstrument', () => {
    it('creates an assignment using specific lot (happy case)', async () => {
      const instrument = buildInstrument()
      const reagent = buildReagent()
      const user = { _id: new ObjectId(), fullName: 'Alice Chemist', roleId: new ObjectId() }
      const vendorSupplyId = new ObjectId()
      const inventoryLot = buildInventoryLot({
        lotNumber: 'LOT-123',
        vendorSupplyId,
        reagentId: reagent._id
      })
      const createdAssignment = {
        _id: new ObjectId(),
        instrumentId: instrument._id,
        reagentId: reagent._id,
        lotNumber: 'LOT-123'
      }

      mockInstrumentsCollection.findOne.mockResolvedValue(instrument)
      mockReagentsCollection.findOne.mockResolvedValue(reagent)
      mockUsersCollection.findOne.mockResolvedValue(user)
      ;(inventoryService.getReagentInventoryFIFO as jest.Mock).mockResolvedValue({
        inventory: [inventoryLot],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
      mockVendorSupplyCollection.findOne.mockResolvedValue({ vendorName: 'Trusted Vendor' })
      mockAssignmentsCollection.insertOne.mockResolvedValue({ insertedId: createdAssignment._id })
      mockAssignmentsCollection.findOne.mockResolvedValue(createdAssignment)
      mockRolesCollection.findOne.mockResolvedValue({ code: 'ADMIN' })
      ;(usageHistoryService.recordReagentUsage as jest.Mock).mockResolvedValue(undefined)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await addReagentToInstrument(
        instrument._id.toString(),
        {
          reagentId: reagent._id.toString(),
          quantity: 5,
          lotNumber: 'LOT-123'
        },
        user._id.toString()
      )

      expect(mockAssignmentsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          instrumentId: instrument._id,
          reagentId: reagent._id,
          lotNumber: 'LOT-123',
          vendorSupplyName: 'Trusted Vendor',
          quantity: 5
        })
      )
      expect(usageHistoryService.recordReagentUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          reagentId: reagent._id.toString(),
          instrumentId: instrument._id.toString(),
          batchLotNumber: 'LOT-123',
          quantity: 5
        })
      )
      expect(result).toEqual(createdAssignment)
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ADD_REAGENT_TO_INSTRUMENT'
        })
      )
    })

    it('throws when instrument and reagent categories do not match (bad case)', async () => {
      const instrument = buildInstrument({ categories: ['Chemistry'] })
      const reagent = buildReagent({ categories: ['Hematology'] })
      const user = { _id: new ObjectId(), fullName: 'Alice Chemist' }

      mockInstrumentsCollection.findOne.mockResolvedValue(instrument)
      mockReagentsCollection.findOne.mockResolvedValue(reagent)
      mockUsersCollection.findOne.mockResolvedValue(user)

      await expect(
        addReagentToInstrument(
          instrument._id.toString(),
          {
            reagentId: reagent._id.toString(),
            quantity: 5
          },
          user._id.toString()
        )
      ).rejects.toThrow(HttpError)
      expect(inventoryService.getReagentInventoryFIFO).not.toHaveBeenCalled()
    })
  })

  describe('removeReagentFromInstrument', () => {
    it('deactivates an assignment and logs the event (happy case)', async () => {
      const assignment = buildAssignment({ isActive: true })
      const updatedAssignment = { ...assignment, isActive: false, removedByName: 'Bob' }
      const user = { _id: assignment.assignedBy, fullName: 'Bob Tech', roleId: new ObjectId() }

      mockAssignmentsCollection.findOne
        .mockResolvedValueOnce(assignment)
        .mockResolvedValueOnce(updatedAssignment)
      mockAssignmentsCollection.updateOne.mockResolvedValue({ acknowledged: true })
      mockUsersCollection.findOne.mockResolvedValue(user)
      mockRolesCollection.findOne.mockResolvedValue({ code: 'TECH' })
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await removeReagentFromInstrument(
        assignment._id.toString(),
        user._id.toString()
      )

      expect(mockAssignmentsCollection.updateOne).toHaveBeenCalledWith(
        { _id: assignment._id },
        expect.objectContaining({
          $set: expect.objectContaining({
            isActive: false,
            removedBy: user._id
          })
        })
      )
      expect(result).toEqual(updatedAssignment)
      expect(mockEventLogsCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REMOVE_REAGENT_FROM_INSTRUMENT'
        })
      )
    })

    it('throws when assignment is already inactive (bad case)', async () => {
      const assignment = buildAssignment({ isActive: false })
      mockAssignmentsCollection.findOne.mockResolvedValue(assignment)

      await expect(
        removeReagentFromInstrument(assignment._id.toString(), new ObjectId().toString())
      ).rejects.toThrow(HttpError)
      expect(mockAssignmentsCollection.updateOne).not.toHaveBeenCalled()
    })
  })

  describe('getInstrumentReagents', () => {
    it('returns instrument and enriches assignment metadata (happy case)', async () => {
      const instrument = buildInstrument()
      const assignedBy = new ObjectId()
      const vendorSupplyId = new ObjectId()
      const assignmentsCursor = {
        toArray: jest.fn().mockResolvedValue([
          buildAssignment({
            instrumentId: instrument._id,
            instrumentName: undefined,
            assignedBy,
            assignedByName: undefined,
            vendorSupplyId,
            vendorSupplyName: undefined
          })
        ])
      }
      const usersCursor = {
        toArray: jest.fn().mockResolvedValue([
          { _id: assignedBy, fullName: 'Alice Chemist' }
        ])
      }
      const vendorCursor = {
        toArray: jest.fn().mockResolvedValue([
          { _id: vendorSupplyId, vendorName: 'Trusted Vendor' }
        ])
      }

      mockInstrumentsCollection.findOne.mockResolvedValue(instrument)
      mockAssignmentsCollection.find.mockReturnValue(assignmentsCursor)
      mockUsersCollection.find.mockReturnValue(usersCursor)
      mockVendorSupplyCollection.find.mockReturnValue(vendorCursor)

      const result = await getInstrumentReagents(instrument._id.toString())

      expect(result.instrument).toEqual(instrument)
      expect(result.reagents[0].instrumentName).toBe(instrument.name)
      expect(result.reagents[0].assignedByName).toBe('Alice Chemist')
      expect(result.reagents[0].vendorSupplyName).toBe('Trusted Vendor')
    })

    it('throws when instrument is not found (bad case)', async () => {
      mockInstrumentsCollection.findOne.mockResolvedValue(null)

      await expect(getInstrumentReagents(new ObjectId().toString())).rejects.toThrow(HttpError)
      expect(mockAssignmentsCollection.find).not.toHaveBeenCalled()
    })
  })
})


