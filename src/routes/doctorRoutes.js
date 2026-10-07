import { Router } from 'express';
import { getDoctors, getDoctorById, getDoctorReviews } from '../controllers/doctorController.js';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/reviews', getDoctorReviews);

export default router;
