import { Router } from 'express'
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword } from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController, forgotPasswordController, resetPasswordController } from '~/controllers/user.controllers'

const userRouter = Router()

userRouter.post('/register', validateRegister, registerController)
userRouter.post('/login', validateLogin, loginController)
userRouter.post('/logout', logoutController)
userRouter.post('/forgot-password', validateForgotPassword, forgotPasswordController)
userRouter.post('/reset-password', validateResetPassword, resetPasswordController)

export default userRouter
