import { Router } from 'express'
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateChangePassword, validateRefreshToken } from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController, forgotPasswordController, resetPasswordController, changePasswordController, createUserController, refreshTokenController } from '~/controllers/user.controllers'
import { authMiddleware } from '~/middlewares/auth.middleware'

const userRouter = Router()

userRouter.post('/auth-regis', validateRegister, registerController)
userRouter.post('/create-user', validateRegister, createUserController)
userRouter.post('/auth-login', validateLogin, loginController)
userRouter.post('/logout', logoutController)
userRouter.post('/forgot-password', validateForgotPassword, forgotPasswordController)
userRouter.post('/reset-password', validateResetPassword, resetPasswordController)
userRouter.post('/change-password', authMiddleware, validateChangePassword, changePasswordController)
userRouter.post('/refresh-token', validateRefreshToken, refreshTokenController)

export default userRouter
