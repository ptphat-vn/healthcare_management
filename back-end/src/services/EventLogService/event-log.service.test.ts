import { ObjectId } from 'mongodb'
import { listEventLogs, getEventLogById } from './event-log.service'
import { HttpError } from '~/models/error.model'
import * as eventLogModel from '~/models/event-log.model'

jest.mock('~/models/event-log.model')

describe('EventLog Service', () => {
	let mockEventLogsCollection: any

	beforeEach(() => {
		jest.clearAllMocks()

		mockEventLogsCollection = {
			find: jest.fn(),
			countDocuments: jest.fn(),
			findOne: jest.fn()
		}

		;(eventLogModel.getEventLogsCollection as jest.Mock).mockReturnValue(mockEventLogsCollection)
	})

	describe('listEventLogs', () => {
		it('returns paginated event logs and applies sort/skip/limit', async () => {
			const items = [
				{
					_id: new ObjectId(),
					operator: { id: new ObjectId(), name: 'Alice', role: 'ADMIN' },
					action: 'TEST_ACTION',
					details: 'some details',
					timestamp: new Date()
				}
			]

			const cursor = {
				sort: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				toArray: jest.fn().mockResolvedValue(items)
			}

			mockEventLogsCollection.find.mockReturnValue(cursor)
			mockEventLogsCollection.countDocuments.mockResolvedValue(1)

			const result = await listEventLogs({ page: 2, limit: 5, sortBy: 'action', sortOrder: 1 })

			expect(cursor.sort).toHaveBeenCalledWith({ action: 1 })
			expect(cursor.skip).toHaveBeenCalledWith(5)
			expect(result.eventLogs).toEqual(items)
			expect(result.pagination).toEqual(
				expect.objectContaining({
					page: 2,
					limit: 5,
					total: 1,
					totalPages: 1
				})
			)
		})

		it('builds filter when search, action, operatorName and operatorRole provided', async () => {
			const cursor = {
				sort: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				toArray: jest.fn().mockResolvedValue([])
			}

			mockEventLogsCollection.find.mockReturnValue(cursor)
			mockEventLogsCollection.countDocuments.mockResolvedValue(0)

			await listEventLogs({
				search: 'keyword',
				action: 'USER_UPDATED',
				operatorName: 'Alice',
				operatorRole: 'ADMIN'
			})

			expect(mockEventLogsCollection.find).toHaveBeenCalledWith(
				expect.objectContaining({
					action: 'USER_UPDATED',
					'operator.role': 'ADMIN',
					$or: expect.any(Array),
					'operator.name': expect.objectContaining({ $regex: 'Alice' })
				})
			)
		})
	})

	describe('getEventLogById', () => {
		it('returns event log when id is valid', async () => {
			const doc = {
				_id: new ObjectId(),
				operator: { id: new ObjectId(), name: 'Bob', role: 'LAB' },
				action: 'SAMPLE',
				details: 'ok',
				timestamp: new Date()
			}

			mockEventLogsCollection.findOne.mockResolvedValue(doc)

			const result = await getEventLogById(doc._id!.toString())
			expect(result).toEqual(doc)
		})

		it('throws HttpError for invalid id format', async () => {
			await expect(getEventLogById('invalid-id')).rejects.toThrow(HttpError)
		})

		it('throws HttpError when not found', async () => {
			mockEventLogsCollection.findOne.mockResolvedValue(null)
			await expect(getEventLogById(new ObjectId().toString())).rejects.toThrow(HttpError)
		})
	})
})
