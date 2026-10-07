import QRCode from 'qrcode';
import { getDb } from '../db/connection.js';

export async function getAppointmentSlip(req, res, next) {
  try {
    const db = getDb();
    const user = req.user;
    const idParam = req.params.id;
    const isNumeric = /^\d+$/.test(idParam);

    const apt = db.prepare(`
      SELECT 
        a.*,
        d.chamber_address, d.qualifications, d.bmdc_reg_no,
        u.name as doctor_name, u.phone as doctor_phone,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en, h.address_bn as hospital_address_bn,
        h.city as hospital_city, h.phone as hospital_phone,
        p.method as payment_method, p.status as payment_status, p.amount as payment_amount,
        p.transaction_ref, p.payment_date
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE ${isNumeric ? 'a.id = ?' : 'a.appointment_number = ?'}
    `).get(isNumeric ? Number(idParam) : idParam);

    if (!apt) {
      return res.status(404).json({
        success: false,
        message: 'Appointment slip not found.'
      });
    }

    // Access check: owner patient, receptionist, doctor, admin
    const isOwner = apt.patient_id === user.id;
    const isStaff = ['admin', 'receptionist', 'doctor'].includes(user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to appointment slip.'
      });
    }

    // Compute reporting time (15 mins prior to slot start time)
    const [h, m] = apt.time.split(':').map(Number);
    const totalMinutes = h * 60 + m - 15;
    const reportH = Math.max(0, Math.floor(totalMinutes / 60)).toString().padStart(2, '0');
    const reportM = Math.max(0, totalMinutes % 60).toString().padStart(2, '0');
    const reportingTime = `${reportH}:${reportM}`;

    // Generate dynamic QR Code DataURL pointing to verification URL
    const protocol = req.protocol;
    const host = req.get('host');
    const verificationUrl = `${protocol}://${host}/verify-slip.html?number=${apt.appointment_number}`;

    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    return res.json({
      success: true,
      data: {
        ...apt,
        serial_badge: `SL - ${String(apt.serial_number).padStart(2, '0')}`,
        reporting_time: reportingTime,
        verification_url: verificationUrl,
        qr_code_data_url: qrDataUrl
      }
    });
  } catch (error) {
    next(error);
  }
}

export function verifyAppointmentSlip(req, res, next) {
  try {
    const db = getDb();
    const appointmentNumber = req.params.number;

    const apt = db.prepare(`
      SELECT 
        a.id, a.appointment_number, a.date, a.time, a.serial_number, a.status,
        a.patient_name, a.patient_age, a.patient_gender, a.fee_amount,
        u.name as doctor_name, s.name_en as specialty,
        h.name_en as hospital_name, h.address_en as chamber_address,
        p.status as payment_status, p.method as payment_method
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      LEFT JOIN payments p ON p.appointment_id = a.id
      WHERE a.appointment_number = ?
    `).get(appointmentNumber);

    if (!apt) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid or unknown appointment slip.'
      });
    }

    return res.json({
      success: true,
      verified: true,
      data: {
        ...apt,
        serial_badge: `SL - ${String(apt.serial_number).padStart(2, '0')}`
      }
    });
  } catch (error) {
    next(error);
  }
}
