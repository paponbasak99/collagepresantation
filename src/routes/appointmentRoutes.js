import { Router } from 'express';
import { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment, rescheduleAppointment, getQueuePosition } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

import { getAppointmentSlip, verifyAppointmentSlip } from '../controllers/slipController.js';

const router = Router();

router.post('/book', requireAuth, bookingLimiter, bookAppointment);
router.get('/my', requireAuth, getMyAppointments);
router.get('/verify/:number', verifyAppointmentSlip);
router.get('/:id/slip', requireAuth, getAppointmentSlip);
router.get('/:id/queue-position', requireAuth, getQueuePosition);
router.get('/:id', requireAuth, getAppointmentById);
router.post('/:id/cancel', requireAuth, cancelAppointment);
router.post('/:id/reschedule', requireAuth, rescheduleAppointment);

export default router;
