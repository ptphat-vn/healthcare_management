import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as authService from '~/services/auth.service'

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.register(req.body)
    return res.status(200).json({ message: MESSAGES.REGISTER_SUCCESS, data })
  } catch (err) {
    next(err)
  }
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.createUserByAdmin(req.body)
    return res.status(200).json({ message: MESSAGES.REGISTER_SUCCESS, data })
  } catch (err) {
    next(err)
  }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.login(req.body)
    return res.status(200).json({ message: MESSAGES.LOGIN_SUCCESS, data: tokens })
  } catch (err) {
    next(err)
  }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token')
    res.clearCookie('session')
    return res.status(200).json({
      message: MESSAGES.LOGOUT_SUCCESS,
      data: { sessionCleared: true }
    })
  } catch (err) {
    next(err)
  }
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.forgotPassword((req.body as { email: string }).email)
    return res.status(200).json({ message: MESSAGES.PASSWORD_RESET_EMAIL_SENT, data })
  } catch (err) {
    next(err)
  }
}

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.resetPassword(req.body)
    return res.status(200).json({ message: MESSAGES.RESET_PASSWORD_SUCCESS, data })
  } catch (err) {
    next(err)
  }
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).authUserId
    const data = await authService.changePassword({ userId, ...(req.body as any) })
    return res.status(200).json({ message: 'Password changed successfully', data })
  } catch (err) {
    next(err)
  }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.refreshAccessToken((req.body as { refreshToken: string }).refreshToken)
    return res.status(200).json({ message: 'Token refreshed successfully', data })
  } catch (err) {
    next(err)
  }
}

export const profileUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)
    const data = await authService.getProfile(authUserId)
    return res.status(200).json({ message: MESSAGES.GET_USER_DETAIL_SUCCESS, data })
  } catch (error) {
    next(error)
  }
}
