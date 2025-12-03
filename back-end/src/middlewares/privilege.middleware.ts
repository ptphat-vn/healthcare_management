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
        message: 'You do not have permission to perform this action',
        required: requiredPrivileges,
        current: userPrivileges
      })
    }
    
    next()
  }
}

export { hasPrivilege, hasAnyPrivilege, isAdmin }
