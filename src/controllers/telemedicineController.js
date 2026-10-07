import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { broadcastQueueEvent } from '../services/sseService.js';
import { z } from 'zod';

const signalSchema = z.object({
  type: z.enum(['offer', 'answer', 'candidate', 'hangup']),
  data: z.any()
});

export function getTelemedicineSession(req, res, next) {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const db = getDb();

    const apt = db.prepare(`
      SELECT a.*, d.user_id as doctor_user_id, u.name as doctor_name,
             p.name as patient_user_name, s.name_en as specialty
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN users p ON a.patient_id = p.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE a.id = ?
    `).get(appointmentId);

    if (!apt) throw new AppError('Appointment not found.', 404);

    const isDoctor = req.user.id === apt.doctor_user_id;
    const isPatient = req.user.id === apt.patient_id;
    const isAdmin = req.user.role === 'admin';

    if (!isDoctor && !isPatient && !isAdmin) {
      throw new AppError('Unauthorized: You are not a participant in this clinical consultation.', 403);
    }

    const peerUserId = isDoctor ? apt.patient_id : apt.doctor_user_id;

    res.json({
      success: true,
      data: {
        appointmentId,
        appointmentNumber: apt.appointment_number,
        date: apt.date,
        time: apt.time,
        serialNumber: apt.serial_number,
        status: apt.status,
        myRole: isDoctor ? 'DOCTOR' : (isPatient ? 'PATIENT' : 'ADMIN'),
        myUserId: req.user.id,
        peerUserId,
        doctor: {
          name: apt.doctor_name,
          specialty: apt.specialty
        },
        patient: {
          name: apt.patient_name,
          age: apt.patient_age,
          gender: apt.patient_gender,
          reason: apt.reason_for_visit
        },
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
}

export function sendSignal(req, res, next) {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const { type, data } = signalSchema.parse(req.body);
    const db = getDb();

    const apt = db.prepare(`
      SELECT a.patient_id, d.user_id as doctor_user_id 
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.id = ?
    `).get(appointmentId);

    if (!apt) throw new AppError('Appointment not found.', 404);

    const isDoctor = req.user.id === apt.doctor_user_id;
    const isPatient = req.user.id === apt.patient_id;
    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      throw new AppError('Unauthorized participant.', 403);
    }

    const recipientUserId = isDoctor ? apt.patient_id : apt.doctor_user_id;

    const result = db.prepare(`
      INSERT INTO telemedicine_signals (
        appointment_id, sender_user_id, recipient_user_id, signal_type, signal_data
      ) VALUES (?, ?, ?, ?, ?)
    `).run(appointmentId, req.user.id, recipientUserId, type, JSON.stringify(data));

    // Instant SSE broadcast for zero-latency peer alert
    try {
      broadcastQueueEvent({
        doctorId: null,
        eventType: 'TELEMED_SIGNAL',
        data: {
          appointmentId,
          recipientUserId,
          senderUserId: req.user.id,
          type,
          data
        }
      });
    } catch (_) {}

    res.json({
      success: true,
      signalId: Number(result.lastInsertRowid)
    });
  } catch (err) {
    next(err);
  }
}

export function pullSignals(req, res, next) {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const db = getDb();

    const signals = db.prepare(`
      SELECT id, sender_user_id, signal_type, signal_data, created_at
      FROM telemedicine_signals
      WHERE appointment_id = ? AND recipient_user_id = ? AND is_delivered = 0
      ORDER BY id ASC
    `).all(appointmentId, req.user.id);

    if (signals.length > 0) {
      const ids = signals.map(s => s.id);
      db.prepare(`
        UPDATE telemedicine_signals 
        SET is_delivered = 1 
        WHERE id IN (${ids.join(',')})
      `).run();
    }

    res.json({
      success: true,
      count: signals.length,
      data: signals.map(s => ({
        id: s.id,
        senderUserId: s.sender_user_id,
        type: s.signal_type,
        data: JSON.parse(s.signal_data),
        createdAt: s.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
}
