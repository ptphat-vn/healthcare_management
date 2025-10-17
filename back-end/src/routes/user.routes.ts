import { Router } from 'express'
import { validateUpdateUser, validateStatusChange, validateSearchUsers } from '~/validations/user.validation'

import { updateUserController, updateUserStatusController, deleteUserController, blockUserController, getAllUsers, getUserDetail, searchUsersController, updateUserProfileController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'


const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.put('/user/profile', authMiddleware, validateUpdateUser, updateUserProfileController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.delete('/admin/users/:id', authMiddleware, roleMiddleware(['admin', 'manager']), deleteUserController)
userRouter.post('/admin/users/:id/block', authMiddleware, roleMiddleware(['admin', 'manager']), blockUserController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/search', validateSearchUsers, searchUsersController)
userRouter.get('/user/:id', getUserDetail)

export default userRouter
