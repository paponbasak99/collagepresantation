import { getDb } from '../db/connection.js';
import config from '../config.js';

export function parseSqliteDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.endsWith('Z')) return new Date(dateStr);
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

export function sweepExpiredSlots() {
  const db = getDb();
  const res = db.prepare(`
    UPDATE time_slots 
    SET status = 'AVAILABLE', held_by_user_id = NULL, held_until = NULL
    WHERE status = 'HELD' AND held_until < datetime('now')
  `).run();
  return res.changes;
}

export function generateSlotsForDoctorDate(doctorId, dateStr) {
  const db = getDb();
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();

  // Check if doctor on leave
  const leave = db.prepare(`
    SELECT reason FROM doctor_leaves 
    WHERE doctor_id = ? AND leave_date = ?
  `).get(doctorId, dateStr);

  if (leave) {
    return { onLeave: true, leaveReason: leave.reason, slots: [] };
  }

  // Check if slots already exist
  const existingCount = db.prepare(`
    SELECT COUNT(*) as count FROM time_slots 
    WHERE doctor_id = ? AND date = ?
  `).get(doctorId, dateStr).count;

  if (existingCount === 0) {
    // Get active schedule for day of week
    const schedule = db.prepare(`
      SELECT * FROM doctor_schedules 
      WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1
    `).get(doctorId, dayOfWeek);

    if (!schedule) {
      return { onLeave: false, noSchedule: true, slots: [] };
    }

    const slotDuration = schedule.slot_duration_minutes || 15;
    const [startH, startM] = schedule.start_time.split(':').map(Number);
    const [endH, endM] = schedule.end_time.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let breakStartMinutes = null;
    let breakEndMinutes = null;
    if (schedule.break_start && schedule.break_end) {
      const [bsh, bsm] = schedule.break_start.split(':').map(Number);
      const [beh, bem] = schedule.break_end.split(':').map(Number);
      breakStartMinutes = bsh * 60 + bsm;
      breakEndMinutes = beh * 60 + bem;
    }

    const insertSlot = db.prepare(`
      INSERT OR IGNORE INTO time_slots (doctor_id, date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, 'AVAILABLE')
    `);

    let current = startMinutes;
    while (current + slotDuration <= endMinutes) {
      const slotEnd = current + slotDuration;

      const isDuringBreak = breakStartMinutes !== null && 
        (current < breakEndMinutes && slotEnd > breakStartMinutes);

      if (!isDuringBreak) {
        const sHours = Math.floor(current / 60).toString().padStart(2, '0');
        const sMins = (current % 60).toString().padStart(2, '0');
        const eHours = Math.floor(slotEnd / 60).toString().padStart(2, '0');
        const eMins = (slotEnd % 60).toString().padStart(2, '0');

        insertSlot.run(doctorId, dateStr, `${sHours}:${sMins}`, `${eHours}:${eMins}`);
      }

      current = slotEnd;
    }
  }

  // Sweep expired holds
  sweepExpiredSlots();

  // Return slots with effective status
  const slots = db.prepare(`
    SELECT 
      id, doctor_id, date, start_time, end_time, status, held_by_user_id, held_until,
      CASE 
        WHEN status = 'HELD' AND held_until < datetime('now') THEN 'AVAILABLE'
        ELSE status 
      END as effective_status
    FROM time_slots
    WHERE doctor_id = ? AND date = ?
    ORDER BY start_time ASC
  `).all(doctorId, dateStr);

  return { onLeave: false, noSchedule: false, slots };
}

export function holdSlotAtomic(slotId, userId) {
  const db = getDb();

  sweepExpiredSlots();

  const holdTx = db.transaction(() => {
    const slot = db.prepare(`SELECT * FROM time_slots WHERE id = ?`).get(slotId);
    if (!slot) {
      const err = new Error('Time slot does not exist.');
      err.statusCode = 404;
      throw err;
    }

    if (slot.status === 'BOOKED') {
      const err = new Error('This time slot is already booked.');
      err.statusCode = 409;
      throw err;
    }

    const holdDurationMinutes = config.slotHoldMinutes || 5;

    // Atomically claim the slot
    const res = db.prepare(`
      UPDATE time_slots
      SET status = 'HELD',
          held_by_user_id = ?,
          held_until = datetime('now', '+' || ? || ' minutes')
      WHERE id = ? 
        AND (status = 'AVAILABLE' OR (status = 'HELD' AND held_until < datetime('now')))
    `).run(userId, holdDurationMinutes, slotId);

    if (res.changes === 0) {
      const err = new Error('Slot has just been reserved by another patient. Please pick another slot.');
      err.statusCode = 409;
      throw err;
    }

    const updated = db.prepare(`
      SELECT ts.*, d.consultation_fee, u.name as doctor_name
      FROM time_slots ts
      JOIN doctors d ON ts.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE ts.id = ?
    `).get(slotId);

    return {
      slot: updated,
      holdSeconds: holdDurationMinutes * 60,
      heldUntil: updated.held_until
    };
  });

  return holdTx();
}

export function releaseSlotHold(slotId, userId) {
  const db = getDb();
  const res = db.prepare(`
    UPDATE time_slots
    SET status = 'AVAILABLE', held_by_user_id = NULL, held_until = NULL
    WHERE id = ? AND held_by_user_id = ? AND status = 'HELD'
  `).run(slotId, userId);

  return res.changes > 0;
}
