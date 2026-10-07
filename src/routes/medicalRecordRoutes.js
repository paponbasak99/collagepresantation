import express from 'express';
import {
  uploadMedicalRecord,
  getMyMedicalRecords,
  getMedicalRecordById,
  getPatientRecordsForDoctor,
  deleteMedicalRecord
} from '../controllers/medicalRecordController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Patient Vault routes
router.post('/upload', uploadMedicalRecord);
router.get('/my', getMyMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.delete('/:id', deleteMedicalRecord);

// Doctor viewing patient vault
router.get('/patient/:patientId', requireRole('doctor', 'admin'), getPatientRecordsForDoctor);

export default router;
