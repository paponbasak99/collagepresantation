import { joinWaitlist, getUserWaitlist } from '../services/waitlistService.js';
import { getDb } from '../db/connection.js';
import { z } from 'zod';

const joinWaitlistSchema = z.object({
  doctorId: z.number().int().positive(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

export function handleJoinWaitlist(req, res, next) {
  try {
    const validated = joinWaitlistSchema.parse(req.body);
    const result = joinWaitlist({
      userId: req.user.id,
      doctorId: validated.doctorId,
      preferredDate: validated.preferredDate
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export function handleGetMyWaitlist(req, res, next) {
  try {
    const list = getUserWaitlist(req.user.id);
    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    next(error);
  }
}

export function handleLeaveWaitlist(req, res, next) {
  try {
    const id = Number(req.params.id);
    const db = getDb();
    db.prepare('DELETE FROM waitlist WHERE id = ? AND user_id = ?').run(id, req.user.id);

    return res.json({
      success: true,
      message: 'Removed from waitlist.'
    });
  } catch (error) {
    next(error);
  }
}
