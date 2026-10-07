import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { parseSqliteDate } from './slotService.js';

export function bookAppointmentAtomic({
  userId,
  userRole = 'patient',
  slotId,
  patientType,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  patientRelation,
  reasonForVisit,
  notes,
  isEmergency = false,
  emergencyNotes = null,
  paymentMethod,
  transactionRef = null,
  idempotencyKey = null
}) {
  const db = getDb();

  // Check idempotency first if key provided
  if (idempotencyKey) {
    const existingPayment = db.prepare('SELECT appointment_id FROM payments WHERE idempotency_key = ?').get(idempotencyKey);
    if (existingPayment) {
      const existingApt = db.prepare(`
        SELECT 
          a.*, 
          d.chamber_address, d.qualifications, d.bmdc_reg_no,
          u.name as doctor_name, u.phone as doctor_phone,
          s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
          h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
          h.address_en as hospital_address_en, h.city as hospital_city,
          p.method as payment_method, p.status as payment_status, p.transaction_ref, p.amount as payment_amount
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        JOIN specialties s ON d.specialty_id = s.id
        JOIN hospitals h ON d.hospital_id = h.id
        LEFT JOIN payments p ON p.appointment_id = a.id
        WHERE a.id = ?
      `).get(existingPayment.appointment_id);

      if (existingApt) {
        return existingApt;
      }
    }
  }

  const bookingTx = db.transaction(() => {
    // 1. Fetch slot with row lock
    const slot = db.prepare(`SELECT * FROM time_slots WHERE id = ?`).get(slotId);
    if (!slot) {
      throw new AppError('Time slot not found.', 404);
    }

    if (slot.status === 'BOOKED') {
      throw new AppError('This time slot is already booked by another patient.', 409);
    }

    // If slot was HELD, verify user hold & expiration
    if (slot.status === 'HELD') {
      const heldUntilDate = parseSqliteDate(slot.held_until);
      const nowTime = Date.now();

      if (!heldUntilDate || heldUntilDate.getTime() < nowTime) {
        throw new AppError('Your reservation hold has expired. Please select the slot again.', 409);
      }

      // If patient, must be the holding user
      if (userRole === 'patient' && slot.held_by_user_id !== userId) {
        throw new AppError('This slot is currently reserved by another patient.', 409);
      }
    }

    // 2. Fetch doctor profile and verified consultation fee (NEVER trust frontend)
    const doctor = db.prepare(`
      SELECT d.*, u.name as doctor_name, u.phone as doctor_phone,
             s.name_en as specialty_name_en, h.name_en as hospital_name_en,
             h.address_en as hospital_address_en
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.id = ?
    `).get(slot.doctor_id);

    if (!doctor || doctor.status !== 'APPROVED') {
      throw new AppError('Doctor is not available for appointments.', 400);
    }

    const feeAmount = doctor.consultation_fee;

    // 3. Mark slot as BOOKED
    const slotUpdate = db.prepare(`
      UPDATE time_slots 
      SET status = 'BOOKED', held_by_user_id = ?, held_until = NULL
      WHERE id = ? AND (status = 'AVAILABLE' OR status = 'HELD')
    `).run(userId, slotId);

    if (slotUpdate.changes === 0) {
      throw new AppError('Could not reserve slot. It may have been booked simultaneously.', 409);
    }

    // 4. Compute sequential serial number for doctor on that date
    const serialRow = db.prepare(`
      SELECT COALESCE(MAX(serial_number), 0) + 1 as next_serial
      FROM appointments 
      WHERE doctor_id = ? AND date = ?
    `).get(slot.doctor_id, slot.date);

    const serialNumber = serialRow.next_serial;
    const dateCompact = slot.date.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentNumber = `APT-${dateCompact}-${String(serialNumber).padStart(2, '0')}${randomSuffix}`;

    // 5. Determine payment status
    const isOnlinePayment = paymentMethod === 'BKASH' || paymentMethod === 'NAGAD';
    const paymentStatus = isOnlinePayment ? 'PAID' : 'PENDING';
    const paymentDate = isOnlinePayment ? new Date().toISOString() : null;
    const actualTxRef = transactionRef || (isOnlinePayment ? `TRX-${paymentMethod.slice(0, 2)}-${Date.now().toString().slice(-8)}` : null);

    // 6. Insert Appointment
    const aptRes = db.prepare(`
      INSERT INTO appointments (
        appointment_number, patient_id, doctor_id, slot_id, date, time, serial_number,
        patient_type, patient_name, patient_phone, patient_age, patient_gender, patient_relation,
        reason_for_visit, notes, is_emergency, emergency_notes, status, fee_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointmentNumber, userId, slot.doctor_id, slotId, slot.date, slot.start_time, serialNumber,
      patientType, patientName, patientPhone, patientAge, patientGender, patientRelation || 'Self',
      reasonForVisit, notes || null, isEmergency ? 1 : 0, emergencyNotes || null, 'CONFIRMED', feeAmount
    );

    const appointmentId = aptRes.lastInsertRowid;

    // 7. Insert Payment record with idempotencyKey
    db.prepare(`
      INSERT INTO payments (
        appointment_id, user_id, method, transaction_ref, idempotency_key, amount, status, payment_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      appointmentId, userId, paymentMethod, actualTxRef, idempotencyKey || null, feeAmount, paymentStatus, paymentDate
    );

    // If emergency, send high-priority doctor alert
    if (isEmergency) {
      db.prepare(`
        INSERT INTO notifications (user_id, appointment_id, type, recipient, message, status)
        VALUES (?, ?, 'SYSTEM', ?, ?, 'SENT')
      `).run(
        doctor.user_id, appointmentId, doctor.doctor_phone,
        `🚨 PRIORITY EMERGENCY CASE: Patient ${patientName} (${patientAge}y, ${patientGender}) booked priority slot for ${slot.date} at ${slot.start_time}. Reason: ${reasonForVisit}. Alert note: ${emergencyNotes || 'Emergency clinical triage'}.`
      );
    }

    // 8. Schedule mock notification reminders (24h and 2h before)
    const slotDateTime = new Date(`${slot.date}T${slot.start_time}`);
    const time24hBefore = new Date(slotDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const time2hBefore = new Date(slotDateTime.getTime() - 2 * 60 * 60 * 1000).toISOString();

    const insertNotification = db.prepare(`
      INSERT INTO notifications (user_id, appointment_id, type, recipient, message, status, scheduled_for)
      VALUES (?, ?, ?, ?, ?, 'SENT', ?)
    `);

    insertNotification.run(
      userId, appointmentId, 'SMS', patientPhone,
      `Reminder: Your appointment with ${doctor.doctor_name} is on ${slot.date} at ${slot.start_time}. Serial: SL-${serialNumber}. Chamber: ${doctor.chamber_address}.`,
      time24hBefore
    );

    insertNotification.run(
      userId, appointmentId, 'SMS', patientPhone,
      `Urgent Reminder: Please arrive at ${doctor.hospital_name_en} 15 mins before ${slot.start_time}. Your serial is SL-${serialNumber}.`,
      time2hBefore
    );

    // 9. Fetch full created appointment
    const createdAppointment = db.prepare(`
      SELECT 
        a.*, 
        d.chamber_address, d.qualifications, d.bmdc_reg_no,
        u.name as doctor_name, u.phone as doctor_phone,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en, h.city as hospital_city,
        p.method as payment_method, p.status as payment_status, p.transaction_ref, p.amount as payment_amount
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.id = ?
    `).get(appointmentId);

    return createdAppointment;
  });

  return bookingTx();
}
