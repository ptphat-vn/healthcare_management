import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
import {
  createInstrumentController,
  listInstrumentsController,
  getInstrumentByIdController,
  updateInstrumentController,
  deleteInstrumentController,
  addReagentToInstrumentController,
  removeReagentFromInstrumentController,
  getInstrumentReagentsController
} from '~/controllers/instrument.controller'
import {
  validateCreateInstrument,
  validateUpdateInstrument,
  validateInstrumentId,
  validateAddReagentToInstrument,
  validateAssignmentId
} from '~/validations/instrument.validation'

const router = Router()

router.use(authMiddleware)

// Instrument CRUD Routes
router.get(
  '/instruments',
  privilegeMiddleware(['view_instrument']),
  listInstrumentsController
)
router.post(
  '/instruments',
  privilegeMiddleware(['create_instrument']),
  validateCreateInstrument,
  createInstrumentController
)
router.get(
  '/instruments/:id',
  privilegeMiddleware(['view_instrument']),
  validateInstrumentId,
  getInstrumentByIdController
)
router.put(
  '/instruments/:id',
  privilegeMiddleware(['modify_instrument']),
  validateInstrumentId,
  validateUpdateInstrument,
  updateInstrumentController
)
router.delete(
  '/instruments/:id',
  privilegeMiddleware(['delete_instrument']),
  validateInstrumentId,
  deleteInstrumentController
)

// Reagent Assignment Routes
router.post(
  '/instruments/:id/reagents',
  privilegeMiddleware(['modify_instrument']),
  validateInstrumentId,
  validateAddReagentToInstrument,
  addReagentToInstrumentController
)
router.delete(
  '/instruments/reagents/:assignmentId',
  privilegeMiddleware(['modify_instrument']),
  validateAssignmentId,
  removeReagentFromInstrumentController
)
router.get(
  '/instruments/:id/reagents',
  privilegeMiddleware(['view_instrument']),
  validateInstrumentId,
  getInstrumentReagentsController
)

export default router

