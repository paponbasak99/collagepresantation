import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { notifyWaitlistOnCancellation } from './waitlistService.js';

export function cancelAppointmentAtomic({ appointmentId, userId, userRole, reason }) {
  const db = getDb();

  const cancelTx = db.transaction(() => {
    // 1. Fetch appointment details
    const apt = db.prepare(`
      SELECT a.*, p.status as payment_status, p.amount as payment_amount, p.method as payment_method
      FROM appointments a
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.id = ?
    `).get(appointmentId);

    if (!apt) {
      throw new AppError('Appointment not found.', 404);
    }

    if (apt.status === 'CANCELLED') {
      throw new AppError('This appointment is already cancelled.', 400);
    }

    if (apt.status === 'COMPLETED') {
      throw new AppError('Cannot cancel an appointment that has already been completed.', 400);
    }

    // Permission check
    if (userRole === 'patient' && apt.patient_id !== userId) {
      throw new AppError('Unauthorized: You can only cancel your own appointments.', 403);
    }

    // Calculate time difference between NOW and appointment datetime
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    const now = new Date();
    const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (diffHours >= 24) {
      refundPercentage = 90;
    } else if (diffHours >= 6) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const originalPaid = apt.payment_status === 'PAID' ? apt.fee_amount : 0;
    const refundAmount = Math.round((originalPaid * refundPercentage) / 100);

    // Update appointment status to CANCELLED
    db.prepare(`
      UPDATE appointments
      SET status = 'CANCELLED',
          cancellation_reason = ?,
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reason || 'Cancelled by patient', appointmentId);

    // Update payments table
    if (apt.payment_status === 'PAID') {
      db.prepare(`
        UPDATE payments
        SET status = 'REFUNDED',
            refund_amount = ?,
            refund_percentage = ?,
            refund_reason = ?
        WHERE appointment_id = ?
      `).run(refundAmount, refundPercentage, reason || 'Appointment cancelled', appointmentId);
    } else {
      // Cash at Clinic pending
      db.prepare(`
        UPDATE payments
        SET status = 'FAILED',
            refund_amount = 0,
            refund_percentage = 0,
            refund_reason = 'Cancelled before payment'
        WHERE appointment_id = ?
      `).run(appointmentId);
    }

    // Release the time slot back to AVAILABLE
    db.prepare(`
      UPDATE time_slots
      SET status = 'AVAILABLE',
          held_by_user_id = NULL,
          held_until = NULL
      WHERE id = ?
    `).run(apt.slot_id);

    // Check and alert waitlisted patients
    const notified = notifyWaitlistOnCancellation(apt.doctor_id, apt.date, apt.time);

    return {
      appointmentId,
      status: 'CANCELLED',
      diffHours: Math.round(diffHours * 10) / 10,
      refundPercentage,
      refundAmount,
      originalFee: apt.fee_amount,
      waitlistAlerted: Boolean(notified),
      message: refundPercentage > 0 
        ? `Appointment cancelled. You are eligible for a ${refundPercentage}% refund (৳ ${refundAmount}).`
        : 'Appointment cancelled. As cancellation occurred less than 6 hours before consultation, no refund is applicable.'
    };
  });

  return cancelTx();
}

export function rescheduleAppointmentAtomic({ appointmentId, newSlotId, userId, userRole }) {
  const db = getDb();

  const rescheduleTx = db.transaction(() => {
    const apt = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(appointmentId);
    if (!apt) throw new AppError('Appointment not found.', 404);

    if (apt.status !== 'CONFIRMED') {
      throw new AppError(`Cannot reschedule appointment with status: ${apt.status}`, 400);
    }

    if (userRole === 'patient' && apt.patient_id !== userId) {
      throw new AppError('Unauthorized: You can only reschedule your own appointment.', 403);
    }

    // Must be at least 6 hours before current appointment
    const currentAptTime = new Date(`${apt.date}T${apt.time}`);
    const diffHours = (currentAptTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHours < 6) {
      throw new AppError('Appointments can only be rescheduled at least 6 hours in advance.', 400);
    }

    // Check new slot
    const newSlot = db.prepare(`SELECT * FROM time_slots WHERE id = ?`).get(newSlotId);
    if (!newSlot) throw new AppError('Target time slot not found.', 404);

    if (newSlot.doctor_id !== apt.doctor_id) {
      throw new AppError('You can only reschedule to a slot with the same doctor.', 400);
    }

    if (newSlot.status === 'BOOKED') {
      throw new AppError('The target time slot is already booked.', 409);
    }

    // Release old slot
    db.prepare(`
      UPDATE time_slots 
      SET status = 'AVAILABLE', held_by_user_id = NULL, held_until = NULL 
      WHERE id = ?
    `).run(apt.slot_id);

    // Book new slot
    db.prepare(`
      UPDATE time_slots 
      SET status = 'BOOKED', held_by_user_id = ?, held_until = NULL 
      WHERE id = ?
    `).run(userId, newSlotId);

    // Recalculate serial number for new date
    const serialRow = db.prepare(`
      SELECT COALESCE(MAX(serial_number), 0) + 1 as next_serial
      FROM appointments 
      WHERE doctor_id = ? AND date = ?
    `).get(newSlot.doctor_id, newSlot.date);

    const newSerial = serialRow.next_serial;

    // Update appointment
    db.prepare(`
      UPDATE appointments 
      SET slot_id = ?, date = ?, time = ?, serial_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newSlotId, newSlot.date, newSlot.start_time, newSerial, appointmentId);

    return {
      appointmentId,
      newDate: newSlot.date,
      newTime: newSlot.start_time,
      newSerial,
      message: 'Appointment successfully rescheduled.'
    };
  });

  return rescheduleTx();
}
