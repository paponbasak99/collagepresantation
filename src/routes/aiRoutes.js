import { Router } from 'express';
import { handleSymptomCheck } from '../controllers/symptomCheckerController.js';

const router = Router();

router.post('/symptom-checker', handleSymptomCheck);

export default router;
