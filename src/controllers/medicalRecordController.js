import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';

const uploadSchema = z.object({
  title: z.string().min(2).max(100),
  category: z.enum(['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER']),
  fileName: z.string().min(1).max(255),
  fileData: z.string().min(10), // base64 data URI
  fileSize: z.number().int().min(1).max(15 * 1024 * 1024), // max 15MB
  mimeType: z.string().min(3).max(100),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  notes: z.string().max(500).optional().default('')
});

export function uploadMedicalRecord(req, res, next) {
  try {
    const validated = uploadSchema.parse(req.body);
    const db = getDb();
    const patientId = req.user.id;

    const result = db.prepare(`
      INSERT INTO medical_records (
        patient_id, title, category, file_name, file_data, file_size, mime_type, test_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      patientId,
      validated.title,
      validated.category,
      validated.fileName,
      validated.fileData,
      validated.fileSize,
      validated.mimeType,
      validated.testDate || null,
      validated.notes
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, user_agent)
      VALUES (?, 'UPLOAD_MEDICAL_RECORD', 'medical_records', ?, ?, ?)
    `).run(patientId, result.lastInsertRowid, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      message: 'Medical document uploaded to secure vault successfully.',
      data: {
        id: Number(result.lastInsertRowid),
        title: validated.title,
        category: validated.category,
        fileName: validated.fileName,
        fileSize: validated.fileSize,
        mimeType: validated.mimeType,
        testDate: validated.testDate,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

export function getMyMedicalRecords(req, res, next) {
  try {
    const db = getDb();
    const records = db.prepare(`
      SELECT id, title, category, file_name, file_size, mime_type, test_date, notes, created_at
      FROM medical_records
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
}

export function getMedicalRecordById(req, res, next) {
  try {
    const db = getDb();
    const recordId = Number(req.params.id);
    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(recordId);

    if (!record) {
      throw new AppError('Medical record not found.', 404);
    }

    // Access check: owner or admin or treating doctor
    let isAuthorized = req.user.id === record.patient_id || req.user.role === 'admin';

    if (!isAuthorized && req.user.role === 'doctor') {
      const doc = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (doc) {
        const hasApt = db.prepare(`
          SELECT id FROM appointments 
          WHERE doctor_id = ? AND patient_id = ? AND status != 'CANCELLED'
        `).get(doc.id, record.patient_id);
        if (hasApt) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new AppError('Access denied: You do not have permission to inspect this medical record.', 403);
    }

    // HIPAA access log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, user_agent)
      VALUES (?, 'VIEW_MEDICAL_RECORD_DATA', 'medical_records', ?, ?, ?)
    `).run(req.user.id, recordId, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      data: record
    });
  } catch (err) {
    next(err);
  }
}

export function getPatientRecordsForDoctor(req, res, next) {
  try {
    const db = getDb();
    const patientId = Number(req.params.patientId);

    // Verify requesting user is doctor with active appointment or admin
    if (req.user.role === 'doctor') {
      const doc = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (!doc) throw new AppError('Doctor record not found.', 404);

      const hasAppointment = db.prepare(`
        SELECT id FROM appointments
        WHERE doctor_id = ? AND patient_id = ? AND status != 'CANCELLED'
      `).get(doc.id, patientId);

      if (!hasAppointment && req.user.role !== 'admin') {
        throw new AppError('Clinical privacy policy: You may only view records for active patients.', 403);
      }
    } else if (req.user.role !== 'admin') {
      throw new AppError('Unauthorized access to clinical patient vault.', 403);
    }

    const records = db.prepare(`
      SELECT id, title, category, file_name, file_size, mime_type, test_date, notes, created_at
      FROM medical_records
      WHERE patient_id = ?
      ORDER BY test_date DESC, created_at DESC
    `).all(patientId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, user_agent)
      VALUES (?, 'DOCTOR_VIEW_PATIENT_VAULT', 'medical_records', ?, ?, ?)
    `).run(req.user.id, patientId, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      patientId,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
}

export function deleteMedicalRecord(req, res, next) {
  try {
    const db = getDb();
    const recordId = Number(req.params.id);
    const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(recordId);

    if (!record) {
      throw new AppError('Medical record not found.', 404);
    }

    if (record.patient_id !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Unauthorized: You can only delete your own medical documents.', 403);
    }

    db.prepare('DELETE FROM medical_records WHERE id = ?').run(recordId);

    res.json({
      success: true,
      message: 'Medical document removed from vault.'
    });
  } catch (err) {
    next(err);
  }
}
