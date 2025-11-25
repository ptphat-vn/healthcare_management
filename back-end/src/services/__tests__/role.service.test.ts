import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ObjectId } from 'mongodb'
import { createRole, updateRole, listRoles, ensureDefaultRoles, deleteRole } from '../role.service'
import { getRolesCollection } from '~/models/role.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'

jest.mock('~/models/role.model', () => ({
  getRolesCollection: jest.fn()
}))

jest.mock('~/models/user.model', () => ({
  getUsersCollection: jest.fn()
}))

jest.mock('~/models/event-log.model', () => ({
  getEventLogsCollection: jest.fn()
}))

type FindOneFn = (query?: Record<string, unknown>) => Promise<any>
type InsertOneFn = (doc: Record<string, unknown>) => Promise<{ insertedId: ObjectId }>
type UpdateOneFn = (filter: Record<string, unknown>, update: Record<string, unknown>) => Promise<any>
type FindOneAndDeleteFn = (filter: Record<string, unknown>) => Promise<{ value: any } | null>

type CursorMock = {
  sort: jest.MockedFunction<(sort: Record<string, number>) => CursorMock>
  skip: jest.MockedFunction<(skip: number) => CursorMock>
  limit: jest.MockedFunction<(limit: number) => CursorMock>
  toArray: jest.MockedFunction<() => Promise<any[]>>
}

const cursorMock: CursorMock = {
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  toArray: jest.fn() as jest.MockedFunction<() => Promise<any[]>>
}
cursorMock.sort.mockReturnValue(cursorMock)
cursorMock.skip.mockReturnValue(cursorMock)
cursorMock.limit.mockReturnValue(cursorMock)

const rolesCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>,
  insertOne: jest.fn() as unknown as jest.MockedFunction<InsertOneFn>,
  updateOne: jest.fn() as unknown as jest.MockedFunction<UpdateOneFn>,
  findOneAndDelete: jest.fn() as unknown as jest.MockedFunction<FindOneAndDeleteFn>,
  find: jest.fn().mockReturnValue(cursorMock) as jest.MockedFunction<(filter?: Record<string, unknown>) => CursorMock>,
  countDocuments: jest.fn() as jest.MockedFunction<(filter?: Record<string, unknown>) => Promise<number>>
}

const usersCollectionMock = {
  findOne: jest.fn() as unknown as jest.MockedFunction<FindOneFn>
}

const eventLogsCollectionMock = {
  insertOne: jest.fn() as jest.MockedFunction<(doc: Record<string, unknown>) => Promise<void>>
}

const getRolesCollectionMock = jest.mocked(getRolesCollection)
const getUsersCollectionMock = jest.mocked(getUsersCollection)
const getEventLogsCollectionMock = jest.mocked(getEventLogsCollection)

const resetRoleMocks = () => {
  rolesCollectionMock.findOne.mockReset()
  rolesCollectionMock.insertOne.mockReset()
  rolesCollectionMock.updateOne.mockReset()
  rolesCollectionMock.findOneAndDelete.mockReset()
  rolesCollectionMock.countDocuments.mockReset()
  rolesCollectionMock.find.mockReturnValue(cursorMock)
  cursorMock.sort.mockClear()
  cursorMock.skip.mockClear()
  cursorMock.limit.mockClear()
  cursorMock.toArray.mockReset()
}

const resetUserAndLogMocks = () => {
  usersCollectionMock.findOne.mockReset()
  eventLogsCollectionMock.insertOne.mockReset()
}

beforeEach(() => {
  getRolesCollectionMock.mockReturnValue(rolesCollectionMock as any)
  getUsersCollectionMock.mockReturnValue(usersCollectionMock as any)
  getEventLogsCollectionMock.mockReturnValue(eventLogsCollectionMock as any)
  resetRoleMocks()
  resetUserAndLogMocks()
})

describe('createRole', () => {
  it('throws when role code already exists', async () => {
    rolesCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), code: 'admin' })

    await expect(
      createRole({
        name: 'Admin',
        code: 'admin'
      })
    ).rejects.toEqual(expect.objectContaining({ status: 409, message: 'Role code already exists' }))
  })

  it('creates role with default privileges and logs event', async () => {
    const insertedId = new ObjectId()
    const createdDoc = {
      _id: insertedId,
      name: 'Lab',
      code: 'lab',
      privileges: ['read_only'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    rolesCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdDoc)
    rolesCollectionMock.insertOne.mockResolvedValueOnce({ insertedId })
    eventLogsCollectionMock.insertOne.mockResolvedValueOnce(undefined)

    const result = await createRole({ name: 'Lab', code: 'lab' })

    expect(rolesCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Lab',
        code: 'lab',
        privileges: ['read_only']
      })
    )
    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_ROLE',
        details: 'Created role: Lab'
      })
    )
    expect(result).toEqual(createdDoc)
  })
})

