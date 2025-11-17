import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as userService from '~/services/user.service'
import { getUsersCollection } from '~/models/user.model'
import cloudinary from '~/configs/cloundinary.config'
import fs from 'fs'
import { ObjectId } from 'mongodb'
export const updateUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'address',
      'email',
      'phoneNumber',
      'identifyNumber',
      'roleId',
      'status'
    ] as const
    const updatePayload: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in req.body) updatePayload[key] = (req.body as any)[key]
    }
    if (Object.keys(updatePayload).length === 0) {
      throw new HttpError(422, MESSAGES.VALIDATION_ERROR)
    }
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const data = await userService.updateUser((req.params as { id: string }).id, updatePayload, authUserId)
    return res.status(200).json({ message: 'User updated successfully', data })
  } catch (err) {
    next(err)
  }
}

export const updateUserStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const data = await userService.updateUserStatus(
      (req.params as { id: string }).id,
      (req.body as { status: 0 | 1 | 2 }).status,
      authUserId
    )
    return res.status(200).json({ message: 'User status updated', data })
  } catch (err) {
    next(err)
  }
}

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const data = await userService.deleteUser((req.params as { id: string }).id, authUserId)
    return res.status(200).json({ message: 'User deleted (status=0)', data })
  } catch (err) {
    next(err)
  }
}

export const blockUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId ? (req as any).authUserId.toString() : undefined
    const data = await userService.blockUser((req.params as { id: string }).id, authUserId)
    return res.status(200).json({ message: 'User blocked (status=2)', data })
  } catch (err) {
    next(err)
  }
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = {
      search: req.query.search as string,
      status: req.query.status ? parseInt(req.query.status as string) : undefined,
      sortBy: req.query.sortBy as 'fullName' | 'email' | 'createdAt' | 'updatedAt',
      sortOrder: req.query.sortOrder ? (parseInt(req.query.sortOrder as string) as 1 | -1) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    }

    const data = await userService.listUsers(params)
    return res.status(200).json({
      message: MESSAGES.GET_USERS_SUCCESS,
      data: {
        user: data.users,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getUserDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getUserDetail((req.params as { id: string }).id)
    return res.status(200).json({ message: MESSAGES.GET_USER_DETAIL_SUCCESS, data })
  } catch (err) {
    next(err)
  }
}

export const updateUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const allowedFields = ['fullName', 'dateOfBirth', 'age', 'gender', 'address', 'email', 'phoneNumber'] as const
    const updatePayload: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in req.body) updatePayload[key] = (req.body as any)[key]
    }
    if (Object.keys(updatePayload).length === 0) {
      throw new HttpError(422, MESSAGES.VALIDATION_ERROR)
    }

    const data = await userService.updateUser(authUserId.toString(), updatePayload, authUserId.toString())
    return res.status(200).json({ message: 'Profile updated successfully', data })
  } catch (err) {
    next(err)
  }
}

export const uploadAvatarController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy userId từ authenticated user (không dùng params)
    const authUserId = (req as any).authUserId
    if (!authUserId) {
      throw new HttpError(401, MESSAGES.UNAUTHORIZED)
    }

    const file = req.file
    if (!file) {
      throw new HttpError(400, 'No file uploaded!')
    }

    const user = await getUsersCollection().findOne({ _id: new ObjectId(authUserId) })
    if (!user) {
      throw new HttpError(404, 'User not found')
    }

    // Xóa avatar cũ nếu có
    if (user.avatarPublicId) {
      await userService.deleteFromCloudinary(user.avatarPublicId)
    }

    // Upload avatar mới lên Cloudinary
    const { url, public_id } = await userService.uploadToCloudinary(file.buffer, 'avatars')

    // Update user avatar trong database
    await getUsersCollection().updateOne(
      { _id: new ObjectId(authUserId) },
      {
        $set: {
          avatar: url,
          avatarPublicId: public_id,
          updatedAt: new Date()
        }
      }
    )

    return res.status(200).json({
      message: 'Avatar updated successfully',
      data: {
        avatar: url,
        avatarPublicId: public_id
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getAllLabUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || undefined
    const status = req.query.status ? parseInt(req.query.status as string) : 1
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50

    const data = await userService.listUsersByRoleCodes({
      search,
      status,
      page,
      limit,
      roleCodes: ['doctor', 'consultant', 'lab_user']
    })

    const safe = data.users.map((u: any) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      avatar: u.avatar,
      roleCode: u.roleCode,
      status: u.status
    }))

    return res.status(200).json({ message: 'Lab users fetched', data: { user: safe, pagination: data.pagination } })
  } catch (err) {
    next(err)
  }
}

export const getAllPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || undefined
    const status = req.query.status ? parseInt(req.query.status as string) : 1
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50

    const data = await userService.listUsersByRoleCodes({
      search,
      status,
      page,
      limit,
      roleCodes: ['patient']
    })

    const safe = data.users.map((u: any) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      avatar: u.avatar,
      roleCode: u.roleCode,
      status: u.status
    }))

    return res.status(200).json({ message: 'Patients fetched', data: { user: safe, pagination: data.pagination } })
  } catch (err) {
    next(err)
  }
}
