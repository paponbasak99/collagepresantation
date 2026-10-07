import { getDb } from '../db/connection.js';

export function getSpecialties(req, res, next) {
  try {
    const db = getDb();
    const specialties = db.prepare(`
      SELECT s.*, COUNT(d.id) as doctor_count
      FROM specialties s
      LEFT JOIN doctors d ON d.specialty_id = s.id AND d.status = 'APPROVED'
      GROUP BY s.id
      ORDER BY s.id ASC
    `).all();

    res.json({
      success: true,
      data: specialties
    });
  } catch (error) {
    next(error);
  }
}

export function getHospitals(req, res, next) {
  try {
    const db = getDb();
    const hospitals = db.prepare(`
      SELECT h.*, COUNT(d.id) as doctor_count
      FROM hospitals h
      LEFT JOIN doctors d ON d.hospital_id = h.id AND d.status = 'APPROVED'
      GROUP BY h.id
      ORDER BY h.id ASC
    `).all();

    res.json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    next(error);
  }
}
