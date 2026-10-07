import { Router } from 'express';
import { handleJoinWaitlist, handleGetMyWaitlist, handleLeaveWaitlist } from '../controllers/waitlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', handleJoinWaitlist);
router.get('/my', handleGetMyWaitlist);
router.delete('/:id', handleLeaveWaitlist);

export default router;
