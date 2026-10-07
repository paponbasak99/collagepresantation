import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { encryptMedicalData, decryptMedicalData } from '../services/encryptionService.js';
import { logAudit } from '../services/auditService.js';
import { z } from 'zod';

const createPrescriptionSchema = z.object({
  appointmentId: z.number().int().positive(),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  symptoms: z.string().optional().or(z.literal('')),
  advice: z.string().optional().or(z.literal('')),
  followUpDate: z.string().optional().or(z.literal('')),
  medicines: z.array(z.object({
    medicineName: z.string().min(1, 'Medicine name required'),
    dosage: z.string().min(1, 'Dosage required (e.g. 1+0+1)'),
    instruction: z.string().min(1, 'Instruction required (e.g. After meal)'),
    duration: z.string().min(1, 'Duration required (e.g. 7 days)')
  })).min(1, 'At least one medicine must be prescribed'),
  tests: z.array(z.object({
    testName: z.string().min(1, 'Test name required'),
    notes: z.string().optional().or(z.literal(''))
  })).optional().default([])
});

export function createPrescription(req, res, next) {
  try {
    const validated = createPrescriptionSchema.parse(req.body);
    const db = getDb();
    const user = req.user;

    // Check doctor record
    const doctor = db.prepare('SELECT id, bmdc_reg_no FROM doctors WHERE user_id = ?').get(user.id);
    if (!doctor) {
      throw new AppError('Only registered doctors can issue prescriptions.', 403);
    }

    const rxTx = db.transaction(() => {
      // Fetch appointment
      const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(validated.appointmentId);
      if (!apt) {
        throw new AppError('Appointment not found.', 404);
      }

      if (apt.doctor_id !== doctor.id) {
        throw new AppError('Unauthorized: You can only prescribe for your own patients.', 403);
      }

      // Check if prescription already exists
      const existing = db.prepare('SELECT id FROM prescriptions WHERE appointment_id = ?').get(validated.appointmentId);
      if (existing) {
        throw new AppError('A prescription has already been created for this appointment.', 409);
      }

      // Encrypt sensitive clinical data with AES-256
      const encDiagnosis = encryptMedicalData(validated.diagnosis);
      const encSymptoms = encryptMedicalData(validated.symptoms || '');
      const encAdvice = encryptMedicalData(validated.advice || '');
      const digitalSeal = `BMDC-SIG-${doctor.bmdc_reg_no}-${Date.now().toString(36).toUpperCase()}`;

      // Insert prescription
      const rxRes = db.prepare(`
        INSERT INTO prescriptions (
          appointment_id, doctor_id, patient_id, diagnosis, symptoms, advice, follow_up_date, digital_signature_seal, is_encrypted
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        validated.appointmentId,
        doctor.id,
        apt.patient_id,
        encDiagnosis,
        encSymptoms || null,
        encAdvice || null,
        validated.followUpDate || null,
        digitalSeal
      );

      const prescriptionId = rxRes.lastInsertRowid;

      // Insert medicines
      const insertItem = db.prepare(`
        INSERT INTO prescription_items (prescription_id, medicine_name, dosage, instruction, duration)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const med of validated.medicines) {
        insertItem.run(prescriptionId, med.medicineName, med.dosage, med.instruction, med.duration);
      }

      // Insert diagnostic tests
      if (validated.tests && validated.tests.length > 0) {
        const insertTest = db.prepare(`
          INSERT INTO prescription_tests (prescription_id, test_name, notes)
          VALUES (?, ?, ?)
        `);
        for (const t of validated.tests) {
          insertTest.run(prescriptionId, t.testName, t.notes || null);
        }
      }

      // Automatically conclude appointment as COMPLETED
      db.prepare(`
        UPDATE appointments 
        SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(validated.appointmentId);

      return prescriptionId;
    });

    const prescriptionId = rxTx();

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully and visit marked as completed.',
      data: { prescriptionId }
    });
  } catch (error) {
    next(error);
  }
}

export function getPrescriptionByAppointment(req, res, next) {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const db = getDb();
    const user = req.user;

    const rx = db.prepare(`
      SELECT 
        pr.*,
        a.appointment_number, a.date as appointment_date, a.time as appointment_time,
        a.patient_name, a.patient_age, a.patient_gender, a.patient_phone,
        u.name as doctor_name, u.phone as doctor_phone,
        d.qualifications as doctor_qualifications, d.bmdc_reg_no, d.chamber_address,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.address_en as hospital_address_en
      FROM prescriptions pr
      JOIN appointments a ON pr.appointment_id = a.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE pr.appointment_id = ?
    `).get(appointmentId);

    if (!rx) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    // Confidentiality Check: patient, prescribing doctor, or admin
    const isPatient = rx.patient_id === user.id;
    const isDoctor = user.role === 'doctor';
    const isAdmin = user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Patient medical record is confidential.'
      });
    }

    // Log sensitive medical record access
    logAudit({
      userId: user.id,
      action: 'VIEW_MEDICAL_RECORD',
      entity: 'PRESCRIPTION',
      entityId: rx.id,
      newValues: { patientId: rx.patient_id, appointmentId: rx.appointment_id },
      req
    });

    const medicines = db.prepare(`
      SELECT id, medicine_name, dosage, instruction, duration
      FROM prescription_items 
      WHERE prescription_id = ?
    `).all(rx.id);

    const tests = db.prepare(`
      SELECT id, test_name, notes
      FROM prescription_tests
      WHERE prescription_id = ?
    `).all(rx.id);

    return res.json({
      success: true,
      data: {
        ...rx,
        diagnosis: decryptMedicalData(rx.diagnosis),
        symptoms: decryptMedicalData(rx.symptoms),
        advice: decryptMedicalData(rx.advice),
        digitalSignatureSeal: rx.digital_signature_seal || `BMDC-CERT-${rx.bmdc_reg_no}`,
        medicines,
        tests
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getPatientPrescriptions(req, res, next) {
  try {
    const patientId = Number(req.params.patientId);
    const db = getDb();
    const user = req.user;

    // Log medical history view
    logAudit({
      userId: user.id,
      action: 'VIEW_MEDICAL_HISTORY',
      entity: 'PATIENT_RECORDS',
      entityId: patientId,
      req
    });

    const prescriptions = db.prepare(`
      SELECT 
        pr.*,
        a.appointment_number, a.date as appointment_date,
        u.name as doctor_name, s.name_en as specialty, h.name_en as hospital_name
      FROM prescriptions pr
      JOIN appointments a ON pr.appointment_id = a.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE pr.patient_id = ?
      ORDER BY pr.created_at DESC
    `).all(patientId).map(rx => {
      const medicines = db.prepare(`
        SELECT medicine_name, dosage, instruction, duration
        FROM prescription_items WHERE prescription_id = ?
      `).all(rx.id);

      const tests = db.prepare(`
        SELECT test_name, notes
        FROM prescription_tests WHERE prescription_id = ?
      `).all(rx.id);

      return {
        ...rx,
        diagnosis: decryptMedicalData(rx.diagnosis),
        symptoms: decryptMedicalData(rx.symptoms),
        advice: decryptMedicalData(rx.advice),
        digitalSignatureSeal: rx.digital_signature_seal || `BMDC-CERT-${rx.doctor_name}`,
        medicines,
        tests
      };
    });

    return res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
}

export function getPrescriptionById(req, res, next) {
  try {
    const rxId = Number(req.params.id);
    const db = getDb();
    const user = req.user;

    const rx = db.prepare(`
      SELECT 
        pr.*,
        a.appointment_number, a.date as appointment_date, a.time as appointment_time,
        a.patient_name, a.patient_age, a.patient_gender, a.patient_phone,
        u.name as doctor_name, u.phone as doctor_phone,
        d.qualifications as doctor_qualifications, d.bmdc_reg_no, d.chamber_address,
        s.name_en as specialty_name_en, s.name_bn as specialty_name_bn,
        h.name_en as hospital_name_en, h.address_en as hospital_address_en
      FROM prescriptions pr
      JOIN appointments a ON pr.appointment_id = a.id
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE pr.id = ?
    `).get(rxId);

    if (!rx) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    const isPatient = rx.patient_id === user.id;
    const isDoctor = user.role === 'doctor';
    const isAdmin = user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Patient medical record is confidential.'
      });
    }

    // Log sensitive medical record access
    logAudit({
      userId: user.id,
      action: 'VIEW_MEDICAL_RECORD',
      entity: 'PRESCRIPTION',
      entityId: rx.id,
      newValues: { patientId: rx.patient_id, appointmentId: rx.appointment_id },
      req
    });

    const medicines = db.prepare(`
      SELECT id, medicine_name, dosage, instruction, duration
      FROM prescription_items 
      WHERE prescription_id = ?
    `).all(rx.id);

    const tests = db.prepare(`
      SELECT id, test_name, notes
      FROM prescription_tests 
      WHERE prescription_id = ?
    `).all(rx.id);

    return res.json({
      success: true,
      data: {
        ...rx,
        diagnosis: decryptMedicalData(rx.diagnosis),
        symptoms: decryptMedicalData(rx.symptoms),
        advice: decryptMedicalData(rx.advice),
        digitalSignatureSeal: rx.digital_signature_seal || `BMDC-CERT-${rx.bmdc_reg_no}`,
        medicines,
        tests
      }
    });
  } catch (error) {
    next(error);
  }
}
