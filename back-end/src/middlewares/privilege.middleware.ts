import { Request, Response, NextFunction } from 'express'
import { PRIVILEGES, isAdmin, hasPrivilege, hasAnyPrivilege } from '~/constants/privilege.constant'

export const privilegeMiddleware = (requiredPrivileges: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPrivileges = (req as any).authUserPrivileges || []
    
    if (isAdmin(userPrivileges)) {
      return next()
    }
    
    const hasAllPrivileges = requiredPrivileges.every(privilege => 
      hasPrivilege(userPrivileges, privilege)
    )
    
    if (!hasAllPrivileges) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền thực hiện hành động này',
        required: requiredPrivileges,
        current: userPrivileges
      })
    }
    
    next()
  }
}

export { hasPrivilege, hasAnyPrivilege, isAdmin }
