import { ObjectId, WithId } from 'mongodb'
import { getInstrumentsCollection } from '~/models/instrument.model'
import { getInstrumentReagentAssignmentCollection, type InstrumentReagentAssignmentDocument } from '~/models/instrument-reagent-assignment.model'
import { getReagentsCollection } from '~/models/reagent.model'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getRolesCollection } from '~/models/role.model'
import { getReagentVendorSupplyCollection } from '~/models/reagent-vendor-supply.model'
import { getReagentInventoryFIFO } from '~/services/reagentinventory/reagent-inventory.service'
import { recordReagentUsage } from '~/services/reagentusagehistory/reagent-usage-history.service'

export interface AddReagentToInstrumentPayload {
  reagentId: string
  quantity: number
  lotNumber?: string
  notes?: string
}

export const addReagentToInstrument = async (
  instrumentId: string,
  payload: AddReagentToInstrumentPayload,
  assignedBy: string
): Promise<WithId<InstrumentReagentAssignmentDocument>> => {
  let instrumentObjectId: ObjectId
  try {
    instrumentObjectId = new ObjectId(instrumentId)
  } catch {
    throw new HttpError(422, 'Invalid instrument id')
  }

  // Verify instrument exists and is active
  const instruments = getInstrumentsCollection()
  const instrument = await instruments.findOne({ _id: instrumentObjectId } as any)
  if (!instrument) {
    throw new HttpError(404, 'Instrument not found')
  }
  if (!instrument.isActive || instrument.status !== 'Active') {
    throw new HttpError(409, 'Instrument is not active')
  }

  let reagentObjectId: ObjectId
  try {
    reagentObjectId = new ObjectId(payload.reagentId)
  } catch {
    throw new HttpError(422, 'Invalid reagent id')
  }

  let assignedByObjectId: ObjectId
  try {
    assignedByObjectId = new ObjectId(assignedBy)
  } catch {
    throw new HttpError(422, 'Invalid assignedBy user id')
  }

  const users = getUsersCollection()
  const user = await users.findOne({ _id: assignedByObjectId } as any)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }
  const assignedByName = user.fullName || user.email || assignedByObjectId.toString()
  const instrumentName = instrument.name
  const vendorSuppliesCollection = getReagentVendorSupplyCollection()
  const vendorSupplyNameCache = new Map<string, string>()
  const resolveVendorSupplyName = async (vendorSupplyId?: ObjectId | null) => {
    if (!vendorSupplyId) return undefined
    const cacheKey = vendorSupplyId.toString()
    if (vendorSupplyNameCache.has(cacheKey)) {
      return vendorSupplyNameCache.get(cacheKey)
    }
    const vendorSupply = await vendorSuppliesCollection.findOne(
      { _id: vendorSupplyId } as any,
      { projection: { vendorName: 1, purchaseOrderNumber: 1 } } as any
    )
    const name =
      vendorSupply?.vendorName ||
      vendorSupply?.purchaseOrderNumber ||
      cacheKey
    vendorSupplyNameCache.set(cacheKey, name)
    return name
  }

  // Get reagent information
  const reagents = getReagentsCollection()
  const reagent = await reagents.findOne({ _id: reagentObjectId } as any)
  if (!reagent) {
    throw new HttpError(404, 'Reagent not found')
  }
  const instrumentCategories = Array.isArray(instrument.categories)
    ? instrument.categories.map((category) => category as string)
    : []
  const reagentCategories = Array.isArray(reagent.categories)
    ? reagent.categories.map((category) => category as string)
    : []

  if (instrumentCategories.length === 0) {
    throw new HttpError(
      409,
      `Instrument ${instrument.name} has no categories configured. Please update the instrument categories before assigning reagents.`
    )
  }

  if (reagentCategories.length === 0) {
    throw new HttpError(
      409,
      `Reagent ${reagent.name} has no categories configured. Please update the reagent categories before assigning it to instruments.`
    )
  }

  const hasMatchingCategory = reagentCategories.some((category) =>
    instrumentCategories.includes(category)
  )

  if (!hasMatchingCategory) {
    throw new HttpError(
      409,
      `Instrument ${instrument.name} and reagent ${reagent.name} do not share a common category.`
    )
  }
  const reagentName = reagent.name

  // Get inventory using FIFO
  const inventoryResult = await getReagentInventoryFIFO({
    reagentId: payload.reagentId,
    includeExpired: false
  })

  const inventory = inventoryResult.inventory

  if (!inventory || inventory.length === 0) {
    throw new HttpError(409, 'No inventory available for this reagent')
  }

  // Determine unit from inventory
  let unit: string
  if (payload.lotNumber) {
    // If lotNumber is specified, get unit from that lot
    const specifiedLot = inventory.find((i) => i.lotNumber === payload.lotNumber)
    if (!specifiedLot) {
      throw new HttpError(404, `Lot number ${payload.lotNumber} not found for this reagent`)
    }
    unit = specifiedLot.unitOfMeasure
  } else {
    // If no lotNumber, use unit from first lot (FIFO)
    unit = inventory[0].unitOfMeasure
  }

  // If lotNumber is specified, use that specific lot
  if (payload.lotNumber) {
    const specifiedLot = inventory.find(
      (i) => i.lotNumber === payload.lotNumber && i.unitOfMeasure === unit
    )
    
    if (!specifiedLot) {
      throw new HttpError(404, `Lot number ${payload.lotNumber} not found or unit mismatch for this reagent`)
    }
    
    if (specifiedLot.quantityAvailable < payload.quantity) {
      throw new HttpError(
        409,
        `Insufficient quantity in lot ${payload.lotNumber}. Available: ${specifiedLot.quantityAvailable} ${unit}, Requested: ${payload.quantity} ${unit}`
      )
    }
    
    // Record usage history for specified lot
    await recordReagentUsage({
      reagentId: payload.reagentId,
      reagentName: reagentName,
      quantity: payload.quantity,
      unit: unit,
      action: 'Used',
      instrumentId: instrumentId,
      batchLotNumber: specifiedLot.lotNumber,
      performedBy: assignedBy,
      notes: `Assigned to instrument ${instrument.name}${payload.notes ? `: ${payload.notes}` : ''}`
    })

    // Create assignment with specified lot
    const assignments = getInstrumentReagentAssignmentCollection()
    const now = new Date()
    const vendorSupplyName = await resolveVendorSupplyName(specifiedLot.vendorSupplyId)
    const assignmentDoc: InstrumentReagentAssignmentDocument = {
      instrumentId: instrumentObjectId,
      instrumentName: instrumentName,
      reagentId: reagentObjectId,
      reagentName: reagentName,
      lotNumber: specifiedLot.lotNumber,
      quantity: payload.quantity,
      unitOfMeasure: unit,
      expirationDate: specifiedLot.expirationDate,
      vendorSupplyId: specifiedLot.vendorSupplyId,
      vendorSupplyName,
      assignedBy: assignedByObjectId,
      assignedByName,
      assignedAt: now,
      isActive: true,
      notes: payload.notes,
      createdAt: now,
      updatedAt: now
    }

    const result = await assignments.insertOne(assignmentDoc as any)
    const created = await assignments.findOne({ _id: result.insertedId } as any)
    if (!created) {
      throw new HttpError(500, 'Failed to create reagent assignment')
    }

    // Event log
    try {
      const eventLogs = getEventLogsCollection()
      const roleCol = getRolesCollection()
      const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
      await eventLogs.insertOne({
        operator: {
          id: user._id || 'system',
          name: user.fullName || 'system',
          role: actorRoleDoc?.code || 'system'
        },
        action: 'ADD_REAGENT_TO_INSTRUMENT',
        details: `Added reagent ${reagentName} (${payload.quantity} ${unit}) to instrument ${instrument.name} using specified lot: ${specifiedLot.lotNumber}`,
        timestamp: now
      } as any)
    } catch {
      // swallow logging errors
    }

    return created as WithId<InstrumentReagentAssignmentDocument>
  }

  // If no lotNumber specified, use FIFO (existing logic)
  // Find lot with matching unit and sufficient quantity
  const matchingLots = inventory.filter(
    (i) => i.unitOfMeasure === unit && i.quantityAvailable >= payload.quantity
  )

  if (matchingLots.length === 0) {
    // Try to find if we can allocate across multiple lots
    const candidateLots = inventory.filter(
      (i) => i.unitOfMeasure === unit && i.quantityAvailable > 0
    )
    
    if (candidateLots.length === 0) {
      throw new HttpError(409, `No inventory available for this reagent in the unit: ${unit}`)
    }

    // Calculate total available
    const totalAvailable = candidateLots.reduce((sum, lot) => sum + lot.quantityAvailable, 0)
    if (totalAvailable < payload.quantity) {
      throw new HttpError(
        409,
        `Insufficient inventory. Available: ${totalAvailable} ${unit}, Requested: ${payload.quantity} ${unit}`
      )
    }

    // Allocate from multiple lots using FIFO (earliest expiration first)
    let remaining = payload.quantity
    let allocatedLots: Array<{ lot: typeof candidateLots[0]; quantity: number }> = []
    
    for (const lot of candidateLots) {
      if (remaining <= 0) break
      const allocate = Math.min(remaining, lot.quantityAvailable)
      
      // Record usage history for each lot allocation
      await recordReagentUsage({
        reagentId: payload.reagentId,
        reagentName: reagentName,
        quantity: allocate,
        unit: unit,
        action: 'Used',
        instrumentId: instrumentId,
        batchLotNumber: lot.lotNumber,
        performedBy: assignedBy,
        notes: `Assigned to instrument ${instrument.name}${payload.notes ? `: ${payload.notes}` : ''}`
      })
      
      allocatedLots.push({ lot, quantity: allocate })
      remaining -= allocate
    }

    if (remaining > 0) {
      throw new HttpError(409, 'Failed to allocate sufficient quantity from available lots')
    }

    // Use the first allocated lot (earliest expiration) for the assignment document
    // This represents the primary lot, but we've recorded usage from all lots
    const primaryLot = allocatedLots[0].lot
    const totalQuantity = payload.quantity

    // Create assignment - use primary lot info but quantity is total from all lots
    const assignments = getInstrumentReagentAssignmentCollection()
    const now = new Date()
    const vendorSupplyName = await resolveVendorSupplyName(primaryLot.vendorSupplyId)
    const assignmentDoc: InstrumentReagentAssignmentDocument = {
      instrumentId: instrumentObjectId,
      instrumentName: instrumentName,
      reagentId: reagentObjectId,
      reagentName: reagentName,
      lotNumber: primaryLot.lotNumber, // Primary lot (earliest expiration)
      quantity: totalQuantity,
      unitOfMeasure: unit,
      expirationDate: primaryLot.expirationDate, // Earliest expiration
      vendorSupplyId: primaryLot.vendorSupplyId,
      vendorSupplyName,
      assignedBy: assignedByObjectId,
      assignedByName,
      assignedAt: now,
      isActive: true,
      notes: payload.notes ? `${payload.notes} (Allocated from multiple lots using FIFO)` : 'Allocated from multiple lots using FIFO',
      createdAt: now,
      updatedAt: now
    }

    const result = await assignments.insertOne(assignmentDoc as any)
    const created = await assignments.findOne({ _id: result.insertedId } as any)
    if (!created) {
      throw new HttpError(500, 'Failed to create reagent assignment')
    }

    // Event log
    try {
      const eventLogs = getEventLogsCollection()
      const roleCol = getRolesCollection()
      const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
      const lotsInfo = allocatedLots.map(l => `${l.quantity} ${unit} (Lot: ${l.lot.lotNumber})`).join(', ')
      await eventLogs.insertOne({
        operator: {
          id: user._id || 'system',
          name: user.fullName || 'system',
          role: actorRoleDoc?.code || 'system'
        },
        action: 'ADD_REAGENT_TO_INSTRUMENT',
        details: `Added reagent ${reagentName} (${totalQuantity} ${unit}) to instrument ${instrument.name} using FIFO from multiple lots: ${lotsInfo}`,
        timestamp: now
      } as any)
    } catch {
      // swallow logging errors
    }

    return created as WithId<InstrumentReagentAssignmentDocument>
  }

  // Use first matching lot (FIFO - earliest expiration)
  const selectedLot = matchingLots[0]

  // Record usage history for FIFO allocation
  await recordReagentUsage({
    reagentId: payload.reagentId,
    reagentName: reagentName,
    quantity: payload.quantity,
    unit: unit,
    action: 'Used',
    instrumentId: instrumentId,
    batchLotNumber: selectedLot.lotNumber,
    performedBy: assignedBy,
    notes: `Assigned to instrument ${instrument.name}${payload.notes ? `: ${payload.notes}` : ''}`
  })

  // Create assignment
  const assignments = getInstrumentReagentAssignmentCollection()
  const now = new Date()
  const vendorSupplyName = await resolveVendorSupplyName(selectedLot.vendorSupplyId)
  const assignmentDoc: InstrumentReagentAssignmentDocument = {
    instrumentId: instrumentObjectId,
    instrumentName: instrumentName,
    reagentId: reagentObjectId,
    reagentName: reagentName,
    lotNumber: selectedLot.lotNumber,
    quantity: payload.quantity,
    unitOfMeasure: unit,
    expirationDate: selectedLot.expirationDate,
    vendorSupplyId: selectedLot.vendorSupplyId,
    vendorSupplyName,
    assignedBy: assignedByObjectId,
    assignedByName,
    assignedAt: now,
    isActive: true,
    notes: payload.notes,
    createdAt: now,
    updatedAt: now
  }

  const result = await assignments.insertOne(assignmentDoc as any)
  const created = await assignments.findOne({ _id: result.insertedId } as any)
  if (!created) {
    throw new HttpError(500, 'Failed to create reagent assignment')
  }

  // Event log
  try {
    const eventLogs = getEventLogsCollection()
    const roleCol = getRolesCollection()
    const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: user._id || 'system',
        name: user.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
        action: 'ADD_REAGENT_TO_INSTRUMENT',
        details: `Added reagent ${reagentName} (${payload.quantity} ${unit}) to instrument ${instrument.name} using FIFO (Lot: ${selectedLot.lotNumber})`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return created as WithId<InstrumentReagentAssignmentDocument>
}

