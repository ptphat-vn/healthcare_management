import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
import {
  createReagentController,
  listReagentsController,
  getReagentByIdController,
  updateReagentController,
  deleteReagentController,
  getReagentCategoriesController,
  createVendorSupplyController,
  listVendorSupplyHistoryController,
  listUsageHistoryController
} from '~/controllers/reagent.controller'
import {
  validateCreateReagent,
  validateUpdateReagent,
  validateReagentId,
  validateCreateVendorSupply
} from '~/validations/reagent.validation'

const router = Router()

router.use(authMiddleware)

// Reagent Master Data Routes
router.get(
  '/reagents',
  privilegeMiddleware(['view_reagent']),
  listReagentsController
)
router.post(
  '/reagents',
  privilegeMiddleware(['create_reagent']),
  validateCreateReagent,
  createReagentController
)
router.get(
  '/reagents/categories',
  privilegeMiddleware(['view_reagent']),
  getReagentCategoriesController
)
router.get(
  '/reagents/:id',
  privilegeMiddleware(['view_reagent']),
  validateReagentId,
  getReagentByIdController
)
router.put(
  '/reagents/:id',
  privilegeMiddleware(['modify_reagent']),
  validateReagentId,
  validateUpdateReagent,
  updateReagentController
)
router.delete(
  '/reagents/:id',
  privilegeMiddleware(['delete_reagent']),
  validateReagentId,
  deleteReagentController
)

// Vendor Supply History Routes
router.post(
  '/reagents/vendor-supply',
  privilegeMiddleware(['create_reagent_supply']),
  validateCreateVendorSupply,
  createVendorSupplyController
)
router.get(
  '/reagents/vendor-supply/history',
  privilegeMiddleware(['view_reagent_supply_history']),
  listVendorSupplyHistoryController
)

// Usage History Routes
router.get(
  '/reagents/usage/history',
  privilegeMiddleware(['view_reagent_usage_history']),
  listUsageHistoryController
)

// Inventory (FIFO)
import { getReagentInventoryFIFOController, getNextReagentLotFIFOController } from '~/controllers/reagent.controller'

router.get(
  '/reagents/inventory/fifo',
  privilegeMiddleware(['view_reagent_supply_history']),
  getReagentInventoryFIFOController
)
router.get(
  '/reagents/inventory/next-lot',
  privilegeMiddleware(['view_reagent_supply_history']),
  getNextReagentLotFIFOController
)

export default router

