import { getDb } from '../db/connection.js';
import { bookAppointmentAtomic } from '../services/bookingService.js';
import { cancelAppointmentAtomic, rescheduleAppointmentAtomic } from '../services/cancellationService.js';
import { bookAppointmentSchema, cancelAppointmentSchema, rescheduleAppointmentSchema } from '../validators/bookingValidators.js';

export function bookAppointment(req, res, next) {
  try {
    const validated = bookAppointmentSchema.parse(req.body);
    const idempotencyKey = req.headers['idempotency-key'] || validated.idempotencyKey || null;

    const appointment = bookAppointmentAtomic({
      userId: req.user.id,
      userRole: req.user.role,
      ...validated,
      idempotencyKey
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}

export function getQueuePosition(req, res, next) {
  try {
    const db = getDb();
    const appointmentId = Number(req.params.id);
    const user = req.user;

    const apt = db.prepare(`
      SELECT 
        a.id, a.appointment_number, a.serial_number, a.status, a.date, a.time,
        a.patient_id, a.doctor_id, a.is_emergency,
        u.name as doctor_name, d.chamber_address
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.id = ?
    `).get(appointmentId);

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Permission check
    const isOwner = apt.patient_id === user.id;
    const isStaff = ['doctor', 'receptionist', 'admin'].includes(user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (apt.status === 'COMPLETED') {
      return res.json({
        success: true,
        data: {
          appointmentId,
          appointmentNumber: apt.appointment_number,
          mySerial: apt.serial_number,
          status: apt.status,
          patientsAhead: 0,
          estimatedWaitMinutes: 0,
          currentServingSerial: apt.serial_number,
          statusMessage: 'Your consultation has been completed. Check prescriptions for medications.'
        }
      });
    }

    if (apt.status === 'CANCELLED') {
      return res.json({
        success: true,
        data: {
          appointmentId,
          appointmentNumber: apt.appointment_number,
          mySerial: apt.serial_number,
          status: apt.status,
          patientsAhead: 0,
          estimatedWaitMinutes: 0,
          statusMessage: 'This appointment was cancelled.'
        }
      });
    }

    // Find serial currently in consultation
    const servingRow = db.prepare(`
      SELECT serial_number FROM appointments 
      WHERE doctor_id = ? AND date = ? AND status = 'IN_CONSULTATION'
      LIMIT 1
    `).get(apt.doctor_id, apt.date);

    const currentServingSerial = servingRow ? servingRow.serial_number : null;

    // Count patients ahead who are still waiting or in consultation
    const aheadRow = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE doctor_id = ? AND date = ? AND serial_number < ?
        AND status IN ('CONFIRMED', 'ARRIVED', 'IN_CONSULTATION')
    `).get(apt.doctor_id, apt.date, apt.serial_number);

    const patientsAhead = aheadRow ? aheadRow.count : 0;
    const estimatedWaitMinutes = patientsAhead * 15; // 15 mins avg

    let statusMessage = '';
    if (apt.status === 'IN_CONSULTATION') {
      statusMessage = 'You are currently inside the chamber with the doctor.';
    } else if (patientsAhead === 0) {
      statusMessage = 'You are next in line! Please wait right outside the chamber door.';
    } else if (patientsAhead === 1) {
      statusMessage = '1 patient before you. Estimated wait: ~15 mins.';
    } else {
      statusMessage = `${patientsAhead} patients before you. Estimated wait: ~${estimatedWaitMinutes} mins.`;
    }

    return res.json({
      success: true,
      data: {
        appointmentId,
        appointmentNumber: apt.appointment_number,
        mySerial: apt.serial_number,
        serialBadge: `SL - ${String(apt.serial_number).padStart(2, '0')}`,
        status: apt.status,
        isEmergency: Boolean(apt.is_emergency),
        currentServingSerial: currentServingSerial ? `SL - ${String(currentServingSerial).padStart(2, '0')}` : 'None',
        patientsAhead,
        estimatedWaitMinutes,
        doctorName: apt.doctor_name,
        chamberAddress: apt.chamber_address,
        statusMessage
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getMyAppointments(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const { status, type } = req.query;

    let query = `
      SELECT 
        a.*,
        d.chamber_address, d.qualifications, d.bmdc_reg_no,
        u.name as doctor_name, u.avatar_url as doctor_avatar,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en,
        p.method as payment_method, p.status as payment_status, p.amount as payment_amount,
        p.refund_amount, p.refund_percentage,
        (SELECT id FROM reviews WHERE appointment_id = a.id) as review_id,
        (SELECT id FROM prescriptions WHERE appointment_id = a.id) as prescription_id
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.patient_id = ?
    `;

    const params = [userId];

    if (type === 'upcoming') {
      query += ` AND a.status IN ('PENDING_PAYMENT', 'CONFIRMED', 'ARRIVED', 'IN_CONSULTATION')`;
    } else if (type === 'completed') {
      query += ` AND a.status = 'COMPLETED'`;
    } else if (type === 'cancelled') {
      query += ` AND a.status = 'CANCELLED'`;
    } else if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.date DESC, a.time DESC`;

    const appointments = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}

export function getAppointmentById(req, res, next) {
  try {
    const db = getDb();
    const appointmentId = Number(req.params.id);
    const user = req.user;

    const apt = db.prepare(`
      SELECT 
        a.*,
        d.chamber_address, d.qualifications, d.bmdc_reg_no,
        u.name as doctor_name, u.phone as doctor_phone, u.avatar_url as doctor_avatar,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en, h.city as hospital_city, h.phone as hospital_phone,
        p.method as payment_method, p.status as payment_status, p.amount as payment_amount,
        p.transaction_ref, p.refund_amount, p.refund_percentage, p.payment_date,
        (SELECT id FROM prescriptions WHERE appointment_id = a.id) as prescription_id
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.id = ?
    `).get(appointmentId);

    if (!apt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    // Access control
    const isOwner = apt.patient_id === user.id;
    const isDoctor = user.role === 'doctor';
    const isReceptionistOrAdmin = user.role === 'receptionist' || user.role === 'admin';

    if (!isOwner && !isDoctor && !isReceptionistOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to appointment details.'
      });
    }

    return res.json({
      success: true,
      data: apt
    });
  } catch (error) {
    next(error);
  }
}

export function cancelAppointment(req, res, next) {
  try {
    const appointmentId = Number(req.params.id);
    const validated = cancelAppointmentSchema.parse(req.body);

    const result = cancelAppointmentAtomic({
      appointmentId,
      userId: req.user.id,
      userRole: req.user.role,
      reason: validated.reason
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

export function rescheduleAppointment(req, res, next) {
  try {
    const appointmentId = Number(req.params.id);
    const validated = rescheduleAppointmentSchema.parse(req.body);

    const result = rescheduleAppointmentAtomic({
      appointmentId,
      newSlotId: validated.newSlotId,
      userId: req.user.id,
      userRole: req.user.role
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}
