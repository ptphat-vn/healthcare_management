import { Router } from 'express'
import { validateUpdateUser, validateStatusChange} from '~/validations/user.validation'

import { updateUserController, updateUserStatusController, deleteUserController, blockUserController, getAllUsers, getUserDetail, updateUserProfileController,  } from '~/controllers/user.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'


const userRouter = Router()
// user management (admin namespace to match existing style)
userRouter.put('/admin/users/update/:id', authMiddleware, privilegeMiddleware(['modify_user']), validateUpdateUser, updateUserController)
userRouter.put('/user/profile', authMiddleware, privilegeMiddleware(['modify_user']), validateUpdateUser, updateUserProfileController)
userRouter.patch('/admin/users/:id/status', authMiddleware, privilegeMiddleware(['modify_user']), validateStatusChange, updateUserStatusController)
userRouter.delete('/admin/users/delete/:id', authMiddleware, privilegeMiddleware(['delete_user']), deleteUserController)
userRouter.post('/admin/users/block/:id', authMiddleware, privilegeMiddleware(['lock_unlock_user']), blockUserController)
userRouter.get('/user/all', authMiddleware, privilegeMiddleware(['view_user']), getAllUsers)
userRouter.get('/user/:id', authMiddleware, privilegeMiddleware(['view_user']), getUserDetail)
export default userRouter


