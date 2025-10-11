import { Request, Response, NextFunction } from 'express'

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).authUserRole
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' })
    }
    next()
  }
}