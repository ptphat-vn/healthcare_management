import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
import {
  createRoleController,
  listRolesController,
  updateRoleController,
  deleteRoleController
} from '~/controllers/role.controller'
import { validateCreateRole, validateUpdateRole, validateDeleteRole } from '~/validations/role.validation'

const router = Router()

router.use(authMiddleware)

router.get('/roles', privilegeMiddleware(['view_role']), listRolesController)
router.post('/roles', privilegeMiddleware(['create_role']), validateCreateRole, createRoleController)
router.put('/roles/:id', privilegeMiddleware(['update_role']), validateUpdateRole, updateRoleController)
router.delete('/roles/:id', privilegeMiddleware(['delete_role']), validateDeleteRole, deleteRoleController)

export default router


