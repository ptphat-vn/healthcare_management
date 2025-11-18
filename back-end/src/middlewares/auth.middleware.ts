import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { HttpError } from '~/models/error.model'
import { getUsersCollection } from '~/models/user.model'
import { getRolesCollection } from '~/models/role.model'
import { ObjectId } from 'mongodb'

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Unauthorized')
    }
    const token = header.substring(7)
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string; email: string; type: string }
    if (payload.type !== 'access') {
      throw new HttpError(401, 'Invalid token type')
    }
    let userObjectId: ObjectId
    try {
      userObjectId = new ObjectId(payload.sub)
    } catch {
      throw new HttpError(401, 'Unauthorized')
    }
    const users = getUsersCollection()
    const user = await users.findOne({ _id: userObjectId } as any)
    if (!user) throw new HttpError(401, 'Unauthorized')
    ;(req as any).authUserId = userObjectId
    const roles = getRolesCollection()
    const role = user.roleId ? await roles.findOne({ _id: user.roleId } as any) : null
    ;(req as any).authUserRole = role?.code || 'patient'
    ;(req as any).authUserPrivileges = role?.privileges || ['read_only']
    next()
  } catch (_e) {
    next(new HttpError(401, 'Unauthorized'))
  }
}
