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
  privilegeMiddleware(['create_test_order']),
  validateCreatePatientRecord,
  createPatientRecordController
)

router.get(
  '/patient-records',
  privilegeMiddleware(['read_only']),
  validateSearchPatientRecords,
  getAllPatientRecordsController
)

router.get('/patient-records/:id', privilegeMiddleware(['read_only']), getPatientRecordDetailController)

router.put(
  '/patient-records/:id',
  privilegeMiddleware(['modify_test_order']),
  validateUpdatePatientRecord,
  updatePatientRecordController
)

router.delete('/patient-records/:id', privilegeMiddleware(['delete_test_order']), deletePatientRecordController)

router.post(
  '/patient-records/:id/clinical-notes',
  privilegeMiddleware(['add_comment']),
  validateAddClinicalNote,
  addClinicalNoteController
)

export default router
