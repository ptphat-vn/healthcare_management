import { Request, Response, NextFunction } from 'express'

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).authUserRole
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to access this feature' })
    }
    next()
  }
}