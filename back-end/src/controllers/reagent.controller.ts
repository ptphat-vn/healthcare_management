import { Request, Response, NextFunction } from 'express'
import * as reagentService from '~/services/reagent.service'
import * as vendorSupplyService from '~/services/reagent-vendor-supply.service'
import * as usageHistoryService from '~/services/reagent-usage-history.service'
import * as reagentInventoryService from '~/services/reagent-inventory.service'

// REAGENT MASTER DATA

export const createReagentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const created = await reagentService.createReagent(req.body, authUserId)
    return res.status(200).json({ message: 'Reagent created successfully', data: created })
  } catch (err) {
    next(err)
  }
}

export const listReagentsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reagentService.listReagents({
      search: req.query.search as string,
      sortBy: (req.query.sortBy as any) || 'updatedAt',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : -1) as 1 | -1,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({
        message: 'No Data',
        data: {
          reagents: [],
          pagination: data.pagination
        }
      })
    }
    return res.status(200).json({
      message: 'Get reagents successfully',
      data: {
        reagents: data.reagents,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getReagentByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const reagent = await reagentService.getReagentById(id)
    return res.status(200).json({ message: 'Get reagent successfully', data: reagent })
  } catch (err) {
    next(err)
  }
}

export const updateReagentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const updated = await reagentService.updateReagent(id, req.body, authUserId)
    return res.status(200).json({ message: 'Reagent updated successfully', data: updated })
  } catch (err) {
    next(err)
  }
}

export const deleteReagentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const deleted = await reagentService.deleteReagent(id, authUserId)
    return res.status(200).json({ message: 'Reagent deleted successfully', data: deleted })
  } catch (err) {
    next(err)
  }
}

// VENDOR SUPPLY HISTORY

export const createVendorSupplyController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    if (!req.body.receivedBy) {
      req.body.receivedBy = authUserId
    }
    const created = await vendorSupplyService.createVendorSupply(req.body)
    return res.status(200).json({ message: 'Vendor supply record created successfully', data: created })
  } catch (err) {
    next(err)
  }
}

export const listVendorSupplyHistoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await vendorSupplyService.listVendorSupplyHistory({
      reagentId: req.query.reagentId as string,
      vendorId: req.query.vendorId as string,
      vendorName: req.query.vendorName as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as any) || 'receiptDate',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : -1) as 1 | -1
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({
        message: 'No Data',
        data: {
          vendorSupplies: [],
          pagination: data.pagination
        }
      })
    }
    return res.status(200).json({
      message: 'Get vendor supply history successfully',
      data: {
        vendorSupplies: data.vendorSupplies,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

// USAGE HISTORY

export const recordReagentUsageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await usageHistoryService.recordReagentUsage(req.body)
    const isArray = Array.isArray(created)
    return res.status(200).json({
      message: isArray ? 'Reagent usage recorded successfully (multi-lot allocation)' : 'Reagent usage recorded successfully',
      data: created
    })
  } catch (err) {
    next(err)
  }
}

export const listUsageHistoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await usageHistoryService.listUsageHistory({
      reagentId: req.query.reagentId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      action: req.query.action as any,
      testOrderId: req.query.testOrderId as string,
      instrumentId: req.query.instrumentId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sortBy: (req.query.sortBy as any) || 'performedAt',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : -1) as 1 | -1
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({
        message: 'No Data',
        data: {
          usageHistory: [],
          pagination: data.pagination
        }
      })
    }
    return res.status(200).json({
      message: 'Get usage history successfully',
      data: {
        usageHistory: data.usageHistory,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

// INVENTORY (FIFO)
export const getReagentInventoryFIFOController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reagentInventoryService.getReagentInventoryFIFO({
      reagentId: req.query.reagentId as string,
      reagentName: req.query.reagentName as string,
      includeExpired: req.query.includeExpired === 'true',
      includeExpiringSoon: req.query.includeExpiringSoon === 'true'
    })
    return res.status(200).json({ message: 'Get reagent inventory successfully', data })
  } catch (err) {
    next(err)
  }
}

export const getNextReagentLotFIFOController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reagentId = (req.query.reagentId as string) || ''
    if (!reagentId) return res.status(400).json({ message: 'reagentId is required' })
    const requiredQuantity = req.query.requiredQuantity ? Number(req.query.requiredQuantity) : undefined
    const data = await reagentInventoryService.getNextReagentLotFIFO(reagentId, requiredQuantity)
    return res.status(200).json({ message: 'Get next reagent lot successfully', data })
  } catch (err) {
    next(err)
  }
}

