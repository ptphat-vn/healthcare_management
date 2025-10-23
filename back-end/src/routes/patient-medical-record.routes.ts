import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { roleMiddleware } from '~/middlewares/role.middleware'
import {
  createPatientRecordController,
  updatePatientRecordController,
  deletePatientRecordController,
  getAllPatientRecordsController,
  getPatientRecordDetailController,
  addClinicalNoteController
} from '~/controllers/patient-medical-record.controller'
import {
  validateCreatePatientRecord,
  validateUpdatePatientRecord,
  validateAddClinicalNote,
  validateSearchPatientRecords
} from '~/validations/patient-medical-record.validation'

const router = Router()

const VIEW_PATIENT_RECORDS_ROLES = ['admin', 'manager', 'service', 'lab_user']
const CREATE_PATIENT_RECORDS_ROLES = ['admin', 'manager', 'service', 'lab_user']
const UPDATE_PATIENT_RECORDS_ROLES = ['admin', 'manager', 'lab_user']
const DELETE_PATIENT_RECORDS_ROLES = ['admin']
const ADD_CLINICAL_NOTES_ROLES = ['admin', 'manager', 'lab_user']

router.use(authMiddleware)

router.post(
  '/patient-records',
  roleMiddleware(CREATE_PATIENT_RECORDS_ROLES),
  validateCreatePatientRecord,
  createPatientRecordController
)

router.get(
  '/patient-records',
  roleMiddleware(VIEW_PATIENT_RECORDS_ROLES),
  validateSearchPatientRecords,
  getAllPatientRecordsController
)

router.get('/patient-records/:id', roleMiddleware(VIEW_PATIENT_RECORDS_ROLES), getPatientRecordDetailController)

router.put(
  '/patient-records/:id',
  roleMiddleware(UPDATE_PATIENT_RECORDS_ROLES),
  validateUpdatePatientRecord,
  updatePatientRecordController
)

router.delete('/patient-records/:id', roleMiddleware(DELETE_PATIENT_RECORDS_ROLES), deletePatientRecordController)

router.post(
  '/patient-records/:id/clinical-notes',
  roleMiddleware(ADD_CLINICAL_NOTES_ROLES),
  validateAddClinicalNote,
  addClinicalNoteController
)

export default router
