import { ObjectId } from 'mongodb'
import {
  createTestOrder,
  updateTestOrder,
  deleteTestOrder,
  getTestOrderDetail,
  listTestOrders,
  addTestResults,
  recordReagentUsageFromTestResults,
  addComment,
  reviewTestOrderResults,
  aiReviewTestOrderResults,
  updateComment,
  deleteComment
} from '~/services/testorder/test-order.service'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as testOrderModel from '~/models/test-order.model'
import * as patientMedicalRecordModel from '~/models/patient-medical-record.model'
import * as userModel from '~/models/user.model'
import * as eventLogModel from '~/models/event-log.model'
import * as roleModel from '~/models/role.model'
import * as reagentUsageHistoryService from '~/services/reagentusagehistory/reagent-usage-history.service'
import * as aiService from '~/services/ai/ai.service'
import * as flaggingConfigService from '~/services/configresult/flagging-config.service'

// Mock các dependencies
jest.mock('~/models/test-order.model')
jest.mock('~/models/patient-medical-record.model')
jest.mock('~/models/user.model')
jest.mock('~/models/event-log.model')
jest.mock('~/models/role.model')
jest.mock('~/services/reagentusagehistory/reagent-usage-history.service')
jest.mock('~/services/ai/ai.service')
jest.mock('~/services/configresult/flagging-config.service')

