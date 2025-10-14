import { Router } from 'express'
import {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken
} from '~/validations/user.validation'
import {
  loginController,
  logoutController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  createUserController,
  refreshTokenController,
  profileUserController
} from '~/controllers/auth.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'

const authRouter = Router()

authRouter.post('/auth/register', validateRegister, registerController)
authRouter.post('/auth/login', validateLogin, loginController)
authRouter.post('/auth/logout', logoutController)
authRouter.post('/admin/create-user', validateRegister, createUserController)
authRouter.post('/auth/forgot-password', validateForgotPassword, forgotPasswordController)
authRouter.post('/auth/reset-password', validateResetPassword, resetPasswordController)
authRouter.post('/auth/change-password', authMiddleware, validateChangePassword, changePasswordController)
authRouter.post('/auth/refresh-token', validateRefreshToken, refreshTokenController)
authRouter.get('/auth/me', authMiddleware, profileUserController)

export default authRouter


