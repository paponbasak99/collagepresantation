import { getDb } from '../db/connection.js';

export function getDoctors(req, res, next) {
  try {
    const db = getDb();
    const {
      search,
      specialty_id,
      hospital_id,
      city,
      min_fee,
      max_fee,
      min_rating,
      date,
      sort = 'rating'
    } = req.query;

    let query = `
      SELECT 
        d.id, d.user_id, d.bmdc_reg_no, d.qualifications, d.experience_years,
        d.consultation_fee, d.follow_up_fee, d.bio_en, d.bio_bn, d.chamber_address,
        d.status, d.rating_avg, d.rating_count,
        u.name as name, u.phone, u.avatar_url,
        s.id as specialty_id, s.name_en as specialty_name_en, s.name_bn as specialty_name_bn, s.icon as specialty_icon,
        h.id as hospital_id, h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en, h.address_bn as hospital_address_bn, h.city as hospital_city
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.status = 'APPROVED' AND u.is_active = 1
    `;

    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        u.name LIKE ? OR 
        d.qualifications LIKE ? OR 
        d.bio_en LIKE ? OR 
        s.name_en LIKE ? OR 
        s.name_bn LIKE ? OR 
        h.name_en LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    if (specialty_id) {
      query += ` AND d.specialty_id = ?`;
      params.push(Number(specialty_id));
    }

    if (hospital_id) {
      query += ` AND d.hospital_id = ?`;
      params.push(Number(hospital_id));
    }

    if (city) {
      query += ` AND LOWER(h.city) = LOWER(?)`;
      params.push(city);
    }

    if (min_fee) {
      query += ` AND d.consultation_fee >= ?`;
      params.push(Number(min_fee));
    }

    if (max_fee) {
      query += ` AND d.consultation_fee <= ?`;
      params.push(Number(max_fee));
    }

    if (min_rating) {
      query += ` AND d.rating_avg >= ?`;
      params.push(Number(min_rating));
    }

    if (date) {
      // Check if doctor has available slots or active schedule without leave on that date
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      query += ` AND (
        EXISTS (
          SELECT 1 FROM time_slots ts 
          WHERE ts.doctor_id = d.id AND ts.date = ? 
            AND (ts.status = 'AVAILABLE' OR (ts.status = 'HELD' AND ts.held_until < datetime('now')))
        )
        OR (
          EXISTS (
            SELECT 1 FROM doctor_schedules ds 
            WHERE ds.doctor_id = d.id AND ds.day_of_week = ? AND ds.is_active = 1
          )
          AND NOT EXISTS (
            SELECT 1 FROM doctor_leaves dl 
            WHERE dl.doctor_id = d.id AND dl.leave_date = ?
          )
        )
      )`;
      params.push(date, dayOfWeek, date);
    }

    // Sort order
    switch (sort) {
      case 'fee_asc':
        query += ` ORDER BY d.consultation_fee ASC, d.rating_avg DESC`;
        break;
      case 'fee_desc':
        query += ` ORDER BY d.consultation_fee DESC, d.rating_avg DESC`;
        break;
      case 'experience':
        query += ` ORDER BY d.experience_years DESC, d.rating_avg DESC`;
        break;
      case 'rating':
      default:
        query += ` ORDER BY d.rating_avg DESC, d.rating_count DESC, d.experience_years DESC`;
        break;
    }

    const doctors = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
}

export function getDoctorById(req, res, next) {
  try {
    const db = getDb();
    const doctorId = Number(req.params.id);

    const doctor = db.prepare(`
      SELECT 
        d.id, d.user_id, d.bmdc_reg_no, d.qualifications, d.experience_years,
        d.consultation_fee, d.follow_up_fee, d.bio_en, d.bio_bn, d.chamber_address,
        d.status, d.rating_avg, d.rating_count,
        u.name as name, u.phone, u.email, u.avatar_url,
        s.id as specialty_id, s.name_en as specialty_name_en, s.name_bn as specialty_name_bn, s.icon as specialty_icon,
        h.id as hospital_id, h.name_en as hospital_name_en, h.name_bn as hospital_name_bn,
        h.address_en as hospital_address_en, h.address_bn as hospital_address_bn, h.city as hospital_city,
        h.phone as hospital_phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.id = ?
    `).get(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.'
      });
    }

    // Weekly schedules
    const schedules = db.prepare(`
      SELECT day_of_week, start_time, end_time, slot_duration_minutes, break_start, break_end, is_active
      FROM doctor_schedules
      WHERE doctor_id = ? AND is_active = 1
      ORDER BY day_of_week ASC
    `).all(doctorId);

    // Leaves
    const leaves = db.prepare(`
      SELECT leave_date, reason
      FROM doctor_leaves
      WHERE doctor_id = ? AND leave_date >= date('now')
      ORDER BY leave_date ASC
    `).all(doctorId);

    // Reviews summary and recent 5 reviews
    const recentReviews = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as patient_name
      FROM reviews r
      JOIN users u ON r.patient_id = u.id
      WHERE r.doctor_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(doctorId).map(r => {
      // Partially mask name for privacy: "Tanvir Ahmed" -> "Tanvir A."
      const parts = r.patient_name.trim().split(' ');
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
      return {
        ...r,
        patient_name: maskedName
      };
    });

    res.json({
      success: true,
      data: {
        ...doctor,
        schedules,
        leaves,
        recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getDoctorReviews(req, res, next) {
  try {
    const db = getDb();
    const doctorId = Number(req.params.id);

    const reviews = db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as patient_name
      FROM reviews r
      JOIN users u ON r.patient_id = u.id
      WHERE r.doctor_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
    `).all(doctorId).map(r => {
      const parts = r.patient_name.trim().split(' ');
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
      return {
        ...r,
        patient_name: maskedName
      };
    });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
}
