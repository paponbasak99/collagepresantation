import jwt from 'jsonwebtoken';
import config from '../config.js';
import { getDb } from '../db/connection.js';
import { AppError } from './errorHandler.js';

export function requireAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const db = getDb();
    const user = db.prepare(`
      SELECT id, phone, name, email, role, is_active, age, gender, blood_group, address
      FROM users WHERE id = ?
    `).get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}

export function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const db = getDb();
      const user = db.prepare(`
        SELECT id, phone, name, email, role, is_active, age, gender, blood_group, address
        FROM users WHERE id = ?
      `).get(decoded.userId);
      if (user && user.is_active) {
        req.user = user;
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of the following roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

export function canAccessMedicalData(patientId) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Admins have audit clearance
    if (user.role === 'admin') {
      return next();
    }

    // Patient can view their own medical record
    if (user.role === 'patient' && Number(user.id) === Number(patientId)) {
      return next();
    }

    // Doctor can view if they have/had an appointment with this patient
    if (user.role === 'doctor') {
      const db = getDb();
      const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(user.id);
      if (doctor) {
        const hasAppointment = db.prepare(`
          SELECT id FROM appointments 
          WHERE doctor_id = ? AND patient_id = ?
          LIMIT 1
        `).get(doctor.id, patientId);

        if (hasAppointment) {
          return next();
        }
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: Patient medical data is confidential.'
    });
  };
}
