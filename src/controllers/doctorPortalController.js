import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { broadcastQueueEvent } from '../services/sseService.js';

const updateStatusSchema = z.object({
  status: z.enum(['ARRIVED', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CONFIRMED'])
});

const updateScheduleSchema = z.object({
  schedules: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotDurationMinutes: z.number().int().min(5).max(60).default(15),
    breakStart: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
    breakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
    isActive: z.boolean().default(true)
  }))
});

const leaveSchema = z.object({
  leaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(255).optional().default('Personal leave')
});

function getDoctorRecord(userId) {
  const db = getDb();
  const doctor = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(userId);
  if (!doctor) {
    throw new AppError('Doctor record not found for this account.', 404);
  }
  return doctor;
}

export function getTodayQueue(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const db = getDb();
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const { status } = req.query;

    let query = `
      SELECT 
        a.*,
        p.status as payment_status, p.method as payment_method, p.amount as payment_amount,
        (SELECT id FROM prescriptions WHERE appointment_id = a.id) as prescription_id
      FROM appointments a
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.doctor_id = ? AND a.date = ?
    `;

    const params = [doctor.id, dateStr];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.serial_number ASC`;

    const queue = db.prepare(query).all(...params);

    // Summary counts
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ARRIVED' THEN 1 ELSE 0 END) as arrived_count,
        SUM(CASE WHEN status = 'IN_CONSULTATION' THEN 1 ELSE 0 END) as in_consultation_count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show_count,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as waiting_count
      FROM appointments
      WHERE doctor_id = ? AND date = ?
    `).get(doctor.id, dateStr);

    return res.json({
      success: true,
      date: dateStr,
      doctor: {
        id: doctor.id,
        status: doctor.status,
        consultation_fee: doctor.consultation_fee
      },
      stats,
      count: queue.length,
      data: queue
    });
  } catch (error) {
    next(error);
  }
}

