import { Request, Response, NextFunction } from 'express'
import * as roleService from '~/services/role/role.service'

export const createRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const created = await roleService.createRole(req.body, authUserId)

    return res.status(200).json({ message: 'Role created successfully', data: created })
  } catch (err) {
    next(err)
  }
}

export const updateRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const updated = await roleService.updateRole(id, req.body, authUserId)

    return res.status(200).json({ message: 'Role updated successfully', data: updated })
  } catch (err) {
    next(err)
  }
}

export const listRolesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.listRoles({
      search: req.query.search as string,
      sortBy: (req.query.sortBy as any) || 'name',
      sortOrder: (req.query.sortOrder ? Number(req.query.sortOrder) : 1) as 1 | -1,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({
        message: 'No Data',
        data: {
          role: [],
          pagination: data.pagination
        }
      })
    }
    return res.status(200).json({
      message: 'Get roles successfully',
      data: {
        role: data.roles,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const deleteRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id?: string }).id
    if (!id) return res.status(400).json({ message: 'Role id is required' })

    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const deleted = await roleService.deleteRole(id, authUserId)


    return res.status(200).json({ message: 'Role deleted successfully', data: deleted })
  } catch (err) {
    next(err)
  }
}
