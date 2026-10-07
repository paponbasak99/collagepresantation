import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { bookAppointmentAtomic } from '../services/bookingService.js';
import { generateSlotsForDoctorDate } from '../services/slotService.js';
import QRCode from 'qrcode';
import { z } from 'zod';

const walkInSchema = z.object({
  doctorId: z.number().int().positive(),
  slotId: z.number().int().positive().optional(),
  patientName: z.string().min(2),
  patientPhone: z.string().min(10),
  patientAge: z.number().int().min(1).max(120),
  patientGender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  reasonForVisit: z.string().min(2),
  collectCashNow: z.boolean().default(true)
});

export function getDoctorsToday(req, res, next) {
  try {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const dayOfWeek = new Date().getDay();

    const doctors = db.prepare(`
      SELECT 
        d.id as doctor_id, d.chamber_address, d.consultation_fee,
        u.name as doctor_name, u.phone as doctor_phone, u.avatar_url as doctor_avatar,
        s.name_en as specialty,
        h.name_en as hospital_name,
        ds.start_time, ds.end_time,
        (
          SELECT COUNT(*) FROM appointments 
          WHERE doctor_id = d.id AND date = ? AND status IN ('CONFIRMED', 'ARRIVED')
        ) as waiting_count,
        (
          SELECT serial_number FROM appointments 
          WHERE doctor_id = d.id AND date = ? AND status = 'IN_CONSULTATION'
          LIMIT 1
        ) as active_serial
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      JOIN doctor_schedules ds ON ds.doctor_id = d.id AND ds.day_of_week = ? AND ds.is_active = 1
      WHERE d.status = 'APPROVED'
        AND NOT EXISTS (
          SELECT 1 FROM doctor_leaves dl WHERE dl.doctor_id = d.id AND dl.leave_date = ?
        )
      ORDER BY u.name ASC
    `).all(today, today, dayOfWeek, today);

    return res.json({
      success: true,
      date: today,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
}

export function getClinicQueue(req, res, next) {
  try {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    const { doctorId, status } = req.query;

    let query = `
      SELECT 
        a.*,
        u.name as doctor_name, d.chamber_address,
        p.status as payment_status, p.method as payment_method, p.amount as payment_amount
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.date = ?
    `;

    const params = [today];

    if (doctorId) {
      query += ` AND a.doctor_id = ?`;
      params.push(Number(doctorId));
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.serial_number ASC`;

    const queue = db.prepare(query).all(...params);

    return res.json({
      success: true,
      date: today,
      count: queue.length,
      data: queue
    });
  } catch (error) {
    next(error);
  }
}

export function markPatientArrived(req, res, next) {
  try {
    const db = getDb();
    const appointmentId = Number(req.params.appointmentId);

    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
    if (!apt) throw new AppError('Appointment not found.', 404);

    db.prepare(`
      UPDATE appointments 
      SET status = 'ARRIVED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(appointmentId);

    return res.json({
      success: true,
      message: 'Patient marked as arrived at the clinic reception.'
    });
  } catch (error) {
    next(error);
  }
}

export function collectCashPayment(req, res, next) {
  try {
    const db = getDb();
    const appointmentId = Number(req.params.appointmentId);

    const payment = db.prepare('SELECT * FROM payments WHERE appointment_id = ?').get(appointmentId);
    if (!payment) throw new AppError('Payment record not found.', 404);

    if (payment.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been collected.'
      });
    }

    db.prepare(`
      UPDATE payments 
      SET status = 'PAID', 
          transaction_ref = COALESCE(transaction_ref, 'CASH-REC-' || ?),
          payment_date = CURRENT_TIMESTAMP
      WHERE appointment_id = ?
    `).run(Date.now().toString().slice(-6), appointmentId);

    return res.json({
      success: true,
      message: 'Cash payment collected and receipt confirmed.'
    });
  } catch (error) {
    next(error);
  }
}

export async function walkInBooking(req, res, next) {
  try {
    const validated = walkInSchema.parse(req.body);
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);

    let targetSlotId = validated.slotId;

    // Ensure slots are generated for today
    generateSlotsForDoctorDate(validated.doctorId, today);

    // If slot not explicitly chosen, pick earliest available slot for doctor today
    if (!targetSlotId) {
      const slot = db.prepare(`
        SELECT id FROM time_slots 
        WHERE doctor_id = ? AND date = ? AND status = 'AVAILABLE'
        ORDER BY start_time ASC
        LIMIT 1
      `).get(validated.doctorId, today);

      if (!slot) {
        throw new AppError('No available time slots for this doctor today.', 400);
      }
      targetSlotId = slot.id;
    }

    // Book appointment using staff credentials
    const appointment = bookAppointmentAtomic({
      userId: req.user.id,
      userRole: 'receptionist',
      slotId: targetSlotId,
      patientType: 'SELF',
      patientName: validated.patientName,
      patientPhone: validated.patientPhone,
      patientAge: validated.patientAge,
      patientGender: validated.patientGender,
      reasonForVisit: validated.reasonForVisit,
      paymentMethod: 'CASH_AT_CLINIC'
    });

    // If cash collected on the spot, mark payment as PAID
    if (validated.collectCashNow) {
      db.prepare(`
        UPDATE payments 
        SET status = 'PAID',
            transaction_ref = 'CASH-WALK-' || ?,
            payment_date = CURRENT_TIMESTAMP
        WHERE appointment_id = ?
      `).run(Date.now().toString().slice(-6), appointment.id);

      db.prepare(`
        UPDATE appointments SET status = 'ARRIVED' WHERE id = ?
      `).run(appointment.id);

      appointment.status = 'ARRIVED';
      appointment.payment_status = 'PAID';
    }

    // Generate QR Code Data URL
    const protocol = req.protocol;
    const host = req.get('host');
    const qrDataUrl = await QRCode.toDataURL(
      `${protocol}://${host}/verify-slip.html?number=${appointment.appointment_number}`,
      { width: 180, margin: 1 }
    );

    return res.status(201).json({
      success: true,
      message: 'Walk-in appointment created and serial generated.',
      data: {
        ...appointment,
        serial_badge: `SL - ${String(appointment.serial_number).padStart(2, '0')}`,
        qr_code_data_url: qrDataUrl
      }
    });
  } catch (error) {
    next(error);
  }
}
