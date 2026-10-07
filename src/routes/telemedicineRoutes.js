import express from 'express';
import {
  getTelemedicineSession,
  sendSignal,
  pullSignals
} from '../controllers/telemedicineController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/session/:appointmentId', getTelemedicineSession);
router.post('/signal/:appointmentId', sendSignal);
router.get('/signal/:appointmentId', pullSignals);

export default router;
