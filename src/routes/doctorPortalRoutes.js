import { Router } from 'express';
import {
  getTodayQueue,
  updateQueueStatus,
  getDoctorSchedule,
  updateDoctorSchedule,
  addDoctorLeave,
  deleteDoctorLeave,
  getDoctorEarnings,
  broadcastChamberDelay,
  getActiveBroadcast,
  resolveBroadcast
} from '../controllers/doctorPortalController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('doctor', 'admin'));

router.get('/today-queue', getTodayQueue);
router.put('/queue/:appointmentId/status', updateQueueStatus);
router.get('/schedule', getDoctorSchedule);
router.post('/schedule', updateDoctorSchedule);
router.post('/leaves', addDoctorLeave);
router.delete('/leaves/:id', deleteDoctorLeave);
router.get('/earnings', getDoctorEarnings);

// Chamber Delay Broadcasts
router.post('/broadcast-delay', broadcastChamberDelay);
router.get('/broadcast-delay/active', getActiveBroadcast);
router.post('/broadcast-delay/resolve', resolveBroadcast);

export default router;