export const removeReagentFromInstrument = async (
  assignmentId: string,
  removedBy: string
): Promise<WithId<InstrumentReagentAssignmentDocument>> => {
  let assignmentObjectId: ObjectId
  try {
    assignmentObjectId = new ObjectId(assignmentId)
  } catch {
    throw new HttpError(422, 'Invalid assignment id')
  }

  let removedByObjectId: ObjectId
  try {
    removedByObjectId = new ObjectId(removedBy)
  } catch {
    throw new HttpError(422, 'Invalid removedBy user id')
  }

  const assignments = getInstrumentReagentAssignmentCollection()
  const assignment = await assignments.findOne({ _id: assignmentObjectId } as any)
  if (!assignment) {
    throw new HttpError(404, 'Reagent assignment not found')
  }

  if (!assignment.isActive) {
    throw new HttpError(409, 'Reagent assignment is already removed')
  }

  const users = getUsersCollection()
  const user = await users.findOne({ _id: removedByObjectId } as any)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }
  const removedByName = user.fullName || user.email || removedByObjectId.toString()

  const now = new Date()
  await assignments.updateOne(
    { _id: assignmentObjectId } as any,
    {
      $set: {
        isActive: false,
        removedAt: now,
        removedBy: removedByObjectId,
        removedByName,
        updatedAt: now
      }
    }
  )

  const updated = await assignments.findOne({ _id: assignmentObjectId } as any)
  if (!updated) {
    throw new HttpError(404, 'Assignment not found after update')
  }

  // Event log
  try {
    const eventLogs = getEventLogsCollection()
    const roleCol = getRolesCollection()
    const actorRoleDoc = user?.roleId ? await roleCol.findOne({ _id: user.roleId } as any) : null
    await eventLogs.insertOne({
      operator: {
        id: user._id || 'system',
        name: user.fullName || 'system',
        role: actorRoleDoc?.code || 'system'
      },
      action: 'REMOVE_REAGENT_FROM_INSTRUMENT',
      details: `Removed reagent ${assignment.reagentName} from instrument`,
      timestamp: now
    } as any)
  } catch {
    // swallow logging errors
  }

  return updated as WithId<InstrumentReagentAssignmentDocument>
}

