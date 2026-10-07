import { getDb } from '../db/connection.js';
import { subscribeQueueClient } from '../services/sseService.js';

/**
 * Handle SSE Stream connection
 */
export function streamQueue(req, res) {
  subscribeQueueClient(req, res);
}

/**
 * Get live queue snapshot for a doctor or all active chambers
 */
export function getLiveQueueSnapshot(req, res, next) {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const doctorId = req.query.doctor_id ? parseInt(req.query.doctor_id, 10) : null;

    let doctorQuery = `
      SELECT d.id as doctor_id, u.name as doctor_name, s.name_en as specialty,
             d.chamber_address, h.name_en as hospital_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.status = 'APPROVED'
    `;
    const docParams = [];
    if (doctorId) {
      doctorQuery += ` AND d.id = ?`;
      docParams.push(doctorId);
    }

    const doctors = db.prepare(doctorQuery).all(...docParams);

    const queueData = doctors.map(doc => {
      // Get all appointments today for this doctor
      const appointments = db.prepare(`
        SELECT a.id, a.appointment_number, a.serial_number, a.time, a.status,
               a.patient_name, a.is_emergency, a.patient_gender, a.patient_age
        FROM appointments a
        WHERE a.doctor_id = ? AND a.date = ?
        ORDER BY a.serial_number ASC
      `).all(doc.doctor_id, today);

      // Find now serving (IN_CONSULTATION, or first ARRIVED if none in consultation)
      const inConsultation = appointments.find(a => a.status === 'IN_CONSULTATION') || null;
      const waiting = appointments.filter(a => ['CONFIRMED', 'ARRIVED'].includes(a.status));
      const completed = appointments.filter(a => a.status === 'COMPLETED');

      // Check active broadcast for today
      const broadcast = db.prepare(`
        SELECT * FROM doctor_broadcasts
        WHERE doctor_id = ? AND broadcast_date = ? AND status = 'ACTIVE'
        ORDER BY id DESC LIMIT 1
      `).get(doc.doctor_id, today) || null;

      // Mask patient name for public kiosk display: "Md. Rahman" -> "Md. R****n"
      const maskName = (name) => {
        if (!name) return 'Patient';
        const parts = name.trim().split(' ');
        return parts.map(p => {
          if (p.length <= 2) return p;
          return p[0] + '*'.repeat(Math.max(2, p.length - 2)) + p[p.length - 1];
        }).join(' ');
      };

      return {
        doctor: {
          id: doc.doctor_id,
          name: doc.doctor_name,
          specialty: doc.specialty,
          chamber: doc.chamber_address,
          hospital: doc.hospital_name
        },
        nowServing: inConsultation ? {
          serialNumber: inConsultation.serial_number,
          appointmentNumber: inConsultation.appointment_number,
          patientNameMasked: maskName(inConsultation.patient_name),
          isEmergency: Boolean(inConsultation.is_emergency),
          time: inConsultation.time
        } : null,
        upcomingQueue: waiting.slice(0, 8).map(a => ({
          serialNumber: a.serial_number,
          appointmentNumber: a.appointment_number,
          patientNameMasked: maskName(a.patient_name),
          isEmergency: Boolean(a.is_emergency),
          status: a.status,
          time: a.time
        })),
        stats: {
          totalBooked: appointments.length,
          waitingCount: waiting.length,
          completedCount: completed.length
        },
        broadcast: broadcast ? {
          delayMinutes: broadcast.delay_minutes,
          message: broadcast.message,
          createdAt: broadcast.created_at
        } : null
      };
    });

    res.json({
      status: 'success',
      date: today,
      data: queueData
    });
  } catch (err) {
    next(err);
  }
}
