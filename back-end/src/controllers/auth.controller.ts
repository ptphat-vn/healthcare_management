import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as authService from '~/services/auth/auth.service'
import { jwtDecode } from 'jwt-decode'
import { OAuth2Client } from 'google-auth-library'

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
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const data = await authService.createUserByAdmin(req.body, authUserId)
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
    const refreshToken = (req.body as { refreshToken?: string })?.refreshToken || (req.headers['x-refresh-token'] as string | undefined)
    await authService.logout(refreshToken)
    res.clearCookie('token')
    res.clearCookie('session')
    return res.status(200).json({
      message: MESSAGES.LOGOUT_SUCCESS,
      data: { sessionCleared: true, refreshRevoked: Boolean(refreshToken) }
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
export const loginGoogleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenGoogle } = req.body
    if (!tokenGoogle) throw new HttpError(400, 'Missing Google token')

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: tokenGoogle,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    console.log('Google payload:', payload)

    const email = payload?.email
    const fullName = payload?.name
    if (!email || !fullName) throw new HttpError(400, 'Missing email or name from Google payload')

    const tokens = await authService.loginWithGoogle({ email, fullName })
    return res.status(200).json({
      message: MESSAGES.LOGIN_SUCCESS,
      data: tokens
    })
  } catch (err) {
    console.error('Google login error:', err)
    next(err)
  }
}
