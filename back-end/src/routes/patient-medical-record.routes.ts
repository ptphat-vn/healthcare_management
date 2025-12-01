import { Router } from 'express'
import { authMiddleware } from '~/middlewares/auth.middleware'
import { privilegeMiddleware } from '~/middlewares/privilege.middleware'
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

router.use(authMiddleware)

router.post(
  '/patient-records',
  privilegeMiddleware(['create_medical_record']),
  validateCreatePatientRecord,
  createPatientRecordController
)

router.get(
  '/patient-records',
  privilegeMiddleware(['view_medical_record']),
  validateSearchPatientRecords,
  getAllPatientRecordsController
)

router.get('/patient-records/:id', privilegeMiddleware(['view_medical_record']), getPatientRecordDetailController)

router.put(
  '/patient-records/:id',
  privilegeMiddleware(['modify_medical_record']),
  validateUpdatePatientRecord,
  updatePatientRecordController
)

router.delete('/patient-records/:id', privilegeMiddleware(['delete_medical_record']), deletePatientRecordController)

// router.post(
//   '/patient-records/:id/clinical-notes',
//   privilegeMiddleware(['add_comment']),
//   validateAddClinicalNote,
//   addClinicalNoteController
// )

export default router
