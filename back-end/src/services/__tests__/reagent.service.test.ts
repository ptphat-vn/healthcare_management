import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import {
  createReagent,
  listReagents,
  getReagentById,
  updateReagent,
  deleteReagent,
  ensureDefaultReagents
} from '../reagent.service'
import { getReagentsCollection, REAGENT_CATEGORIES } from '~/models/reagent.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'
import { generateUniqueCasNumber } from '~/utils/cas-lookup.util'

jest.mock('~/models/reagent.model', () => ({
  getReagentsCollection: jest.fn(),
  REAGENT_CATEGORIES: ['Hematology', 'Biochemistry', 'Immunology']
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

jest.mock('~/utils/cas-lookup.util', () => ({
  generateUniqueCasNumber: jest.fn()
}))

type FindOneFn = (query?: Record<string, unknown>) => Promise<any>
type InsertOneFn = (doc: Record<string, unknown>) => Promise<{ insertedId: ObjectId }>
type UpdateOneFn = (filter: Record<string, unknown>, update: Record<string, unknown>) => Promise<any>
type FindOneAndDeleteFn = (filter: Record<string, unknown>) => Promise<{ value: any } | null>
type CountFn = (filter?: Record<string, unknown>) => Promise<number>

type CursorMock<T = any> = {
  sort: jest.MockedFunction<(sort: Record<string, number>) => CursorMock<T>>
  skip: jest.MockedFunction<(skip: number) => CursorMock<T>>
  limit: jest.MockedFunction<(limit: number) => CursorMock<T>>
  toArray: jest.MockedFunction<() => Promise<T[]>>
}

const reagentCursorMock: CursorMock = {
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  toArray: jest.fn()
}
reagentCursorMock.sort.mockReturnValue(reagentCursorMock)
reagentCursorMock.skip.mockReturnValue(reagentCursorMock)
reagentCursorMock.limit.mockReturnValue(reagentCursorMock)

const userCursorMock: CursorMock = {
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  toArray: jest.fn()
}
userCursorMock.sort.mockReturnValue(userCursorMock)
userCursorMock.skip.mockReturnValue(userCursorMock)
userCursorMock.limit.mockReturnValue(userCursorMock)

const reagentsCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as unknown as jest.MockedFunction<InsertOneFn>,
  updateOne: jest.fn() as unknown as jest.MockedFunction<UpdateOneFn>,
  findOneAndDelete: jest.fn() as unknown as jest.MockedFunction<FindOneAndDeleteFn>,
  find: jest.fn().mockReturnValue(reagentCursorMock) as jest.MockedFunction<(filter?: Record<string, unknown>) => CursorMock>,
  countDocuments: jest.fn() as jest.MockedFunction<CountFn>
}

const usersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  find: jest.fn().mockReturnValue(userCursorMock) as jest.MockedFunction<() => CursorMock>
}

const eventLogsCollectionMock = {
  insertOne: jest.fn()
}

const rolesCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const getReagentsCollectionMock = jest.mocked(getReagentsCollection)
const getUsersCollectionMock = jest.mocked(getUsersCollection)
const getEventLogsCollectionMock = jest.mocked(getEventLogsCollection)
const getRolesCollectionMock = jest.mocked(getRolesCollection)
const generateUniqueCasNumberMock = jest.mocked(generateUniqueCasNumber)

const resetMocks = () => {
  reagentsCollectionMock.findOne.mockReset()
  reagentsCollectionMock.insertOne.mockReset()
  reagentsCollectionMock.updateOne.mockReset()
  reagentsCollectionMock.findOneAndDelete.mockReset()
  reagentsCollectionMock.countDocuments.mockReset()
  reagentsCollectionMock.find.mockReturnValue(reagentCursorMock)
  reagentCursorMock.sort.mockClear()
  reagentCursorMock.skip.mockClear()
  reagentCursorMock.limit.mockClear()
  reagentCursorMock.toArray.mockReset()

  usersCollectionMock.findOne.mockReset()
  usersCollectionMock.find.mockReturnValue(userCursorMock)
  userCursorMock.toArray.mockReset()

  eventLogsCollectionMock.insertOne.mockReset()
  rolesCollectionMock.findOne.mockReset()
  generateUniqueCasNumberMock.mockReset()
}

beforeEach(() => {
  getReagentsCollectionMock.mockReturnValue(reagentsCollectionMock as any)
  getUsersCollectionMock.mockReturnValue(usersCollectionMock as any)
  getEventLogsCollectionMock.mockReturnValue(eventLogsCollectionMock as any)
  getRolesCollectionMock.mockReturnValue(rolesCollectionMock as any)
  resetMocks()
})

describe('createReagent', () => {
  const payload = {
    name: 'Diluent',
    description: 'desc',
    usagePerRun: { min: 1, max: 2, unit: 'ml' as const }
  }

  it('throws when createdBy invalid', async () => {
    await expect(createReagent(payload as any, 'not-an-id')).rejects.toEqual(
      expect.objectContaining({ status: 400, message: 'Invalid user ID' })
    )
  })

  it('throws when name exists', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(createReagent(payload as any, new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Reagent with this name already exists' })
    )
  })

  it('generates unique CAS number when missing', async () => {
    const creatorId = new ObjectId()
    const createdDoc = {
      _id: new ObjectId(),
      ...payload,
      casNumber: '111-11-1',
      createdBy: creatorId
    }
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdDoc)
    generateUniqueCasNumberMock.mockResolvedValueOnce('111-11-1')
    reagentsCollectionMock.insertOne.mockResolvedValueOnce({ insertedId: createdDoc._id })
    usersCollectionMock.findOne
      .mockResolvedValueOnce({ _id: creatorId, fullName: 'Creator', roleId: new ObjectId() })
      .mockResolvedValueOnce({ _id: creatorId, fullName: 'Creator' })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await createReagent(payload as any, creatorId.toHexString())

    expect(generateUniqueCasNumberMock).toHaveBeenCalled()
    expect(reagentsCollectionMock.insertOne).toHaveBeenCalledWith(expect.objectContaining({ casNumber: '111-11-1' }))
    expect(result).toMatchObject({ name: payload.name, casNumber: '111-11-1', createdByName: 'Creator' })
  })

  it('throws when provided CAS already exists', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: new ObjectId() })

    await expect(
      createReagent({ ...payload, casNumber: '123-45-6' } as any, new ObjectId().toHexString())
    ).rejects.toEqual(expect.objectContaining({ status: 409, message: 'Reagent with this CAS Number already exists' }))
  })
})

