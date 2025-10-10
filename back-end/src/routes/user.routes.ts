import { Router } from 'express'
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateChangePassword, validateRefreshToken } from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController, forgotPasswordController, resetPasswordController, changePasswordController, createUserController, refreshTokenController } from '~/controllers/user.controllers'
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

export default userRouter
