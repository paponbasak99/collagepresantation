import { getDb } from '../db/connection.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAudit } from '../services/auditService.js';
import { z } from 'zod';

const specialtySchema = z.object({
  nameEn: z.string().min(2),
  nameBn: z.string().min(2),
  slug: z.string().min(2),
  icon: z.string().min(1),
  descriptionEn: z.string().optional().or(z.literal('')),
  descriptionBn: z.string().optional().or(z.literal(''))
});

const hospitalSchema = z.object({
  nameEn: z.string().min(2),
  nameBn: z.string().min(2),
  addressEn: z.string().min(2),
  addressBn: z.string().min(2),
  city: z.string().min(2),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal(''))
});

export function getDashboardStats(req, res, next) {
  try {
    const db = getDb();

    // 1. Total Appointments & Status breakdown
    const aptStats = db.prepare(`
      SELECT 
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show_count,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN status = 'ARRIVED' THEN 1 ELSE 0 END) as arrived_count
      FROM appointments
    `).get();

    // 2. Financial Metrics
    const paymentStats = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) as gross_revenue,
        COALESCE(SUM(CASE WHEN status = 'REFUNDED' THEN refund_amount ELSE 0 END), 0) as total_refunds
      FROM payments
    `).get();

    const netRevenue = paymentStats.gross_revenue - paymentStats.total_refunds;

    // 3. User & Doctor metrics
    const userStats = db.prepare(`
      SELECT 
        SUM(CASE WHEN role = 'patient' THEN 1 ELSE 0 END) as total_patients,
        SUM(CASE WHEN role = 'doctor' THEN 1 ELSE 0 END) as total_doctors,
        SUM(CASE WHEN role = 'receptionist' THEN 1 ELSE 0 END) as total_receptionists
      FROM users WHERE is_active = 1
    `).get();

    const doctorApprovalStats = db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_doctors,
        SUM(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) as pending_doctors,
        SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended_doctors
      FROM doctors
    `).get();

    // 4. Rates
    const totalApts = aptStats.total_appointments || 0;
    const cancellationRate = totalApts > 0 ? Math.round((aptStats.cancelled_count / totalApts) * 1000) / 10 : 0;
    const noShowRate = totalApts > 0 ? Math.round((aptStats.no_show_count / totalApts) * 1000) / 10 : 0;

    return res.json({
      success: true,
      data: {
        totalAppointments: totalApts,
        completedAppointments: aptStats.completed_count || 0,
        confirmedAppointments: aptStats.confirmed_count || 0,
        cancelledAppointments: aptStats.cancelled_count || 0,
        noShowAppointments: aptStats.no_show_count || 0,
        cancellationRate,
        noShowRate,
        grossRevenue: paymentStats.gross_revenue,
        totalRefunds: paymentStats.total_refunds,
        netRevenue,
        totalPatients: userStats.total_patients || 0,
        approvedDoctors: doctorApprovalStats.approved_doctors || 0,
        pendingDoctors: doctorApprovalStats.pending_doctors || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getChartData(req, res, next) {
  try {
    const db = getDb();

    // 1. Appointments per day (last 14 days)
    const dailyAppointments = db.prepare(`
      SELECT 
        date,
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
      FROM appointments
      WHERE date >= date('now', '-14 days')
      GROUP BY date
      ORDER BY date ASC
    `).all();

    // 2. Revenue breakdown by payment method
    const revenueByMethod = db.prepare(`
      SELECT 
        method,
        COUNT(*) as transaction_count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
      WHERE status = 'PAID'
      GROUP BY method
    `).all();

    // 3. Top Doctors by Patient Volume & Ratings
    const topDoctors = db.prepare(`
      SELECT 
        d.id, u.name as doctor_name, s.name_en as specialty,
        d.rating_avg, d.rating_count,
        COUNT(a.id) as completed_consultations,
        COALESCE(SUM(a.fee_amount), 0) as generated_revenue
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      LEFT JOIN appointments a ON a.doctor_id = d.id AND a.status = 'COMPLETED'
      WHERE d.status = 'APPROVED'
      GROUP BY d.id
      ORDER BY completed_consultations DESC, d.rating_avg DESC
      LIMIT 5
    `).all();

    // 4. Busiest consultation hours
    const busiestHours = db.prepare(`
      SELECT 
        substr(time, 1, 2) || ':00' as hour_slot,
        COUNT(*) as booking_count
      FROM appointments
      GROUP BY hour_slot
      ORDER BY booking_count DESC
      LIMIT 8
    `).all();

    return res.json({
      success: true,
      data: {
        dailyAppointments,
        revenueByMethod,
        topDoctors,
        busiestHours
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getPendingDoctors(req, res, next) {
  try {
    const db = getDb();
    const pending = db.prepare(`
      SELECT 
        d.id as doctor_id, d.bmdc_reg_no, d.qualifications, d.experience_years,
        d.consultation_fee, d.chamber_address, d.created_at,
        u.id as user_id, u.name, u.phone, u.email,
        s.name_en as specialty_name, h.name_en as hospital_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.status = 'PENDING_APPROVAL'
      ORDER BY d.created_at ASC
    `).all();

    return res.json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (error) {
    next(error);
  }
}

export function verifyDoctorBmdc(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const db = getDb();

    const doctor = db.prepare(`
      SELECT d.*, u.name, u.phone, u.email, s.name_en as specialty_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.id = ?
    `).get(doctorId);

    if (!doctor) throw new AppError('Doctor not found.', 404);

    // Simulate official BMDC (Bangladesh Medical & Dental Council) registry verification
    const isValidFormat = Boolean(doctor.bmdc_reg_no && doctor.bmdc_reg_no.trim().length >= 4);
    const mockVerifiedRecord = {
      bmdcRegNo: doctor.bmdc_reg_no,
      doctorName: doctor.name,
      status: isValidFormat ? 'VALID_ACTIVE' : 'FLAGGED_UNVERIFIED',
      councilStatusText: isValidFormat ? 'Valid & In Good Standing' : 'Record Not Found in National Registry',
      specialty: doctor.specialty_name,
      degree: doctor.qualifications,
      registrationType: 'Permanent Medical Practitioner',
      accreditationCouncil: 'Bangladesh Medical & Dental Council (BMDC)',
      registeredSince: '2015-04-18',
      renewalDue: '2028-12-31',
      disciplinaryActions: 'None / Clean Record',
      verifiedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: mockVerifiedRecord
    });
  } catch (error) {
    next(error);
  }
}

export function approveDoctor(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const db = getDb();

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) throw new AppError('Doctor not found.', 404);

    db.prepare("UPDATE doctors SET status = 'APPROVED', is_bmdc_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(doctorId);

    logAudit({
      userId: req.user.id,
      action: 'APPROVE_DOCTOR_BMDC_VERIFIED',
      entity: 'DOCTOR',
      entityId: doctorId,
      oldValues: { status: doctor.status, is_bmdc_verified: doctor.is_bmdc_verified || 0 },
      newValues: { status: 'APPROVED', is_bmdc_verified: 1 },
      req
    });

    return res.json({
      success: true,
      message: 'Doctor registration approved and BMDC credentials certified.'
    });
  } catch (error) {
    next(error);
  }
}

export function suspendDoctor(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const db = getDb();

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId);
    if (!doctor) throw new AppError('Doctor not found.', 404);

    db.prepare("UPDATE doctors SET status = 'SUSPENDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(doctorId);

    logAudit({
      userId: req.user.id,
      action: 'SUSPEND_DOCTOR',
      entity: 'DOCTOR',
      entityId: doctorId,
      oldValues: { status: doctor.status },
      newValues: { status: 'SUSPENDED' },
      req
    });

    return res.json({
      success: true,
      message: 'Doctor account has been suspended.'
    });
  } catch (error) {
    next(error);
  }
}

export function exportCSV(req, res, next) {
  try {
    const entity = req.params.entity;
    const db = getDb();

    let filename = `docbook-${entity}-${new Date().toISOString().slice(0, 10)}.csv`;
    let csvLines = [];

    if (entity === 'appointments') {
      csvLines.push('Appointment Number,Serial,Date,Time,Patient Name,Phone,Doctor,Specialty,Hospital,Status,Fee (BDT),Payment Method,Payment Status');
      const rows = db.prepare(`
        SELECT 
          a.appointment_number, a.serial_number, a.date, a.time,
          a.patient_name, a.patient_phone, u.name as doctor_name,
          s.name_en as specialty, h.name_en as hospital,
          a.status, a.fee_amount,
          COALESCE(p.method, 'NONE') as payment_method,
          COALESCE(p.status, 'PENDING') as payment_status
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        JOIN specialties s ON d.specialty_id = s.id
        JOIN hospitals h ON d.hospital_id = h.id
        LEFT JOIN payments p ON p.appointment_id = a.id
        ORDER BY a.date DESC, a.time DESC
      `).all();

      for (const r of rows) {
        csvLines.push(`"${r.appointment_number}","SL-${r.serial_number}","${r.date}","${r.time}","${r.patient_name}","${r.patient_phone}","${r.doctor_name}","${r.specialty}","${r.hospital}","${r.status}",${r.fee_amount},"${r.payment_method}","${r.payment_status}"`);
      }
    } else if (entity === 'payments') {
      csvLines.push('Payment ID,Appointment Number,Patient Phone,Method,Transaction Ref,Amount (BDT),Status,Refund Amount,Payment Date');
      const rows = db.prepare(`
        SELECT 
          p.id, a.appointment_number, u.phone as patient_phone,
          p.method, COALESCE(p.transaction_ref, 'N/A') as tx_ref,
          p.amount, p.status, p.refund_amount,
          COALESCE(p.payment_date, 'N/A') as payment_date
        FROM payments p
        JOIN appointments a ON p.appointment_id = a.id
        JOIN users u ON p.user_id = u.id
        ORDER BY p.id DESC
      `).all();

      for (const r of rows) {
        csvLines.push(`${r.id},"${r.appointment_number}","${r.patient_phone}","${r.method}","${r.tx_ref}",${r.amount},"${r.status}",${r.refund_amount},"${r.payment_date}"`);
      }
    } else if (entity === 'doctors') {
      csvLines.push('Doctor ID,Name,Phone,Specialty,Hospital,BMDC Reg,Experience (Yrs),Fee (BDT),Status,Rating,Review Count');
      const rows = db.prepare(`
        SELECT 
          d.id, u.name, u.phone, s.name_en as specialty, h.name_en as hospital,
          d.bmdc_reg_no, d.experience_years, d.consultation_fee, d.status,
          d.rating_avg, d.rating_count
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN specialties s ON d.specialty_id = s.id
        JOIN hospitals h ON d.hospital_id = h.id
        ORDER BY d.id ASC
      `).all();

      for (const r of rows) {
        csvLines.push(`${r.id},"${r.name}","${r.phone}","${r.specialty}","${r.hospital}","${r.bmdc_reg_no}",${r.experience_years},${r.consultation_fee},"${r.status}",${r.rating_avg},${r.rating_count}`);
      }
    } else {
      throw new AppError('Invalid export entity. Supported: appointments, payments, doctors', 400);
    }

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export function getAuditLogs(req, res, next) {
  try {
    const db = getDb();
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const logs = db.prepare(`
      SELECT 
        l.*,
        u.name as user_name, u.role as user_role
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ?
    `).all(limit);

    return res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}

// Specialty CRUD
export function createSpecialty(req, res, next) {
  try {
    const val = specialtySchema.parse(req.body);
    const db = getDb();

    const insert = db.prepare(`
      INSERT INTO specialties (name_en, name_bn, slug, icon, description_en, description_bn)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(val.nameEn, val.nameBn, val.slug, val.icon, val.descriptionEn || null, val.descriptionBn || null);

    logAudit({
      userId: req.user.id,
      action: 'CREATE_SPECIALTY',
      entity: 'SPECIALTY',
      entityId: insert.lastInsertRowid,
      newValues: val,
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Specialty created successfully.',
      data: { id: insert.lastInsertRowid }
    });
  } catch (error) {
    next(error);
  }
}

export function updateSpecialty(req, res, next) {
  try {
    const id = Number(req.params.id);
    const val = specialtySchema.parse(req.body);
    const db = getDb();

    db.prepare(`
      UPDATE specialties
      SET name_en = ?, name_bn = ?, slug = ?, icon = ?, description_en = ?, description_bn = ?
      WHERE id = ?
    `).run(val.nameEn, val.nameBn, val.slug, val.icon, val.descriptionEn || null, val.descriptionBn || null, id);

    logAudit({
      userId: req.user.id,
      action: 'UPDATE_SPECIALTY',
      entity: 'SPECIALTY',
      entityId: id,
      newValues: val,
      req
    });

    return res.json({
      success: true,
      message: 'Specialty updated.'
    });
  } catch (error) {
    next(error);
  }
}

export function deleteSpecialty(req, res, next) {
  try {
    const id = Number(req.params.id);
    const db = getDb();

    // Check if doctors are assigned
    const count = db.prepare('SELECT COUNT(*) as count FROM doctors WHERE specialty_id = ?').get(id).count;
    if (count > 0) {
      throw new AppError(`Cannot delete specialty: ${count} doctor(s) are currently assigned to it.`, 400);
    }

    db.prepare('DELETE FROM specialties WHERE id = ?').run(id);

    logAudit({
      userId: req.user.id,
      action: 'DELETE_SPECIALTY',
      entity: 'SPECIALTY',
      entityId: id,
      req
    });

    return res.json({
      success: true,
      message: 'Specialty deleted.'
    });
  } catch (error) {
    next(error);
  }
}

// Hospital CRUD
export function createHospital(req, res, next) {
  try {
    const val = hospitalSchema.parse(req.body);
    const db = getDb();

    const insert = db.prepare(`
      INSERT INTO hospitals (name_en, name_bn, address_en, address_bn, city, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(val.nameEn, val.nameBn, val.addressEn, val.addressBn, val.city, val.phone || null, val.email || null);

    logAudit({
      userId: req.user.id,
      action: 'CREATE_HOSPITAL',
      entity: 'HOSPITAL',
      entityId: insert.lastInsertRowid,
      newValues: val,
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Hospital created successfully.',
      data: { id: insert.lastInsertRowid }
    });
  } catch (error) {
    next(error);
  }
}

export function updateHospital(req, res, next) {
  try {
    const id = Number(req.params.id);
    const val = hospitalSchema.parse(req.body);
    const db = getDb();

    db.prepare(`
      UPDATE hospitals
      SET name_en = ?, name_bn = ?, address_en = ?, address_bn = ?, city = ?, phone = ?, email = ?
      WHERE id = ?
    `).run(val.nameEn, val.nameBn, val.addressEn, val.addressBn, val.city, val.phone || null, val.email || null, id);

    logAudit({
      userId: req.user.id,
      action: 'UPDATE_HOSPITAL',
      entity: 'HOSPITAL',
      entityId: id,
      newValues: val,
      req
    });

    return res.json({
      success: true,
      message: 'Hospital details updated.'
    });
  } catch (error) {
    next(error);
  }
}

export function deleteHospital(req, res, next) {
  try {
    const id = Number(req.params.id);
    const db = getDb();

    const count = db.prepare('SELECT COUNT(*) as count FROM doctors WHERE hospital_id = ?').get(id).count;
    if (count > 0) {
      throw new AppError(`Cannot delete hospital: ${count} doctor(s) are practicing there.`, 400);
    }

    db.prepare('DELETE FROM hospitals WHERE id = ?').run(id);

    logAudit({
      userId: req.user.id,
      action: 'DELETE_HOSPITAL',
      entity: 'HOSPITAL',
      entityId: id,
      req
    });

    return res.json({
      success: true,
      message: 'Hospital removed.'
    });
  } catch (error) {
    next(error);
  }
}

// User Management
export function getUsersList(req, res, next) {
  try {
    const db = getDb();
    const { role } = req.query;

    let query = `
      SELECT id, phone, name, email, role, is_active, age, gender, created_at
      FROM users
    `;
    const params = [];

    if (role) {
      query += ` WHERE role = ?`;
      params.push(role);
    }

    query += ` ORDER BY id DESC LIMIT 100`;

    const users = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

export function toggleUserStatus(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const db = getDb();

    const user = db.prepare('SELECT id, is_active FROM users WHERE id = ?').get(userId);
    if (!user) throw new AppError('User not found.', 404);

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, userId);

    logAudit({
      userId: req.user.id,
      action: newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entity: 'USER',
      entityId: userId,
      newValues: { is_active: newStatus },
      req
    });

    return res.json({
      success: true,
      message: `User account ${newStatus ? 'activated' : 'deactivated'}.`,
      data: { userId, isActive: Boolean(newStatus) }
    });
  } catch (error) {
    next(error);
  }
}
