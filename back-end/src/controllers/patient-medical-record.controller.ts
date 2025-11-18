import { Request, Response, NextFunction } from 'express'
import { HttpError } from '~/models/error.model'
import { MESSAGES } from '~/constants/message.constant'
import * as patientService from '~/services/patient-medical-record.service'

export const createPatientRecordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const data = await patientService.createPatientRecord(req.body, authUserId.toString())
    return res.status(201).json({ 
      success: 'success',
      message: 'Patient medical record created successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
}

export const updatePatientRecordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const id = (req.params as { id: string }).id
    const data = await patientService.updatePatientRecord(id, req.body, authUserId.toString(), authUserRole)
    return res.status(200).json({ 
      success: 'success',
      message: 'Patient medical record updated successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
}

export const deletePatientRecordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const id = (req.params as { id: string }).id
    const data = await patientService.deletePatientRecord(id, authUserId.toString(), authUserRole)
    return res.status(200).json({ 
      success: 'success',
      message: 'Patient medical record deleted successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
}

export const getAllPatientRecordsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole

    const params = {
      search: req.query.search as string,
      gender: req.query.gender as 'male' | 'female',
      dateOfBirthFrom: req.query.dateOfBirthFrom as string,
      dateOfBirthTo: req.query.dateOfBirthTo as string,
      testType: req.query.testType as string,
      instrumentUsed: req.query.instrumentUsed as string,
      dateRangeFrom: req.query.dateRangeFrom as string,
      dateRangeTo: req.query.dateRangeTo as string,
      sortBy: req.query.sortBy as 'fullName' | 'email' | 'createdAt' | 'lastTestDate',
      sortOrder: req.query.sortOrder ? parseInt(req.query.sortOrder as string) as 1 | -1 : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      authUserId: authUserId ? authUserId.toString() : undefined,
      authUserRole: authUserRole
    }

    const data = await patientService.listPatientRecords(params)
    
    if (data.patients.length === 0) {
      return res.status(200).json({ 
        success: 'success',
        message: 'No patient records found', 
        data: {
          patient: [],
          pagination: data.pagination
        }
      })
    }
    
    return res.status(200).json({ 
      success: 'success',
      message: 'Patient records retrieved successfully', 
      data: {
        patient: data.patients,
        pagination: data.pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getPatientRecordDetailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole
    const id = (req.params as { id: string }).id
    const data = await patientService.getPatientRecordDetail(
      id,
      authUserId ? authUserId.toString() : undefined,
      authUserRole
    )
    
    return res.status(200).json({ 
      success: 'success',
      message: 'Patient record details retrieved successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
}

export const addClinicalNoteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUserId = (req as any).authUserId
    const authUserRole = (req as any).authUserRole
    if (!authUserId) throw new HttpError(401, MESSAGES.UNAUTHORIZED)

    const id = (req.params as { id: string }).id
    const data = await patientService.addClinicalNote(id, req.body, authUserId.toString(), authUserRole)
    return res.status(200).json({ 
      success: 'success',
      message: 'Clinical note added successfully', 
      data 
    })
  } catch (err) {
    next(err)
  }
}