export function updateQueueStatus(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const appointmentId = Number(req.params.appointmentId);
    const validated = updateStatusSchema.parse(req.body);
    const db = getDb();

    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    if (!apt) throw new AppError('Appointment not found.', 404);

    if (apt.doctor_id !== doctor.id && req.user.role !== 'admin' && req.user.role !== 'receptionist') {
      throw new AppError('Unauthorized: You can only update appointments in your own clinic queue.', 403);
    }

    db.prepare(`
      UPDATE appointments 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(validated.status, appointmentId);

    // Real-time SSE broadcast
    try {
      broadcastQueueEvent({
        doctorId: apt.doctor_id,
        eventType: validated.status === 'IN_CONSULTATION' ? 'TOKEN_CALLED' : 'QUEUE_UPDATED',
        data: {
          appointmentId,
          serialNumber: apt.serial_number,
          appointmentNumber: apt.appointment_number,
          status: validated.status,
          patientName: apt.patient_name
        }
      });
    } catch (_) {}

    return res.json({
      success: true,
      message: `Patient status updated to ${validated.status}.`,
      data: { appointmentId, status: validated.status }
    });
  } catch (error) {
    next(error);
  }
}

export function getDoctorSchedule(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const db = getDb();

    const schedules = db.prepare(`
      SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week ASC
    `).all(doctor.id);

    const leaves = db.prepare(`
      SELECT * FROM doctor_leaves WHERE doctor_id = ? AND leave_date >= date('now') ORDER BY leave_date ASC
    `).all(doctor.id);

    return res.json({
      success: true,
      data: {
        schedules,
        leaves
      }
    });
  } catch (error) {
    next(error);
  }
}

export function updateDoctorSchedule(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const validated = updateScheduleSchema.parse(req.body);
    const db = getDb();

    const updateTx = db.transaction(() => {
      // Upsert schedules
      const upsertStmt = db.prepare(`
        INSERT INTO doctor_schedules (
          doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start, break_end, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(doctor_id, day_of_week) DO UPDATE SET
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          slot_duration_minutes = excluded.slot_duration_minutes,
          break_start = excluded.break_start,
          break_end = excluded.break_end,
          is_active = excluded.is_active
      `);

      for (const s of validated.schedules) {
        upsertStmt.run(
          doctor.id, s.dayOfWeek, s.startTime, s.endTime, s.slotDurationMinutes,
          s.breakStart || null, s.breakEnd || null, s.isActive ? 1 : 0
        );
      }
    });

    updateTx();

    return res.json({
      success: true,
      message: 'Doctor weekly schedule successfully updated.'
    });
  } catch (error) {
    next(error);
  }
}

export function addDoctorLeave(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const validated = leaveSchema.parse(req.body);
    const db = getDb();

    db.prepare(`
      INSERT OR REPLACE INTO doctor_leaves (doctor_id, leave_date, reason)
      VALUES (?, ?, ?)
    `).run(doctor.id, validated.leaveDate, validated.reason);

    return res.status(201).json({
      success: true,
      message: `Leave successfully scheduled for ${validated.leaveDate}.`
    });
  } catch (error) {
    next(error);
  }
}

export function deleteDoctorLeave(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const leaveId = Number(req.params.id);
    const db = getDb();

    db.prepare('DELETE FROM doctor_leaves WHERE id = ? AND doctor_id = ?').run(leaveId, doctor.id);

    return res.json({
      success: true,
      message: 'Leave day removed.'
    });
  } catch (error) {
    next(error);
  }
}

export function getDoctorEarnings(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const db = getDb();

    // Today's earnings
    const today = new Date().toISOString().slice(0, 10);
    const todayStats = db.prepare(`
      SELECT 
        COUNT(*) as total_patients,
        COALESCE(SUM(fee_amount), 0) as total_revenue
      FROM appointments
      WHERE doctor_id = ? AND date = ? AND status = 'COMPLETED'
    `).get(doctor.id, today);

    // Last 30 days
    const monthlyStats = db.prepare(`
      SELECT 
        COUNT(*) as total_patients,
        COALESCE(SUM(fee_amount), 0) as total_revenue
      FROM appointments
      WHERE doctor_id = ? AND date >= date('now', '-30 days') AND status = 'COMPLETED'
    `).get(doctor.id);

    // All time
    const allTimeStats = db.prepare(`
      SELECT 
        COUNT(*) as total_patients,
        COALESCE(SUM(fee_amount), 0) as total_revenue
      FROM appointments
      WHERE doctor_id = ? AND status = 'COMPLETED'
    `).get(doctor.id);

    // Daily breakdown for last 7 days
    const dailyBreakdown = db.prepare(`
      SELECT 
        date,
        COUNT(*) as patients_count,
        COALESCE(SUM(fee_amount), 0) as daily_revenue
      FROM appointments
      WHERE doctor_id = ? AND date >= date('now', '-7 days') AND status = 'COMPLETED'
      GROUP BY date
      ORDER BY date ASC
    `).all(doctor.id);

    return res.json({
      success: true,
      data: {
        today: todayStats,
        monthly: monthlyStats,
        allTime: allTimeStats,
        dailyBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
}

const delaySchema = z.object({
  delayMinutes: z.number().int().min(0).max(360),
  message: z.string().min(1).max(500)
});

export function broadcastChamberDelay(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const { delayMinutes, message } = delaySchema.parse(req.body);
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    // Mark previous active broadcasts as RESOLVED
    db.prepare(`
      UPDATE doctor_broadcasts SET status = 'RESOLVED'
      WHERE doctor_id = ? AND broadcast_date = ? AND status = 'ACTIVE'
    `).run(doctor.id, today);

    // Insert new broadcast
    const result = db.prepare(`
      INSERT INTO doctor_broadcasts (doctor_id, broadcast_date, delay_minutes, message, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `).run(doctor.id, today, delayMinutes, message);

    // Notify all today's booked patients
    const bookedPatients = db.prepare(`
      SELECT patient_id, patient_phone, serial_number FROM appointments
      WHERE doctor_id = ? AND date = ? AND status IN ('CONFIRMED', 'ARRIVED')
    `).all(doctor.id, today);

    const alertMsg = `Chamber Notice: Your doctor is delayed by ${delayMinutes} mins. Note: ${message}`;
    for (const p of bookedPatients) {
      db.prepare(`
        INSERT INTO notifications (user_id, type, recipient, message, status)
        VALUES (?, 'SMS', ?, ?, 'SENT')
      `).run(p.patient_id, p.patient_phone, alertMsg);
    }

    // Broadcast SSE to all live clients
    try {
      broadcastQueueEvent({
        doctorId: doctor.id,
        eventType: 'DELAY_BROADCAST',
        data: {
          broadcastId: Number(result.lastInsertRowid),
          delayMinutes,
          message,
          today
        }
      });
    } catch (_) {}

    res.json({
      success: true,
      message: `Delay broadcast published and ${bookedPatients.length} patients notified.`,
      data: { broadcastId: Number(result.lastInsertRowid), delayMinutes, message, notifiedCount: bookedPatients.length }
    });
  } catch (err) {
    next(err);
  }
}

export function getActiveBroadcast(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const broadcast = db.prepare(`
      SELECT * FROM doctor_broadcasts
      WHERE doctor_id = ? AND broadcast_date = ? AND status = 'ACTIVE'
      ORDER BY id DESC LIMIT 1
    `).get(doctor.id, today);

    res.json({
      success: true,
      data: broadcast || null
    });
  } catch (err) {
    next(err);
  }
}

export function resolveBroadcast(req, res, next) {
  try {
    const doctor = getDoctorRecord(req.user.id);
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE doctor_broadcasts SET status = 'RESOLVED'
      WHERE doctor_id = ? AND broadcast_date = ? AND status = 'ACTIVE'
    `).run(doctor.id, today);

    try {
      broadcastQueueEvent({
        doctorId: doctor.id,
        eventType: 'DELAY_RESOLVED',
        data: { doctorId: doctor.id }
      });
    } catch (_) {}

    res.json({
      success: true,
      message: 'Chamber delay broadcast resolved.'
    });
  } catch (err) {
    next(err);
  }
}

