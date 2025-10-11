import { Router } from 'express'
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateChangePassword, validateRefreshToken, validateUpdateUser, validateStatusChange } from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController, forgotPasswordController, resetPasswordController, changePasswordController, createUserController, refreshTokenController, updateUserController, updateUserStatusController, getAllUsers, getUserDetail } from '~/controllers/user.controllers'
import { authMiddleware } from '~/middlewares/auth.middleware'

const userRouter = Router()

userRouter.post('/auth/register', validateRegister, registerController)
userRouter.post('/auth/login', validateLogin, loginController)
userRouter.post('/auth/logout', logoutController)
userRouter.post('/admin/create-user', validateRegister, createUserController)
userRouter.post('/auth/forgot-password', validateForgotPassword, forgotPasswordController)
userRouter.post('/auth/reset-password', validateResetPassword, resetPasswordController)
userRouter.post('/auth/change-password', authMiddleware, validateChangePassword, changePasswordController)
userRouter.post('/auth/refresh-token', validateRefreshToken, refreshTokenController)

// user management (admin namespace to match existing style)
userRouter.put('/admin/users/:id', authMiddleware, validateUpdateUser, updateUserController)
userRouter.patch('/admin/users/:id/status', authMiddleware, validateStatusChange, updateUserStatusController)

userRouter.get('/userlist', getAllUsers)
userRouter.get('/detail/:id', getUserDetail)

export default userRouter
