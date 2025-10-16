import { Router } from 'express'
import { validateUpdateUser, validateStatusChange, validateSearchUsers, validateDeleteUserRole } from '~/validations/user.validation'

import { updateUserController, updateUserStatusController, getAllUsers, getUserDetail, searchUsersController, updateUserProfileController, deleteUserRoleController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'

const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.put('/user/profile', authMiddleware, validateUpdateUser, updateUserProfileController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/search', validateSearchUsers, searchUsersController)
userRouter.get('/user/:id', getUserDetail)
userRouter.delete('/admin/user/:id/role', authMiddleware, validateDeleteUserRole, deleteUserRoleController)

export default userRouter
