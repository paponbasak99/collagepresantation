import { Router } from 'express';
import { getSlots, holdSlot, releaseSlot } from '../controllers/slotController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/doctors/:doctorId/slots', optionalAuth, getSlots);
router.post('/slots/:id/hold', requireAuth, bookingLimiter, holdSlot);
router.post('/slots/:id/release', requireAuth, releaseSlot);

export default router;