export const getInstrumentReagents = async (instrumentId: string) => {
  let instrumentObjectId: ObjectId
  try {
    instrumentObjectId = new ObjectId(instrumentId)
  } catch {
    throw new HttpError(422, 'Invalid instrument id')
  }

  // Verify instrument exists
  const instruments = getInstrumentsCollection()
  const instrument = await instruments.findOne({ _id: instrumentObjectId } as any)
  if (!instrument) {
    throw new HttpError(404, 'Instrument not found')
  }

  const assignments = getInstrumentReagentAssignmentCollection()
  const activeAssignments = await assignments
    .find({
      instrumentId: instrumentObjectId,
      isActive: true
    } as any)
    .toArray()

  if (activeAssignments.length > 0) {
    const assignedByIds = new Set<string>()
    const removedByIds = new Set<string>()
    const vendorSupplyIds = new Set<string>()

    activeAssignments.forEach((assignment) => {
      if (!assignment.instrumentName) {
        assignment.instrumentName = instrument.name
      }
      if (assignment.assignedBy && !assignment.assignedByName) {
        assignedByIds.add(assignment.assignedBy.toString())
      }
      if (assignment.removedBy && !assignment.removedByName) {
        removedByIds.add(assignment.removedBy.toString())
      }
      if (assignment.vendorSupplyId && !assignment.vendorSupplyName) {
        vendorSupplyIds.add(assignment.vendorSupplyId.toString())
      }
    })

    const userIds = Array.from(new Set([...assignedByIds, ...removedByIds]))
    if (userIds.length > 0) {
      const usersCol = getUsersCollection()
      const users = await usersCol
        .find(
          { _id: { $in: userIds.map((id) => new ObjectId(id)) } } as any,
          { projection: { fullName: 1, email: 1 } }
        )
        .toArray()
      const userNameMap = new Map<string, string>(
        users
          .filter((u) => u?._id)
          .map((u) => [u._id!.toString(), u.fullName || u.email || u._id!.toString()])
      )
      activeAssignments.forEach((assignment) => {
        if (assignment.assignedBy && !assignment.assignedByName) {
          const name = userNameMap.get(assignment.assignedBy.toString())
          if (name) assignment.assignedByName = name
        }
        if (assignment.removedBy && !assignment.removedByName) {
          const name = userNameMap.get(assignment.removedBy.toString())
          if (name) assignment.removedByName = name
        }
      })
    }

    if (vendorSupplyIds.size > 0) {
      const vendorSuppliesCol = getReagentVendorSupplyCollection()
      const vendorSupplies = await vendorSuppliesCol
        .find(
          { _id: { $in: Array.from(vendorSupplyIds).map((id) => new ObjectId(id)) } } as any,
          { projection: { vendorName: 1, purchaseOrderNumber: 1 } }
        )
        .toArray()
      const vendorNameMap = new Map<string, string>(
        vendorSupplies
          .filter((supply) => supply?._id)
          .map((supply) => [
            supply._id!.toString(),
            supply.vendorName || supply.purchaseOrderNumber || supply._id!.toString()
          ])
      )
      activeAssignments.forEach((assignment) => {
        if (assignment.vendorSupplyId && !assignment.vendorSupplyName) {
          const name = vendorNameMap.get(assignment.vendorSupplyId.toString())
          if (name) assignment.vendorSupplyName = name
        }
      })
    }
  }

  return {
    instrument: instrument,
    reagents: activeAssignments
  }
}

