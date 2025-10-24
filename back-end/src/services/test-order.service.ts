import { ObjectId } from 'mongodb'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import { getTestOrdersCollection, TestOrderDocument, TestResult, Comment } from '~/models/test-order.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'

export interface CreateTestOrderData {
  patientName: string
  dateOfBirth: string
  age: number
  gender: 'male' | 'female'
  address: string
  phoneNumber: string
  email: string
}

export interface UpdateTestOrderData {
  patientName?: string
  dateOfBirth?: string
  age?: number
  gender?: 'male' | 'female'
  address?: string
  phoneNumber?: string
  email?: string
}

export interface ListTestOrdersParams {
  search?: string
  status?: 'pending' | 'cancelled' | 'completed' | 'reviewed' | 'ai_reviewed'
  sortBy?: 'patientName' | 'createdDate' | 'runDate' | 'status'
  sortOrder?: 1 | -1
  page?: number
  limit?: number
}

export async function createTestOrder(data: CreateTestOrderData, createdBy: string) {
  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()
  const eventLogs = getEventLogsCollection()

  // Verify the creator exists
  const creator = await users.findOne({ _id: new ObjectId(createdBy) })
  if (!creator) {
    throw new HttpError(404, 'User not found')
  }

  const now = new Date()
  const testOrder: Omit<TestOrderDocument, '_id'> = {
    ...data,
    status: 'pending',
    createdDate: now,
    createdBy: new ObjectId(createdBy),
    createdAt: now,
    updatedAt: now
  }

  const result = await testOrders.insertOne(testOrder as TestOrderDocument)
  
  // Log the event
  try {
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actor = creator
    const actorRoleDoc = actor?.roleId ? await actorRoleCol.findOne({ _id: actor.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(createdBy), name: actor?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_CREATED',
      details: `Created test order for patient: ${data.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return { _id: result.insertedId, ...testOrder }
}

export async function updateTestOrder(id: string, data: UpdateTestOrderData, updatedBy: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const now = new Date()
  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { $set: { ...data, updatedAt: now } },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(updatedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(updatedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_UPDATED',
      details: `Updated test order for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated
}

export async function deleteTestOrder(id: string, deletedBy: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  await testOrders.deleteOne({ _id: testOrderObjectId })

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(deletedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(deletedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_DELETED',
      details: `Deleted test order for patient: ${testOrder.patientName}`,
      timestamp: new Date()
    } as any)
  } catch {
    // swallow logging errors
  }

  return { message: 'Test order deleted successfully' }
}

export async function getTestOrderDetail(id: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Get creator and runner information
  const [creator, runner] = await Promise.all([
    testOrder.createdBy ? users.findOne({ _id: testOrder.createdBy }) : null,
    testOrder.runBy ? users.findOne({ _id: testOrder.runBy }) : null
  ])

  return {
    ...testOrder,
    createdByUser: creator ? { fullName: creator.fullName, email: creator.email } : null,
    runByUser: runner ? { fullName: runner.fullName, email: runner.email } : null
  }
}

export const listTestOrders = async (params: ListTestOrdersParams) => {
  const testOrders = getTestOrdersCollection()
  const users = getUsersCollection()
  
  const page = params.page && params.page > 0 ? params.page : 1
  const limit = params.limit && params.limit > 0 ? params.limit : 10
  const skip = (page - 1) * limit
  
  // Build filter query
  const filter: Record<string, any> = {}
  
  // Search by patient name, phone number, or email
  if (params.search) {
    const q = params.search
    filter.$or = [
      { patientName: { $regex: q, $options: 'i' } },
      { phoneNumber: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  }
  
  // Filter by status
  if (params.status) {
    filter.status = params.status
  }
  
  // Sorting
  const sortField = params.sortBy || 'createdDate'
  const sortOrder = params.sortOrder || -1
  
  // Get test orders with pagination
  const cursor = testOrders.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit)
  const [testOrderItems, total] = await Promise.all([
    cursor.toArray(),
    testOrders.countDocuments(filter),
  ])
  
  // Get user information for creators and runners
  const userIds = Array.from(new Set([
    ...testOrderItems.map(to => to.createdBy).filter(Boolean),
    ...testOrderItems.map(to => to.runBy).filter(Boolean)
  ])) as ObjectId[]
  
  const userDocs = userIds.length ? await users.find({ _id: { $in: userIds } }).toArray() : []
  const idToUser = new Map<string, { fullName?: string; email?: string }>()
  for (const u of userDocs as any[]) {
    idToUser.set(String(u._id), { fullName: u.fullName, email: u.email })
  }
  
  // Add user information to test orders
  const enrichedTestOrders = testOrderItems.map((to: any) => {
    const createdByUser = to.createdBy ? idToUser.get(String(to.createdBy)) : null
    const runByUser = to.runBy ? idToUser.get(String(to.runBy)) : null
    
    return {
      ...to,
      createdByUser,
      runByUser
    }
  })
  
  return {
    testOrders: enrichedTestOrders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export async function addTestResults(id: string, testResults: Omit<TestResult, 'createdAt'>[], addedBy: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const now = new Date()
  const resultsWithTimestamp = testResults.map(result => ({
    ...result,
    createdAt: now
  }))

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $set: { 
        testResults: resultsWithTimestamp,
        status: 'completed',
        runDate: now,
        runBy: new ObjectId(addedBy),
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(addedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(addedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_RESULTS_ADDED',
      details: `Added test results for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated
}

export async function addComment(id: string, content: string, addedBy: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const now = new Date()
  const commentId = new ObjectId()
  const comment: Comment = {
    _id: commentId,
    content,
    createdBy: new ObjectId(addedBy),
    createdAt: now
  }

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $push: { comments: comment },
      $set: { updatedAt: now }
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(addedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(addedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_COMMENT_ADDED',
      details: `Added comment to test order for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return { testOrder: updated, commentId }
}

// Review test order results (manual review)
export async function reviewTestOrderResults(id: string, reviewedBy: string, resultUpdates?: { testResultId: string, newResult: string }[]) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  if (testOrder.status !== 'completed') {
    throw new HttpError(400, 'Test order must be completed before review')
  }

  const now = new Date()
  let updatedTestResults = testOrder.testResults || []

  // Update specific test results if provided
  if (resultUpdates && resultUpdates.length > 0) {
    updatedTestResults = updatedTestResults.map((result: any) => {
      const update = resultUpdates.find(u => u.testResultId === String(result._id))
      if (update) {
        return {
          ...result,
          result: update.newResult,
          reviewedBy: new ObjectId(reviewedBy),
          updatedAt: now
        }
      }
      return result
    })
  }

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $set: { 
        status: 'reviewed',
        testResults: updatedTestResults,
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(reviewedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(reviewedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_REVIEWED',
      details: `Manually reviewed test order for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated
}

// AI auto review test order results
export async function aiReviewTestOrderResults(id: string, reviewedBy: string) {
  let testOrderObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(id)
  } catch {
    throw new HttpError(400, 'Invalid test order id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  if (testOrder.status !== 'completed') {
    throw new HttpError(400, 'Test order must be completed before AI review')
  }

  const now = new Date()
  let updatedTestResults = testOrder.testResults || []

  // AI review logic - simulate AI adjustments
  updatedTestResults = updatedTestResults.map((result: any) => {
    // Simulate AI analysis and potential adjustments
    const numericResult = parseFloat(result.result)
    if (!isNaN(numericResult)) {
      // Simulate AI finding minor adjustments needed (small random changes)
      const adjustment = (Math.random() - 0.5) * 0.1 * numericResult // ±5% adjustment
      const adjustedValue = numericResult + adjustment
      
      // Only apply adjustment if it's within reasonable bounds
      if (adjustedValue > 0 && Math.abs(adjustment) > 0.01) {
        return {
          ...result,
          result: adjustedValue.toFixed(2),
          aiReviewedAt: now,
          updatedAt: now
        }
      }
    }
    return {
      ...result,
      aiReviewedAt: now,
      updatedAt: now
    }
  })

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $set: { 
        status: 'ai_reviewed',
        testResults: updatedTestResults,
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(reviewedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(reviewedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'TEST_ORDER_AI_REVIEWED',
      details: `AI reviewed test order for patient: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated
}

// Update comment
export async function updateComment(testOrderId: string, commentId: string, content: string, updatedBy: string) {
  let testOrderObjectId: ObjectId
  let commentObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(testOrderId)
    commentObjectId = new ObjectId(commentId)
  } catch {
    throw new HttpError(400, 'Invalid test order or comment id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  const comment = testOrder.comments?.find((c: any) => String(c._id) === commentId)
  if (!comment) {
    throw new HttpError(404, 'Comment not found')
  }

  if (comment.isDeleted) {
    throw new HttpError(400, 'Cannot update deleted comment')
  }

  const now = new Date()
  const updatedComments = testOrder.comments?.map((c: any) => {
    if (String(c._id) === commentId) {
      return {
        ...c,
        content,
        modifiedBy: new ObjectId(updatedBy),
        updatedAt: now
      }
    }
    return c
  })

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $set: { 
        comments: updatedComments,
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
  try {
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(updatedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(updatedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'COMMENT_UPDATED',
      details: `Updated comment for test order: ${updated.patientName}`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated
}

// Delete comment (soft delete)
export async function deleteComment(testOrderId: string, commentId: string, deletedBy: string) {
  let testOrderObjectId: ObjectId
  let commentObjectId: ObjectId
  try {
    testOrderObjectId = new ObjectId(testOrderId)
    commentObjectId = new ObjectId(commentId)
  } catch {
    throw new HttpError(400, 'Invalid test order or comment id')
  }

  const testOrders = getTestOrdersCollection()
  const eventLogs = getEventLogsCollection()

  const testOrder = await testOrders.findOne({ _id: testOrderObjectId })
  if (!testOrder) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  const comment = testOrder.comments?.find((c: any) => String(c._id) === commentId)
  if (!comment) {
    throw new HttpError(404, 'Comment not found')
  }

  if (comment.isDeleted) {
    throw new HttpError(400, 'Comment already deleted')
  }

  const now = new Date()
  const updatedComments = testOrder.comments?.map((c: any) => {
    if (String(c._id) === commentId) {
      return {
        ...c,
        isDeleted: true,
        modifiedBy: new ObjectId(deletedBy),
        updatedAt: now
      }
    }
    return c
  })

  const result = await testOrders.findOneAndUpdate(
    { _id: testOrderObjectId },
    { 
      $set: { 
        comments: updatedComments,
        updatedAt: now
      } 
    },
    { returnDocument: 'after' }
  )

  const updated: any = (result as any)?.value ?? result
  if (!updated) {
    throw new HttpError(404, MESSAGES.TEST_ORDER_NOT_FOUND)
  }

  // Log the event
    const usersCol = getUsersCollection()
    const actorUser = await usersCol.findOne({ _id: new ObjectId(deletedBy) })
    const actorRoleCol = (await import('~/models/role.model')).getRolesCollection()
    const actorRoleDoc = actorUser?.roleId ? await actorRoleCol.findOne({ _id: actorUser.roleId } as any) : null
    await eventLogs.insertOne({
      operator: { id: new ObjectId(deletedBy), name: actorUser?.fullName || '', role: actorRoleDoc?.code || '' },
      action: 'COMMENT_DELETED',
      details: `Deleted comment for test order: ${updated.patientName}`,
      timestamp: now
    } as any)
  

  return updated
}
