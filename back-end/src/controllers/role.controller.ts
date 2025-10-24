import { Request, Response, NextFunction } from 'express'
import * as roleService from '~/services/role.service'
import { getEventLogsCollection } from '~/models/event-log.model'
import { getUsersCollection } from '~/models/user.model'

export const createRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await roleService.createRole(req.body)
    const logs = getEventLogsCollection()
    const userId = (req as any).authUserId
    //event log
      const users = getUsersCollection()
      const actor = userId ? await users.findOne({ _id: userId } as any) : null
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await logs.insertOne({ operator: { id: userId, name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'create_role', details: `Created role ${created.code}`, timestamp: new Date() } as any)

    return res.status(200).json({ message: 'Role created successfully', data: created })
  } catch (err) {
    next(err)
  }
}

export const updateRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id: string }).id
    const updated = await roleService.updateRole(id, req.body)
    const logs = getEventLogsCollection()
    const userId = (req as any).authUserId
    //event log
      const users = getUsersCollection()
      const actor = userId ? await users.findOne({ _id: userId } as any) : null
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await logs.insertOne({ operator: { id: userId, name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'update_role', details: `Updated role ${updated.code}`, timestamp: new Date() } as any)

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
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    })
    if (data.pagination.total === 0) {
      return res.status(200).json({ message: 'No Data', data: [], pagination: data.pagination })
    }
    return res.status(200).json({ message: 'Get roles successfully', data: data.roles, pagination: data.pagination })
  } catch (err) {
    next(err)
  }
}


export const deleteRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (req.params as { id?: string }).id
    if (!id) return res.status(400).json({ message: 'Role id is required' })

    const deleted = await roleService.deleteRole(id)

    const logs = getEventLogsCollection()
    const userId = (req as any).authUserId
    //event log
      const users = getUsersCollection()
      const actor = userId ? await users.findOne({ _id: userId } as any) : null
      const roleCol = (await import('~/models/role.model')).getRolesCollection()
      const roleDoc = actor?.roleId ? await roleCol.findOne({ _id: actor.roleId } as any) : null
      await logs.insertOne({ operator: { id: userId, name: actor?.fullName || '', role: roleDoc?.code || '' }, action: 'delete_role', details: `Deleted role ${deleted.code}`, timestamp: new Date() } as any)


    return res.status(200).json({ message: 'Role deleted successfully', data: deleted })
  } catch (err) {
    next(err)
  }
}




