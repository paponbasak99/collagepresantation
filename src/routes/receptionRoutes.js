import { Router } from 'express';
import {
  getDoctorsToday,
  getClinicQueue,
  markPatientArrived,
  collectCashPayment,
  walkInBooking
} from '../controllers/receptionController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('receptionist', 'admin'));

router.get('/doctors-today', getDoctorsToday);
router.get('/queue', getClinicQueue);
router.put('/queue/:appointmentId/arrive', markPatientArrived);
router.put('/queue/:appointmentId/collect-cash', collectCashPayment);
router.post('/walk-in', walkInBooking);

export default router;
