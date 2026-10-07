import { getDb } from '../db/connection.js';

/**
 * Adds a patient to the waitlist for a specific doctor and date.
 */
export function joinWaitlist({ userId, doctorId, preferredDate }) {
  const db = getDb();

  // Verify doctor exists
  const doc = db.prepare(`
    SELECT d.id, u.name as doctor_name 
    FROM doctors d 
    JOIN users u ON d.user_id = u.id 
    WHERE d.id = ?
  `).get(doctorId);

  if (!doc) {
    const err = new Error('Doctor not found.');
    err.statusCode = 404;
    throw err;
  }

  // Check if already on waitlist
  const existing = db.prepare(`
    SELECT * FROM waitlist 
    WHERE user_id = ? AND doctor_id = ? AND preferred_date = ? AND status = 'WAITING'
  `).get(userId, doctorId, preferredDate);

  if (existing) {
    return {
      success: true,
      message: 'You are already on the active waitlist for this doctor and date.',
      waitlistId: existing.id
    };
  }

  const res = db.prepare(`
    INSERT INTO waitlist (user_id, doctor_id, preferred_date, status)
    VALUES (?, ?, ?, 'WAITING')
    ON CONFLICT(user_id, doctor_id, preferred_date) DO UPDATE SET
      status = 'WAITING',
      notified_at = NULL,
      created_at = CURRENT_TIMESTAMP
  `).run(userId, doctorId, preferredDate);

  return {
    success: true,
    message: `You have joined the priority waitlist for ${doc.doctor_name} on ${preferredDate}. You will be alerted the moment any patient cancels!`,
    waitlistId: res.lastInsertRowid
  };
}

/**
 * Notifies the next patient on the waitlist when a slot is freed due to cancellation.
 */
export function notifyWaitlistOnCancellation(doctorId, date, freedSlotTime) {
  const db = getDb();

  // Find oldest waiting patient for this doctor and date
  const candidate = db.prepare(`
    SELECT w.id, w.user_id, u.name as patient_name, u.phone as patient_phone,
           doc_u.name as doctor_name
    FROM waitlist w
    JOIN users u ON w.user_id = u.id
    JOIN doctors d ON w.doctor_id = d.id
    JOIN users doc_u ON d.user_id = doc_u.id
    WHERE w.doctor_id = ? AND w.preferred_date = ? AND w.status = 'WAITING'
    ORDER BY w.created_at ASC
    LIMIT 1
  `).get(doctorId, date);

  if (!candidate) {
    return null;
  }

  // Mark waitlist as notified
  db.prepare(`
    UPDATE waitlist 
    SET status = 'NOTIFIED', notified_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(candidate.id);

  // Insert alert notification
  const alertMsg = `A consultation slot with Dr. ${candidate.doctor_name} on ${date} at ${freedSlotTime || 'chamber'} just opened up due to a cancellation! Book now before it is taken.`;
  
  db.prepare(`
    INSERT INTO notifications (user_id, type, recipient, message, status)
    VALUES (?, 'SMS', ?, ?, 'SENT')
  `).run(candidate.user_id, candidate.patient_phone, alertMsg);

  return {
    patientId: candidate.user_id,
    patientName: candidate.patient_name,
    patientPhone: candidate.patient_phone,
    alertMsg
  };
}

/**
 * Gets user's active waitlist entries.
 */
export function getUserWaitlist(userId) {
  const db = getDb();
  return db.prepare(`
    SELECT 
      w.*,
      u.name as doctor_name, s.name_en as specialty, h.name_en as hospital_name
    FROM waitlist w
    JOIN doctors d ON w.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    JOIN specialties s ON d.specialty_id = s.id
    JOIN hospitals h ON d.hospital_id = h.id
    WHERE w.user_id = ?
    ORDER BY w.preferred_date ASC
  `).all(userId);
}
