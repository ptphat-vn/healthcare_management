import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'
import {
  createRoleController,
  listRolesController,
  updateRoleController,
  deleteRoleController
} from '~/controllers/role.controller'
import { validateCreateRole, validateUpdateRole, validateDeleteRole } from '~/validations/role.validation'

const router = Router()

const VIEW_ROLE_ROLES = ['admin', 'manager', 'service', 'user']
const CREATE_ROLE_ROLES = ['admin', 'manager']
const UPDATE_ROLE_ROLES = ['admin', 'manager']

router.use(authMiddleware)

router.get('/roles', roleMiddleware(VIEW_ROLE_ROLES), listRolesController)
router.post('/roles', roleMiddleware(CREATE_ROLE_ROLES), validateCreateRole, createRoleController)
router.put('/roles/:id', roleMiddleware(UPDATE_ROLE_ROLES), validateUpdateRole, updateRoleController)
router.delete('/roles/:id', roleMiddleware(['admin', 'manager']), validateDeleteRole, deleteRoleController)

export default router
