import { Router } from 'express'
import { validateUpdateUser, validateStatusChange } from '~/validations/user.validation'

import { updateUserController, updateUserStatusController, deleteUserController, blockUserController, getAllUsers, getUserDetail, updateUserProfileController } from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'


const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/update/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.put('/user/profile', authMiddleware, validateUpdateUser, updateUserProfileController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.delete('/admin/users/delete/:id', authMiddleware, roleMiddleware(['admin', 'manager']), deleteUserController)
userRouter.post('/admin/users/block/:id', authMiddleware, roleMiddleware(['admin', 'manager']), blockUserController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/:id', getUserDetail)

export default userRouter