describe('updateRole', () => {
  it('throws when id invalid', async () => {
    await expect(updateRole('not-object-id', {})).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid role id' })
    )
  })

  it('throws when role not found after update', async () => {
    const id = new ObjectId().toHexString()
    rolesCollectionMock.findOne.mockResolvedValueOnce(null)

    await expect(updateRole(id, { name: 'New name' })).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Role not found' })
    )
  })

  it('updates role and logs event', async () => {
    const id = new ObjectId()
    const actorId = new ObjectId()
    const actorRoleId = new ObjectId()
    const updatedDoc = { _id: id, name: 'Manager', code: 'manager', privileges: ['*'] }

    rolesCollectionMock.findOne.mockResolvedValueOnce(updatedDoc).mockResolvedValueOnce({ code: 'admin' })
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: actorId, fullName: 'Alice', roleId: actorRoleId })

    const result = await updateRole(id.toHexString(), { name: 'Manager' }, actorId.toHexString())

    expect(rolesCollectionMock.updateOne).toHaveBeenCalledWith({ _id: id }, expect.objectContaining({ $set: expect.any(Object) }))
    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE_ROLE',
        details: 'Updated role: Manager'
      })
    )
    expect(result).toEqual(updatedDoc)
  })
})

describe('listRoles', () => {
  it('returns paginated roles with filters applied', async () => {
    const roles = [{ _id: new ObjectId(), name: 'Lab', code: 'lab' }]
    cursorMock.toArray.mockResolvedValueOnce(roles)
    rolesCollectionMock.countDocuments.mockResolvedValueOnce(25)

    const result = await listRoles({ search: 'lab', sortBy: 'code', sortOrder: -1, page: 2, limit: 5 })

    expect(rolesCollectionMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array)
      })
    )
    expect(cursorMock.sort).toHaveBeenCalledWith({ code: -1 })
    expect(cursorMock.skip).toHaveBeenCalledWith(5)
    expect(cursorMock.limit).toHaveBeenCalledWith(5)
    expect(result).toEqual({
      roles,
      pagination: {
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5
      }
    })
  })
})

describe('ensureDefaultRoles', () => {
  it('inserts missing defaults only', async () => {
    rolesCollectionMock.findOne
      .mockResolvedValueOnce({}) // admin exists
      .mockResolvedValueOnce(null) // lab_manager missing
      .mockResolvedValueOnce(null) // service missing
      .mockResolvedValueOnce({}) // lab_user exists
      .mockResolvedValueOnce(null) // patient missing

    await ensureDefaultRoles()

    expect(rolesCollectionMock.insertOne).toHaveBeenCalledTimes(3)
    expect(rolesCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'lab_manager' })
    )
    expect(rolesCollectionMock.insertOne).toHaveBeenCalledWith(expect.objectContaining({ code: 'service' }))
    expect(rolesCollectionMock.insertOne).toHaveBeenCalledWith(expect.objectContaining({ code: 'patient' }))
  })
})

describe('deleteRole', () => {
  it('throws when id invalid', async () => {
    await expect(deleteRole('bad-id')).rejects.toEqual(
      expect.objectContaining({ status: 422, message: 'Invalid role id' })
    )
  })

  it('blocks deletion when role assigned to user', async () => {
    const id = new ObjectId()
    usersCollectionMock.findOne.mockResolvedValueOnce({ _id: new ObjectId(), roleId: id })

    await expect(deleteRole(id.toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 409, message: 'Role is assigned to one or more users' })
    )
  })

  it('throws when role not found', async () => {
    const id = new ObjectId()
    usersCollectionMock.findOne.mockResolvedValueOnce(null)
    rolesCollectionMock.findOneAndDelete.mockResolvedValueOnce(null)

    await expect(deleteRole(id.toHexString())).rejects.toEqual(
      expect.objectContaining({ status: 404, message: 'Role not found' })
    )
  })

  it('deletes role and logs event', async () => {
    const id = new ObjectId()
    const deletedRole = { _id: id, name: 'Lab' }
    usersCollectionMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    rolesCollectionMock.findOneAndDelete.mockResolvedValueOnce({ value: deletedRole })
    rolesCollectionMock.findOne.mockResolvedValueOnce({ code: 'admin' })

    const result = await deleteRole(id.toHexString(), new ObjectId().toHexString())

    expect(eventLogsCollectionMock.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE_ROLE',
        details: 'Deleted role: Lab'
      })
    )
    expect(result).toEqual(deletedRole)
  })
})

