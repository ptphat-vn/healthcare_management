import { Router } from 'express'
import { validateUpdateUser, validateStatusChange } from '~/validations/user.validation'
import {
<<<<<<< back-end/src/routes/user.routes.ts
  validateLogin,
  validateUpdateUser,
  validateStatusChange,
  validateSearchUsers
} from '~/validations/user.validation'
import { updateUserController, updateUserStatusController, getAllUsers, getUserDetail, searchUsersController } from '~/controllers/user.controller'
=======
  updateUserController,
  updateUserStatusController,
  getAllUsers,
  getUserDetail
} from '~/controllers/user.controller'
>>>>>>> back-end/src/routes/user.routes.ts
import { authMiddleware } from '~/middlewares/auth.middleware'

const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)
userRouter.get('/user/all', getAllUsers)
userRouter.get('/user/search', validateSearchUsers, searchUsersController)
userRouter.get('/user/:id', getUserDetail)

export default userRouter