describe('Test Order Service', () => {
  let mockTestOrdersCollection: any
  let mockMedicalRecordsCollection: any
  let mockUsersCollection: any
  let mockEventLogsCollection: any
  let mockRolesCollection: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockTestOrdersCollection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      updateOne: jest.fn()
    }

    mockMedicalRecordsCollection = {
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn()
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

    ;(testOrderModel.getTestOrdersCollection as jest.Mock) = jest.fn(() => mockTestOrdersCollection)
    ;(patientMedicalRecordModel.getPatientMedicalRecordsCollection as jest.Mock) = jest.fn(() => mockMedicalRecordsCollection)
    ;(userModel.getUsersCollection as jest.Mock) = jest.fn(() => mockUsersCollection)
    ;(eventLogModel.getEventLogsCollection as jest.Mock) = jest.fn(() => mockEventLogsCollection)
    ;(roleModel.getRolesCollection as jest.Mock) = jest.fn(() => mockRolesCollection)
  })

  describe('createTestOrder', () => {
    const validUserId = new ObjectId().toString()
    const validMedicalRecordId = new ObjectId().toString()
    const mockCreator = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      email: 'test@example.com',
      roleId: new ObjectId()
    }
    const mockMedicalRecord = {
      _id: new ObjectId(validMedicalRecordId),
      fullName: 'Patient Name',
      dateOfBirth: '01/01/1990',
      gender: 'male' as const,
      address: '123 Main St',
      phoneNumber: '123456789',
      email: 'patient@example.com',
      isDeleted: false
    }
    const mockRole = {
      _id: mockCreator.roleId,
      code: 'ADMIN'
    }

    it('should create test order successfully', async () => {
      const data = {
        medicalRecordId: validMedicalRecordId,
        requestedTests: ['White Blood Cell Count', 'Red Blood Cell Count'] as any
      }
      const insertedId = new ObjectId()
      const mockTestOrder = {
        _id: insertedId,
        ...data,
        patientName: mockMedicalRecord.fullName,
        status: 'pending',
        createdBy: new ObjectId(validUserId)
      }

      mockUsersCollection.findOne.mockResolvedValue(mockCreator)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(mockMedicalRecord)
      mockTestOrdersCollection.insertOne.mockResolvedValue({ insertedId })
      mockMedicalRecordsCollection.updateOne.mockResolvedValue({ modifiedCount: 1 })
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await createTestOrder(data, validUserId)

      expect(mockTestOrdersCollection.insertOne).toHaveBeenCalled()
      expect(mockMedicalRecordsCollection.updateOne).toHaveBeenCalled()
      expect(result._id).toEqual(insertedId)
      expect(result.status).toBe('pending')
    })

    it('should throw error if creator not found', async () => {
      const data = {
        medicalRecordId: validMedicalRecordId,
        requestedTests: ['White Blood Cell Count'] as any
      }

      mockUsersCollection.findOne.mockResolvedValue(null)

      await expect(createTestOrder(data, validUserId)).rejects.toThrow(HttpError)
      await expect(createTestOrder(data, validUserId)).rejects.toThrow('User not found')
    })

    it('should throw error for invalid medical record id', async () => {
      const data = {
        medicalRecordId: 'invalid-id',
        requestedTests: ['White Blood Cell Count'] as any
      }

      mockUsersCollection.findOne.mockResolvedValue(mockCreator)

      await expect(createTestOrder(data, validUserId)).rejects.toThrow(HttpError)
      await expect(createTestOrder(data, validUserId)).rejects.toThrow('Invalid medical record id')
    })

    it('should throw error if medical record not found', async () => {
      const data = {
        medicalRecordId: validMedicalRecordId,
        requestedTests: ['White Blood Cell Count'] as any
      }

      mockUsersCollection.findOne.mockResolvedValue(mockCreator)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(null)

      await expect(createTestOrder(data, validUserId)).rejects.toThrow(HttpError)
      await expect(createTestOrder(data, validUserId)).rejects.toThrow('Medical record not found')
    })

    it('should throw error if no requested tests provided', async () => {
      const data = {
        medicalRecordId: validMedicalRecordId,
        requestedTests: [] as any
      }

      mockUsersCollection.findOne.mockResolvedValue(mockCreator)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(mockMedicalRecord)

      await expect(createTestOrder(data, validUserId)).rejects.toThrow(HttpError)
      await expect(createTestOrder(data, validUserId)).rejects.toThrow('At least one requested test must be selected')
    })

    it('should remove duplicate tests from requestedTests', async () => {
      const data = {
        medicalRecordId: validMedicalRecordId,
        requestedTests: ['White Blood Cell Count', 'White Blood Cell Count', 'Red Blood Cell Count'] as any
      }
      const insertedId = new ObjectId()

      mockUsersCollection.findOne.mockResolvedValue(mockCreator)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(mockMedicalRecord)
      mockTestOrdersCollection.insertOne.mockResolvedValue({ insertedId })
      mockMedicalRecordsCollection.updateOne.mockResolvedValue({ modifiedCount: 1 })
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      await createTestOrder(data, validUserId)

      expect(mockTestOrdersCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedTests: ['White Blood Cell Count', 'Red Blood Cell Count']
        })
      )
    })
  })

  describe('updateTestOrder', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should update test order successfully', async () => {
      const data = { patientName: 'Updated Name' }
      const updatedOrder = { ...mockTestOrder, ...data }

      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await updateTestOrder(validTestOrderId, data, validUserId)

      expect(mockTestOrdersCollection.findOneAndUpdate).toHaveBeenCalled()
      expect(result.patientName).toBe('Updated Name')
    })

    it('should throw error for invalid test order id', async () => {
      const data = { patientName: 'Updated Name' }

      await expect(updateTestOrder('invalid-id', data, validUserId)).rejects.toThrow(HttpError)
      await expect(updateTestOrder('invalid-id', data, validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      const data = { patientName: 'Updated Name' }

      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(updateTestOrder(validTestOrderId, data, validUserId)).rejects.toThrow(HttpError)
      await expect(updateTestOrder(validTestOrderId, data, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })
  })

  describe('deleteTestOrder', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      status: 'pending'
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should delete test order successfully', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.deleteOne.mockResolvedValue({ deletedCount: 1 })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await deleteTestOrder(validTestOrderId, validUserId)

      expect(mockTestOrdersCollection.deleteOne).toHaveBeenCalled()
      expect(result.message).toBe('Test order deleted successfully')
    })

    it('should throw error for invalid test order id', async () => {
      await expect(deleteTestOrder('invalid-id', validUserId)).rejects.toThrow(HttpError)
      await expect(deleteTestOrder('invalid-id', validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(deleteTestOrder(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(deleteTestOrder(validTestOrderId, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })
  })

  describe('getTestOrderDetail', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      medicalRecordId: new ObjectId(),
      patientName: 'Patient Name',
      createdBy: new ObjectId(),
      runBy: new ObjectId(),
      status: 'pending'
    }
    const mockCreator = {
      _id: mockTestOrder.createdBy,
      fullName: 'Creator Name',
      email: 'creator@example.com'
    }
    const mockRunner = {
      _id: mockTestOrder.runBy,
      fullName: 'Runner Name',
      email: 'runner@example.com'
    }

    it('should get test order detail successfully', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockUsersCollection.findOne
        .mockResolvedValueOnce(mockCreator)
        .mockResolvedValueOnce(mockRunner)

      const result = await getTestOrderDetail(validTestOrderId)

      expect(result.patientName).toBe('Patient Name')
      expect(result.createdByUser).toEqual({ fullName: 'Creator Name', email: 'creator@example.com' })
      expect(result.runByUser).toEqual({ fullName: 'Runner Name', email: 'runner@example.com' })
    })

    it('should throw error for invalid test order id', async () => {
      await expect(getTestOrderDetail('invalid-id')).rejects.toThrow(HttpError)
      await expect(getTestOrderDetail('invalid-id')).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(getTestOrderDetail(validTestOrderId)).rejects.toThrow(HttpError)
      await expect(getTestOrderDetail(validTestOrderId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })

    it('should allow patient to view their own test order', async () => {
      const patientId = 'patient123'
      const mockAuthUser = {
        _id: new ObjectId(validUserId),
        patientId: patientId
      }
      const mockMedicalRecord = {
        _id: mockTestOrder.medicalRecordId,
        patientId: patientId,
        isDeleted: false
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockUsersCollection.findOne
        .mockResolvedValueOnce(mockAuthUser)
        .mockResolvedValueOnce(mockCreator)
        .mockResolvedValueOnce(mockRunner)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(mockMedicalRecord)

      const result = await getTestOrderDetail(validTestOrderId, validUserId, 'patient')

      expect(result.patientName).toBe('Patient Name')
    })

    it('should deny patient access to other patient test order', async () => {
      const patientId = 'patient123'
      const otherPatientId = 'patient456'
      const mockAuthUser = {
        _id: new ObjectId(validUserId),
        patientId: patientId
      }
      const mockMedicalRecord = {
        _id: mockTestOrder.medicalRecordId,
        patientId: otherPatientId,
        isDeleted: false
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockUsersCollection.findOne.mockResolvedValue(mockAuthUser)
      mockMedicalRecordsCollection.findOne.mockResolvedValue(mockMedicalRecord)

      await expect(getTestOrderDetail(validTestOrderId, validUserId, 'patient')).rejects.toThrow(HttpError)
      await expect(getTestOrderDetail(validTestOrderId, validUserId, 'patient')).rejects.toThrow('Access denied')
    })

    it('should throw error if patient user has no patientId', async () => {
      const mockAuthUser = {
        _id: new ObjectId(validUserId),
        patientId: null
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockUsersCollection.findOne.mockResolvedValue(mockAuthUser)

      await expect(getTestOrderDetail(validTestOrderId, validUserId, 'patient')).rejects.toThrow(HttpError)
      await expect(getTestOrderDetail(validTestOrderId, validUserId, 'patient')).rejects.toThrow('User does not have a patientId')
    })
  })

  describe('listTestOrders', () => {
    const mockTestOrders = [
      {
        _id: new ObjectId(),
        patientName: 'Patient 1',
        status: 'pending',
        createdBy: new ObjectId(),
        runBy: null,
        createdDate: new Date()
      },
      {
        _id: new ObjectId(),
        patientName: 'Patient 2',
        status: 'completed',
        createdBy: new ObjectId(),
        runBy: new ObjectId(),
        createdDate: new Date()
      }
    ]

    it('should list test orders with default pagination', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockTestOrders)
      }

      const mockUserCursor = {
        toArray: jest.fn().mockResolvedValue([
          { _id: mockTestOrders[0].createdBy, fullName: 'Creator 1', email: 'creator1@example.com' },
          { _id: mockTestOrders[1].createdBy, fullName: 'Creator 2', email: 'creator2@example.com' },
          { _id: mockTestOrders[1].runBy, fullName: 'Runner 1', email: 'runner1@example.com' }
        ])
      }

      mockTestOrdersCollection.find.mockReturnValue(mockCursor)
      mockTestOrdersCollection.countDocuments.mockResolvedValue(2)
      mockUsersCollection.find.mockReturnValue(mockUserCursor)

      const result = await listTestOrders({})

      expect(result.testOrders).toHaveLength(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.total).toBe(2)
    })

    it('should filter test orders by search query', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([mockTestOrders[0]])
      }

      const mockUserCursor = {
        toArray: jest.fn().mockResolvedValue([])
      }

      mockTestOrdersCollection.find.mockReturnValue(mockCursor)
      mockTestOrdersCollection.countDocuments.mockResolvedValue(1)
      mockUsersCollection.find.mockReturnValue(mockUserCursor)

      await listTestOrders({ search: 'Patient 1' })

      expect(mockTestOrdersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { patientName: { $regex: 'Patient 1', $options: 'i' } }
          ])
        })
      )
    })

    it('should filter test orders by status', async () => {
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([mockTestOrders[1]])
      }

      const mockUserCursor = {
        toArray: jest.fn().mockResolvedValue([])
      }

      mockTestOrdersCollection.find.mockReturnValue(mockCursor)
      mockTestOrdersCollection.countDocuments.mockResolvedValue(1)
      mockUsersCollection.find.mockReturnValue(mockUserCursor)

      await listTestOrders({ status: 'completed' })

      expect(mockTestOrdersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed'
        })
      )
    })

    it('should filter test orders for patient role', async () => {
      const patientId = 'patient123'
      const validUserId = new ObjectId().toString()
      const mockAuthUser = {
        _id: new ObjectId(validUserId),
        patientId: patientId
      }
      const mockMedicalRecord = {
        _id: new ObjectId(),
        patientId: patientId
      }
      const mockMedicalRecordCursor = {
        toArray: jest.fn().mockResolvedValue([mockMedicalRecord])
      }
      const mockCursor = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([mockTestOrders[0]])
      }
      const mockUserCursor = {
        toArray: jest.fn().mockResolvedValue([])
      }

      mockUsersCollection.findOne.mockResolvedValue(mockAuthUser)
      mockMedicalRecordsCollection.find.mockReturnValue(mockMedicalRecordCursor)
      mockTestOrdersCollection.find.mockReturnValue(mockCursor)
      mockTestOrdersCollection.countDocuments.mockResolvedValue(1)
      mockUsersCollection.find.mockReturnValue(mockUserCursor)

      await listTestOrders({ authUserId: validUserId, authUserRole: 'patient' })

      expect(mockTestOrdersCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          medicalRecordId: { $in: [mockMedicalRecord._id] }
        })
      )
    })

    it('should return empty result if patient has no medical records', async () => {
      const patientId = 'patient123'
      const validUserId = new ObjectId().toString()
      const mockAuthUser = {
        _id: new ObjectId(validUserId),
        patientId: patientId
      }
      const mockMedicalRecordCursor = {
        toArray: jest.fn().mockResolvedValue([])
      }

      mockUsersCollection.findOne.mockResolvedValue(mockAuthUser)
      mockMedicalRecordsCollection.find.mockReturnValue(mockMedicalRecordCursor)

      const result = await listTestOrders({ authUserId: validUserId, authUserRole: 'patient' })

      expect(result.testOrders).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('addTestResults', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      status: 'pending',
      testResults: []
    }
    const mockTestResults = [
      {
        testName: 'White Blood Cell Count',
        result: '7.5',
        unit: '10^3/μL',
        status: 'normal' as const
      }
    ]
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should add test results successfully', async () => {
      const updatedOrder = {
        ...mockTestOrder,
        status: 'completed',
        testResults: mockTestResults.map(r => ({ ...r, createdAt: new Date() })),
        runDate: new Date(),
        runBy: new ObjectId(validUserId)
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})
      ;(reagentUsageHistoryService.recordReagentUsage as jest.Mock) = jest.fn().mockResolvedValue({})

      const result = await addTestResults(validTestOrderId, mockTestResults, validUserId)

      expect(result.status).toBe('completed')
      expect(result.testResults).toBeDefined()
    })

    it('should throw error for invalid test order id', async () => {
      await expect(addTestResults('invalid-id', mockTestResults, validUserId)).rejects.toThrow(HttpError)
      await expect(addTestResults('invalid-id', mockTestResults, validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(addTestResults(validTestOrderId, mockTestResults, validUserId)).rejects.toThrow(HttpError)
      await expect(addTestResults(validTestOrderId, mockTestResults, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })
  })

  describe('recordReagentUsageFromTestResults', () => {
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(),
      runDate: new Date(),
      testResults: [
        {
          _id: new ObjectId(),
          testName: 'Test 1',
          result: '10.5',
          status: 'normal' as const,
          createdAt: new Date(),
          processedData: {
            reagents: [
              {
                reagentId: 'reagent1',
                reagentName: 'Reagent 1',
                quantityUsed: 5,
                unitOfMeasure: 'ml',
                lotNumber: 'LOT001'
              }
            ],
            instrument: { id: 'instrument1' }
          }
        }
      ]
    }

    it('should record reagent usage from test results', async () => {
      ;(reagentUsageHistoryService.recordReagentUsage as jest.Mock) = jest.fn().mockResolvedValue({})

      await recordReagentUsageFromTestResults(mockTestOrder, validUserId)

      expect(reagentUsageHistoryService.recordReagentUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          reagentId: 'reagent1',
          reagentName: 'Reagent 1',
          quantity: 5,
          unit: 'ml',
          testOrderId: String(mockTestOrder._id)
        })
      )
    })

    it('should handle test results without reagents', async () => {
      const testOrderWithoutReagents = {
        _id: new ObjectId(),
        runDate: new Date(),
        testResults: [
          {
            _id: new ObjectId(),
            testName: 'Test 1',
            result: '10.5',
            status: 'normal' as const,
            createdAt: new Date(),
            processedData: {}
          }
        ]
      }

      await recordReagentUsageFromTestResults(testOrderWithoutReagents, validUserId)

      expect(reagentUsageHistoryService.recordReagentUsage).not.toHaveBeenCalled()
    })

    it('should aggregate reagents with same id and lot number', async () => {
      const testOrderWithDuplicates = {
        _id: new ObjectId(),
        runDate: new Date(),
        testResults: [
          {
            _id: new ObjectId(),
            testName: 'Test 1',
            result: '10.5',
            status: 'normal' as const,
            createdAt: new Date(),
            processedData: {
              reagents: [
                {
                  reagentId: 'reagent1',
                  reagentName: 'Reagent 1',
                  quantityUsed: 3,
                  unitOfMeasure: 'ml',
                  lotNumber: 'LOT001'
                },
                {
                  reagentId: 'reagent1',
                  reagentName: 'Reagent 1',
                  quantityUsed: 2,
                  unitOfMeasure: 'ml',
                  lotNumber: 'LOT001'
                }
              ]
            }
          }
        ]
      }

      ;(reagentUsageHistoryService.recordReagentUsage as jest.Mock) = jest.fn().mockResolvedValue({})

      await recordReagentUsageFromTestResults(testOrderWithDuplicates, validUserId)

      expect(reagentUsageHistoryService.recordReagentUsage).toHaveBeenCalledTimes(1)
      expect(reagentUsageHistoryService.recordReagentUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 5 // 3 + 2
        })
      )
    })
  })

  describe('addComment', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      comments: []
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should add comment successfully', async () => {
      const commentContent = 'Test comment'
      const updatedOrder = {
        ...mockTestOrder,
        comments: [
          {
            _id: new ObjectId(),
            content: commentContent,
            createdBy: new ObjectId(validUserId),
            createdAt: new Date()
          }
        ]
      }

      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await addComment(validTestOrderId, commentContent, validUserId)

      expect(result.testOrder.comments).toHaveLength(1)
      expect(result.commentId).toBeDefined()
    })

    it('should throw error for invalid test order id', async () => {
      await expect(addComment('invalid-id', 'Comment', validUserId)).rejects.toThrow(HttpError)
      await expect(addComment('invalid-id', 'Comment', validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue(null)

      await expect(addComment(validTestOrderId, 'Comment', validUserId)).rejects.toThrow(HttpError)
      await expect(addComment(validTestOrderId, 'Comment', validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })
  })

  describe('reviewTestOrderResults', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const testResultId = new ObjectId()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      status: 'completed',
      testResults: [
        {
          _id: testResultId,
          testName: 'Test 1',
          result: '10.5',
          status: 'normal'
        }
      ]
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should review test order results successfully', async () => {
      const updatedOrder = {
        ...mockTestOrder,
        status: 'reviewed',
        testResults: mockTestOrder.testResults
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await reviewTestOrderResults(validTestOrderId, validUserId)

      expect(result.status).toBe('reviewed')
    })

    it('should throw error for invalid test order id', async () => {
      await expect(reviewTestOrderResults('invalid-id', validUserId)).rejects.toThrow(HttpError)
      await expect(reviewTestOrderResults('invalid-id', validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(reviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(reviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })

    it('should throw error if test order not completed', async () => {
      const pendingOrder = { ...mockTestOrder, status: 'pending' }

      mockTestOrdersCollection.findOne.mockResolvedValue(pendingOrder)

      await expect(reviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(reviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow('Test order must be completed before review')
    })

    it('should update specific test results when resultUpdates provided', async () => {
      const updatedOrder = {
        ...mockTestOrder,
        status: 'reviewed',
        testResults: [
          {
            ...mockTestOrder.testResults[0],
            result: '12.0',
            reviewedBy: new ObjectId(validUserId),
            updatedAt: new Date()
          }
        ]
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const resultUpdates = [
        {
          testResultId: testResultId.toString(),
          newResult: '12.0'
        }
      ]

      const result = await reviewTestOrderResults(validTestOrderId, validUserId, resultUpdates)

      expect(result.testResults[0].result).toBe('12.0')
    })
  })

  describe('aiReviewTestOrderResults', () => {
    const validTestOrderId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      status: 'completed',
      testResults: [
        {
          _id: new ObjectId(),
          testName: 'White Blood Cell Count',
          result: '7.5',
          unit: '10^3/μL',
          status: 'normal'
        }
      ]
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }
    const mockFlaggingConfig = {
      testName: 'White Blood Cell Count',
      normalRange: { min: 4.0, max: 11.0 },
      abnormalRange: { min: 3.0, max: 12.0 },
      criticalRange: { min: 2.0, max: 13.0 },
      unit: '10^3/μL'
    }

    it('should AI review test order results successfully', async () => {
      const aiSummary = 'Normal blood cell count'
      const updatedOrder = {
        ...mockTestOrder,
        status: 'ai_reviewed',
        testResults: mockTestOrder.testResults.map(r => ({
          ...r,
          aiReviewedAt: new Date(),
          updatedAt: new Date()
        }))
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      ;(aiService.generateUnifiedLabAIJson as jest.Mock) = jest.fn().mockResolvedValue(aiSummary)
      ;(flaggingConfigService.getFlaggingConfigByTestName as jest.Mock) = jest.fn().mockResolvedValue(mockFlaggingConfig)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await aiReviewTestOrderResults(validTestOrderId, validUserId)

      expect(result.testOrder.status).toBe('ai_reviewed')
      expect(result.aiDiagnosis).toBe(aiSummary)
    })

    it('should throw error for invalid test order id', async () => {
      await expect(aiReviewTestOrderResults('invalid-id', validUserId)).rejects.toThrow(HttpError)
      await expect(aiReviewTestOrderResults('invalid-id', validUserId)).rejects.toThrow('Invalid test order id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })

    it('should throw error if test order not completed', async () => {
      const pendingOrder = { ...mockTestOrder, status: 'pending' }

      mockTestOrdersCollection.findOne.mockResolvedValue(pendingOrder)

      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow('Test order must be completed before AI review')
    })

    it('should throw error if no test results', async () => {
      const orderWithoutResults = { ...mockTestOrder, testResults: [] }

      mockTestOrdersCollection.findOne.mockResolvedValue(orderWithoutResults)

      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow(HttpError)
      await expect(aiReviewTestOrderResults(validTestOrderId, validUserId)).rejects.toThrow('Insufficient data: no test results to review')
    })
  })

  describe('updateComment', () => {
    const validTestOrderId = new ObjectId().toString()
    const validCommentId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const commentId = new ObjectId(validCommentId)
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      comments: [
        {
          _id: commentId,
          content: 'Old comment',
          createdBy: new ObjectId(),
          createdAt: new Date(),
          isDeleted: false
        }
      ]
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should update comment successfully', async () => {
      const newContent = 'Updated comment'
      const updatedOrder = {
        ...mockTestOrder,
        comments: [
          {
            ...mockTestOrder.comments[0],
            content: newContent,
            modifiedBy: new ObjectId(validUserId),
            updatedAt: new Date()
          }
        ]
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await updateComment(validTestOrderId, validCommentId, newContent, validUserId)

      expect(result.comments[0].content).toBe(newContent)
    })

    it('should throw error for invalid test order or comment id', async () => {
      await expect(updateComment('invalid-id', validCommentId, 'Content', validUserId)).rejects.toThrow(HttpError)
      await expect(updateComment('invalid-id', validCommentId, 'Content', validUserId)).rejects.toThrow('Invalid test order or comment id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow(HttpError)
      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })

    it('should throw error if comment not found', async () => {
      const orderWithoutComment = { ...mockTestOrder, comments: [] }

      mockTestOrdersCollection.findOne.mockResolvedValue(orderWithoutComment)

      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow(HttpError)
      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow('Comment not found')
    })

    it('should throw error if comment is deleted', async () => {
      const orderWithDeletedComment = {
        ...mockTestOrder,
        comments: [
          {
            ...mockTestOrder.comments[0],
            isDeleted: true
          }
        ]
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(orderWithDeletedComment)

      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow(HttpError)
      await expect(updateComment(validTestOrderId, validCommentId, 'Content', validUserId)).rejects.toThrow('Cannot update deleted comment')
    })
  })

  describe('deleteComment', () => {
    const validTestOrderId = new ObjectId().toString()
    const validCommentId = new ObjectId().toString()
    const validUserId = new ObjectId().toString()
    const commentId = new ObjectId(validCommentId)
    const mockTestOrder = {
      _id: new ObjectId(validTestOrderId),
      patientName: 'Patient Name',
      comments: [
        {
          _id: commentId,
          content: 'Comment to delete',
          createdBy: new ObjectId(),
          createdAt: new Date(),
          isDeleted: false
        }
      ]
    }
    const mockUser = {
      _id: new ObjectId(validUserId),
      fullName: 'Test User',
      roleId: new ObjectId()
    }
    const mockRole = {
      _id: mockUser.roleId,
      code: 'ADMIN'
    }

    it('should delete comment successfully', async () => {
      const updatedOrder = {
        ...mockTestOrder,
        comments: [
          {
            ...mockTestOrder.comments[0],
            isDeleted: true,
            modifiedBy: new ObjectId(validUserId),
            updatedAt: new Date()
          }
        ]
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(mockTestOrder)
      mockTestOrdersCollection.findOneAndUpdate.mockResolvedValue({ value: updatedOrder })
      mockUsersCollection.findOne.mockResolvedValue(mockUser)
      mockRolesCollection.findOne.mockResolvedValue(mockRole)
      mockEventLogsCollection.insertOne.mockResolvedValue({})

      const result = await deleteComment(validTestOrderId, validCommentId, validUserId)

      expect(result.comments[0].isDeleted).toBe(true)
    })

    it('should throw error for invalid test order or comment id', async () => {
      await expect(deleteComment('invalid-id', validCommentId, validUserId)).rejects.toThrow(HttpError)
      await expect(deleteComment('invalid-id', validCommentId, validUserId)).rejects.toThrow('Invalid test order or comment id')
    })

    it('should throw error if test order not found', async () => {
      mockTestOrdersCollection.findOne.mockResolvedValue(null)

      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow(HttpError)
      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow(MESSAGES.TEST_ORDER_NOT_FOUND)
    })

    it('should throw error if comment not found', async () => {
      const orderWithoutComment = { ...mockTestOrder, comments: [] }

      mockTestOrdersCollection.findOne.mockResolvedValue(orderWithoutComment)

      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow(HttpError)
      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow('Comment not found')
    })

    it('should throw error if comment already deleted', async () => {
      const orderWithDeletedComment = {
        ...mockTestOrder,
        comments: [
          {
            ...mockTestOrder.comments[0],
            isDeleted: true
          }
        ]
      }

      mockTestOrdersCollection.findOne.mockResolvedValue(orderWithDeletedComment)

      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow(HttpError)
      await expect(deleteComment(validTestOrderId, validCommentId, validUserId)).rejects.toThrow('Comment already deleted')
    })
  })
})