describe('listReagents', () => {
  it('returns paginated list with search and user names', async () => {
    const creatorId = new ObjectId()
    const modifierId = new ObjectId()
    const reagents = [
      {
        _id: new ObjectId(),
        name: 'Diluent',
        description: 'desc',
        usagePerRun: { min: 1, max: 2, unit: 'ml' },
        createdBy: creatorId,
        lastModifiedBy: modifierId
      }
    ]
    reagentCursorMock.toArray.mockResolvedValueOnce(reagents as any)
    reagentsCollectionMock.countDocuments.mockResolvedValueOnce(10)
    userCursorMock.toArray.mockResolvedValueOnce([
      { _id: creatorId, fullName: 'Creator' },
      { _id: modifierId, email: 'mod@example.com' }
    ])

    const result = await listReagents({ search: 'dil', sortBy: 'name', sortOrder: 1, page: 2, limit: 1, isActive: true })

    expect(reagentsCollectionMock.find).toHaveBeenCalledWith(expect.objectContaining({ $or: expect.any(Array), isActive: true }))
    expect(reagentCursorMock.sort).toHaveBeenCalledWith({ name: 1 })
    expect(reagentCursorMock.skip).toHaveBeenCalledWith(1)
    expect(result.reagents[0]).toMatchObject({ createdByName: 'Creator', lastModifiedByName: 'mod@example.com' })
    expect(result.pagination).toEqual({ page: 2, limit: 1, total: 10, totalPages: 10 })
  })
})

