import { Router } from 'express';
import { createPrescription, getPrescriptionById, getPrescriptionByAppointment, getPatientPrescriptions } from '../controllers/prescriptionController.js';
import { requireAuth, requireRole, canAccessMedicalData } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('doctor'), createPrescription);
router.get('/appointment/:appointmentId', requireAuth, getPrescriptionByAppointment);
router.get('/:id(\\d+)', requireAuth, getPrescriptionById);
router.get('/patient/:patientId', requireAuth, (req, res, next) => {
  canAccessMedicalData(req.params.patientId)(req, res, next);
}, getPatientPrescriptions);

export default router;
