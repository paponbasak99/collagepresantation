import { Router } from 'express';
import { getSpecialties, getHospitals } from '../controllers/catalogController.js';

const router = Router();

router.get('/specialties', getSpecialties);
router.get('/hospitals', getHospitals);

export default router;
