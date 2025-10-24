import { ObjectId } from 'mongodb'
import { getEventLogsCollection } from '~/models/event-log.model'
import { HttpError } from '~/models/error.model'

export interface ListEventLogsParams {
  search?: string
  action?: string
  operatorName?: string
  operatorRole?: string
  sortBy?: 'timestamp' | 'action'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export const listEventLogs = async (params: ListEventLogsParams) => {
  const col = getEventLogsCollection()
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 20
  const skip = (page - 1) * limit

  const filter: Record<string, any> = {}
  if (params.search) {
    const q = params.search
    filter.$or = [
      { action: { $regex: q, $options: 'i' } },
      { details: { $regex: q, $options: 'i' } },
      { 'operator.name': { $regex: q, $options: 'i' } },
    ]
  }
  if (params.action) filter.action = params.action
  if (params.operatorName) filter['operator.name'] = { $regex: params.operatorName, $options: 'i' }
  if (params.operatorRole) filter['operator.role'] = params.operatorRole

  const sortField = (params.sortBy as string) || 'timestamp'
  const sortOrder = params.sortOrder || -1

  const cursor = col.find(filter as any).sort({ [sortField]: sortOrder } as any).skip(skip).limit(limit)
  const [items, total] = await Promise.all([
    cursor.toArray(),
    col.countDocuments(filter as any),
  ])

  return {
    eventLogs: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export const getEventLogById = async (id: string) => {
  let objectId: ObjectId
  try { objectId = new ObjectId(id) } catch { throw new HttpError(422, 'Invalid event log id') }
  const col = getEventLogsCollection()
  const doc = await col.findOne({ _id: objectId } as any)
  if (!doc) throw new HttpError(404, 'Event log not found')
  return doc
}

export default {
  listEventLogs,
  getEventLogById,
}