describe('getReagentById', () => {
  it('throws when id invalid', async () => {
    await expect(getReagentById('bad')).rejects.toEqual(expect.objectContaining({ status: 422, message: 'Invalid reagent id' }))
  })

  it('throws when not found', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null)
    await expect(getReagentById(new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Reagent not found' })
    )
  })

  it('returns reagent with user names', async () => {
    const creatorId = new ObjectId()
    const reagent = { _id: new ObjectId(), name: 'Diluent', createdBy: creatorId, usagePerRun: { min: 1, max: 2, unit: 'ml' } }
    reagentsCollectionMock.findOne.mockResolvedValueOnce(reagent)
    userCursorMock.toArray.mockResolvedValueOnce([{ _id: creatorId, fullName: 'Creator' }])

    const result = await getReagentById(reagent._id.toHexString())

    expect(result).toMatchObject({ name: 'Diluent', createdByName: 'Creator' })
  })
})

describe('updateReagent', () => {
  const existing = {
    _id: new ObjectId(),
    name: 'Diluent',
    casNumber: '111-11-1',
    usagePerRun: { min: 1, max: 2, unit: 'ml' }
  }

  it('throws when id invalid', async () => {
    await expect(updateReagent('bad', {}, new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid reagent id' })
    )
  })

  it('throws when reagent missing', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null)
    await expect(updateReagent(existing._id.toHexString(), {}, new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Reagent not found' })
    )
  })

  it('throws when name duplicates', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce({ _id: new ObjectId() })
    await expect(updateReagent(existing._id.toHexString(), { name: 'Other' }, new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Reagent with this name already exists' })
    )
  })

  it('updates reagent and logs event', async () => {
    const updater = new ObjectId()
    const updatedDoc = { ...existing, description: 'new', lastModifiedBy: updater }
    reagentsCollectionMock.findOne.mockResolvedValueOnce(existing).mockResolvedValueOnce(updatedDoc)
    reagentsCollectionMock.updateOne.mockResolvedValueOnce(undefined)
    userCursorMock.toArray.mockResolvedValueOnce([{ _id: updater, fullName: 'Updater' }])
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: updater, roleId: new ObjectId(), fullName: 'Updater' })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await updateReagent(existing._id.toHexString(), { description: 'new' }, updater.toHexString())

    expect(reagentsCollectionMock.updateOne).toHaveBeenCalled()
    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UPDATE_REAGENT', details: expect.stringContaining('Diluent') })
    )
    expect(result).toMatchObject({ description: 'new', lastModifiedByName: 'Updater' })
  })
})

describe('deleteReagent', () => {
  it('throws when id invalid', async () => {
    await expect(deleteReagent('bad', new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid reagent id' })
    )
  })

  it('throws when reagent not found', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce(null)
    await expect(deleteReagent(new ObjectId().toHexString(), new ObjectId().toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Reagent not found' })
    )
  })

  it('deletes reagent and logs event', async () => {
    const id = new ObjectId()
    const deleter = new ObjectId()
    const reagent = { _id: id, name: 'Diluent', createdBy: deleter }
    reagentsCollectionMock.findOne.mockResolvedValueOnce(reagent)
    reagentsCollectionMock.findOneAndDelete.mockResolvedValueOnce({ value: reagent })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: deleter, fullName: 'Deleter' }).mockResolvedValueOnce({ _id: deleter })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await deleteReagent(id.toHexString(), deleter.toHexString())

    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE_REAGENT', details: 'Deleted reagent: Diluent' })
    )
    expect(result).toMatchObject({ name: 'Diluent' })
  })
})

describe('ensureDefaultReagents', () => {
  it('inserts missing defaults only', async () => {
    reagentsCollectionMock.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce(null).mockResolvedValue(null as any)
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId() })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId() })

    await ensureDefaultReagents()

    expect(reagentsCollectionMock.insertOne).toHaveBeenCalled()
  })
})

