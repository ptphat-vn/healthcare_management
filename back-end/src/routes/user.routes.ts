import { Router } from 'express'
import { validateUpdateUser, validateStatusChange } from '~/validations/user.validation'
import {
  updateUserController,
  updateUserStatusController,
  getAllUsers,
  getUserDetail
} from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'

const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/:id', getUserDetail)

export default userRouter
