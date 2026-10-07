import { analyzeSymptoms } from '../services/symptomCheckerService.js';
import { z } from 'zod';

const symptomSchema = z.object({
  symptoms: z.string().min(2, 'Please enter at least 2 characters describing your symptoms.').max(1000)
});

export function handleSymptomCheck(req, res, next) {
  try {
    const validated = symptomSchema.parse(req.body);
    const result = analyzeSymptoms(validated.symptoms);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
