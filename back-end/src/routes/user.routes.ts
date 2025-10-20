import { Router } from 'express'
import { validateUpdateUser, validateStatusChange, validateSearchUsers, validateDeleteUserRole, validateBanUser } from '~/validations/user.validation'

import { updateUserController, updateUserStatusController, getAllUsers, getUserDetail, searchUsersController, updateUserProfileController, deleteUserRoleController, banUserController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'

const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.put('/user/profile', authMiddleware, validateUpdateUser, updateUserProfileController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/search', validateSearchUsers, searchUsersController)
userRouter.get('/user/:id', getUserDetail)
userRouter.delete('/roles/:id', roleMiddleware (['admin']), validateDeleteUserRole, deleteUserRoleController)
userRouter.patch('/admin/users/:id/ban', roleMiddleware(['admin']), authMiddleware, validateBanUser, banUserController)
export default userRouter
