import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const createReviewSchema = z.object({
  appointmentId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default('')
});

export function createReview(req, res, next) {
  try {
    const validated = createReviewSchema.parse(req.body);
    const db = getDb();
    const userId = req.user.id;

    const reviewTx = db.transaction(() => {
      const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(validated.appointmentId);
      if (!apt) throw new AppError('Appointment not found.', 404);

      if (apt.patient_id !== userId) {
        throw new AppError('You can only review your own appointments.', 403);
      }

      if (apt.status !== 'COMPLETED') {
        throw new AppError('Reviews can only be submitted after the appointment has been completed.', 400);
      }

      const existing = db.prepare('SELECT id FROM reviews WHERE appointment_id = ?').get(validated.appointmentId);
      if (existing) {
        throw new AppError('You have already reviewed this appointment.', 409);
      }

      // Insert review
      const revRes = db.prepare(`
        INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `).run(validated.appointmentId, apt.doctor_id, userId, validated.rating, validated.comment);

      // Recalculate doctor rating_avg and rating_count
      const stats = db.prepare(`
        SELECT COUNT(*) as count, AVG(rating) as avg_rating
        FROM reviews WHERE doctor_id = ? AND is_visible = 1
      `).get(apt.doctor_id);

      const avgRating = Math.round((stats.avg_rating || 0) * 10) / 10;
      const count = stats.count || 0;

      db.prepare(`
        UPDATE doctors
        SET rating_avg = ?, rating_count = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(avgRating, count, apt.doctor_id);

      return { reviewId: revRes.lastInsertRowid, avgRating, count };
    });

    const result = reviewTx();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: result
    });
  } catch (error) {
    next(error);
  }
}
