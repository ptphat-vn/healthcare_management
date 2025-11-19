import { Request, Response, NextFunction } from 'express'
import { generateStringeeAccessToken } from '~/services/stringee.service'


export const getStringeeTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = generateStringeeAccessToken(String(authUserId))

    return res.status(200).json({
      message: 'Stringee access token',
      data: {
        token
      }
    })
  } catch (err) {
    next(err)
  }
}


