import { Router } from 'express'
import { validateUpdateUser, validateStatusChange } from '~/validations/user.validation'

import {
  updateUserController,
  updateUserStatusController,
  deleteUserController,
  blockUserController,
  getAllUsers,
  getUserDetail,
  updateUserProfileController,
  getAllLabUser,
  getAllPatient,
  uploadAvatarController
} from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
import { upload } from '~/middlewares/upload.middleware'

const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put(
  '/admin/users/update/:id',
  authMiddleware,
  privilegeMiddleware(['modify_user']),
  validateUpdateUser,
  updateUserController
)
userRouter.put(
  '/user/profile',
  authMiddleware,
  privilegeMiddleware(['modify_user']),
  validateUpdateUser,
  updateUserProfileController
)
userRouter.patch(
  '/admin/users/:id/status',
  authMiddleware,
  privilegeMiddleware(['modify_user']),
  validateStatusChange,
  updateUserStatusController
)
userRouter.delete('/admin/users/delete/:id', authMiddleware, privilegeMiddleware(['delete_user']), deleteUserController)
userRouter.post(
  '/admin/users/block/:id',
  authMiddleware,
  privilegeMiddleware(['lock_unlock_user']),
  blockUserController
)
// Chat peers listing (auth only)
userRouter.get('/user/lab-users', authMiddleware, getAllLabUser)
userRouter.get('/user/patients', authMiddleware, getAllPatient)
userRouter.get('/user/all', authMiddleware, privilegeMiddleware(['view_user']), getAllUsers)
// Avatar upload - MUST be before /user/:id to avoid conflict
userRouter.put('/user/avatar', authMiddleware, upload.single('avatar'), uploadAvatarController)
userRouter.get('/user/:id', authMiddleware, privilegeMiddleware(['view_user']), getUserDetail)
export default userRouter
