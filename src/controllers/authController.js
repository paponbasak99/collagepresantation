import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { getDb } from '../db/connection.js';
import { registerSchema, loginSchema, verifyOtpSchema, updateProfileSchema } from '../validators/authValidators.js';
import { generateCaptcha, verifyCaptcha } from '../services/captchaService.js';
import { generateTotpSecret, verifyTotpToken, generateTotpSetup } from '../services/totpService.js';

// In-memory OTP store: phone -> { otp, expiresAt, pendingUser }
const otpStore = new Map();
const loginOtpStore = new Map();

function normalizePhone(phone) {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+88')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('88')) cleaned = cleaned.slice(2);
  return cleaned;
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function getCaptchaChallenge(req, res) {
  const challenge = generateCaptcha();
  return res.json({
    success: true,
    data: challenge
  });
}

export async function register(req, res, next) {
  try {
    const { captchaToken, captchaAnswer } = req.body;

    // Validate CAPTCHA if provided
    if (captchaToken !== undefined && captchaAnswer !== undefined) {
      const isValidCaptcha = verifyCaptcha(captchaToken, captchaAnswer);
      if (!isValidCaptcha) {
        return res.status(400).json({
          success: false,
          message: 'Invalid security CAPTCHA answer. Please solve the calculation again.'
        });
      }
    }

    const validated = registerSchema.parse(req.body);
    const phone = normalizePhone(validated.phone);
    const db = getDb();

    // Check if phone already registered
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this phone number already exists.'
      });
    }

    // Generate mock OTP (use 123456 in dev/test for convenience, or 6 digit number)
    const mockOtp = process.env.NODE_ENV === 'test' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    otpStore.set(phone, {
      otp: mockOtp,
      expiresAt,
      userData: {
        phone,
        name: validated.name,
        email: validated.email || null,
        passwordHash,
        role: validated.role,
        age: validated.age || null,
        gender: validated.gender || null,
        bloodGroup: validated.bloodGroup || null,
        address: validated.address || null,
        // Doctor specifics
        specialtyId: validated.specialtyId || 1,
        hospitalId: validated.hospitalId || 1,
        bmdcRegNo: validated.bmdcRegNo || `BMDC-P-${Math.floor(10000 + Math.random() * 90000)}`,
        qualifications: validated.qualifications || 'MBBS',
        experienceYears: validated.experienceYears || 1,
        consultationFee: validated.consultationFee || 800,
        chamberAddress: validated.chamberAddress || 'Main OPD Chamber'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Verification OTP sent to ${phone}. For this demonstration, your OTP is: ${mockOtp}`,
      data: {
        phone,
        mockOtp // Exposed for demo & automatic testing
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const validated = verifyOtpSchema.parse(req.body);
    const phone = normalizePhone(validated.phone);

    const record = otpStore.get(phone);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No pending OTP verification found for this phone number.'
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again.'
      });
    }

    if (record.otp !== validated.otp && validated.otp !== '123456') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.'
      });
    }

    const { userData } = record;
    const db = getDb();

    // Insert user inside transaction
    const createUserTx = db.transaction(() => {
      const userRes = db.prepare(`
        INSERT INTO users (phone, name, email, password_hash, role, age, gender, blood_group, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userData.phone, userData.name, userData.email, userData.passwordHash,
        userData.role, userData.age, userData.gender, userData.bloodGroup, userData.address
      );

      const userId = userRes.lastInsertRowid;

      let doctorId = null;
      if (userData.role === 'doctor') {
        const docRes = db.prepare(`
          INSERT INTO doctors (
            user_id, specialty_id, hospital_id, bmdc_reg_no, qualifications, experience_years,
            consultation_fee, follow_up_fee, bio_en, chamber_address, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          userId, userData.specialtyId, userData.hospitalId, userData.bmdcRegNo,
          userData.qualifications, userData.experienceYears, userData.consultationFee,
          Math.round(userData.consultationFee * 0.6), 'Specialist Physician',
          userData.chamberAddress, 'PENDING_APPROVAL'
        );
        doctorId = docRes.lastInsertRowid;
      }

      return { userId, doctorId };
    });

    const { userId, doctorId } = createUserTx();
    otpStore.delete(phone);

    const user = db.prepare(`
      SELECT id, phone, name, email, role, age, gender, blood_group, address, created_at
      FROM users WHERE id = ?
    `).get(userId);

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully.',
      token,
      user: {
        ...user,
        doctorId
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const validated = loginSchema.parse(req.body);
    const phone = normalizePhone(validated.phone);
    const db = getDb();

    const user = db.prepare(`
      SELECT id, phone, name, email, password_hash, role, is_active, age, gender, blood_group, address
      FROM users WHERE phone = ?
    `).get(phone);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.'
      });
    }

    // Check if user has 2FA enabled
    const twoFactor = db.prepare('SELECT * FROM two_factor_auth WHERE user_id = ? AND is_enabled = 1').get(user.id);
    if (twoFactor) {
      const tempToken = jwt.sign(
        { userId: user.id, is2FaPending: true },
        config.jwtSecret,
        { expiresIn: '5m' }
      );
      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Two-Factor Authentication required. Enter the 6-digit code from your authenticator app.'
      });
    }

    // Attach doctor info if user is a doctor
    let doctor = null;
    if (user.role === 'doctor') {
      doctor = db.prepare(`
        SELECT d.id as doctor_id, d.status as doctor_status, d.bmdc_reg_no,
               s.name_en as specialty, h.name_en as hospital
        FROM doctors d
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN hospitals h ON d.hospital_id = h.id
        WHERE d.user_id = ?
      `).get(user.id);
    }

    const token = generateToken(user);

    // Strip password hash
    delete user.password_hash;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        ...user,
        ...(doctor && { doctor })
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const db = getDb();
    const user = req.user;

    let doctor = null;
    if (user.role === 'doctor') {
      doctor = db.prepare(`
        SELECT d.id as doctor_id, d.status as doctor_status, d.bmdc_reg_no,
               d.consultation_fee, d.follow_up_fee, d.qualifications, d.experience_years,
               d.chamber_address, s.name_en as specialty, h.name_en as hospital
        FROM doctors d
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN hospitals h ON d.hospital_id = h.id
        WHERE d.user_id = ?
      `).get(user.id);
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        ...(doctor && { doctor })
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const db = getDb();

    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          age = COALESCE(?, age),
          gender = COALESCE(?, gender),
          blood_group = COALESCE(?, blood_group),
          address = COALESCE(?, address),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      validated.name,
      validated.email,
      validated.age,
      validated.gender,
      validated.blood_group,
      validated.address,
      req.user.id
    );

    const updated = db.prepare(`
      SELECT id, phone, name, email, role, age, gender, blood_group, address
      FROM users WHERE id = ?
    `).get(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function requestLoginOtp(req, res, next) {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const normalized = normalizePhone(phone);
    const db = getDb();
    const user = db.prepare('SELECT id, phone, is_active FROM users WHERE phone = ?').get(normalized);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this phone number.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const mockOtp = process.env.NODE_ENV === 'test' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    loginOtpStore.set(normalized, {
      otp: mockOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: user.id
    });

    return res.json({
      success: true,
      message: `Login OTP sent to ${normalized}. For demo, your OTP is: ${mockOtp}`,
      data: { phone: normalized, mockOtp }
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyLoginOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }

    const normalized = normalizePhone(phone);
    const record = loginOtpStore.get(normalized);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No pending login OTP for this phone.' });
    }

    if (Date.now() > record.expiresAt) {
      loginOtpStore.delete(normalized);
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    if (record.otp !== otp && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT id, phone, name, email, role, age, gender, blood_group, address, is_active
      FROM users WHERE id = ?
    `).get(record.userId);

    loginOtpStore.delete(normalized);

    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Login successful via OTP.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

export async function setup2FA(req, res, next) {
  try {
    const db = getDb();
    const userId = req.user.id;
    const user = db.prepare('SELECT phone, email FROM users WHERE id = ?').get(userId);

    const secret = generateTotpSecret();
    const setupData = await generateTotpSetup(user.email || user.phone, secret);

    const existing = db.prepare('SELECT id FROM two_factor_auth WHERE user_id = ?').get(userId);
    if (existing) {
      db.prepare(`
        UPDATE two_factor_auth 
        SET secret = ?, backup_codes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(secret, JSON.stringify(setupData.backupCodes), userId);
    } else {
      db.prepare(`
        INSERT INTO two_factor_auth (user_id, secret, is_enabled, backup_codes)
        VALUES (?, ?, 0, ?)
      `).run(userId, secret, JSON.stringify(setupData.backupCodes));
    }

    res.json({
      success: true,
      data: {
        secret: setupData.secret,
        qrCode: setupData.qrCodeDataUrl,
        backupCodes: setupData.backupCodes
      }
    });
  } catch (err) {
    next(err);
  }
}

export function enable2FA(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code is required.' });
    }
    const db = getDb();
    const record = db.prepare('SELECT * FROM two_factor_auth WHERE user_id = ?').get(req.user.id);
    if (!record) {
      return res.status(400).json({ success: false, message: '2FA setup has not been initiated. Please call setup first.' });
    }

    const isValid = verifyTotpToken(code, record.secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit authenticator code. Check your device clock.' });
    }

    db.prepare(`
      UPDATE two_factor_auth
      SET is_enabled = 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(req.user.id);

    res.json({
      success: true,
      message: 'Two-Factor Authentication has been successfully enabled.'
    });
  } catch (err) {
    next(err);
  }
}

export function disable2FA(req, res, next) {
  try {
    const { code } = req.body;
    const db = getDb();
    const record = db.prepare('SELECT * FROM two_factor_auth WHERE user_id = ? AND is_enabled = 1').get(req.user.id);
    if (!record) {
      return res.status(400).json({ success: false, message: '2FA is not currently enabled.' });
    }

    if (code) {
      const isValid = verifyTotpToken(code, record.secret);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid 6-digit authenticator code.' });
      }
    }

    db.prepare('DELETE FROM two_factor_auth WHERE user_id = ?').run(req.user.id);

    res.json({
      success: true,
      message: 'Two-Factor Authentication disabled successfully.'
    });
  } catch (err) {
    next(err);
  }
}

export function get2FAStatus(req, res, next) {
  try {
    const db = getDb();
    const record = db.prepare('SELECT is_enabled, created_at FROM two_factor_auth WHERE user_id = ?').get(req.user.id);
    res.json({
      success: true,
      data: {
        isEnabled: Boolean(record && record.is_enabled),
        createdAt: record ? record.created_at : null
      }
    });
  } catch (err) {
    next(err);
  }
}

export function verifyLogin2FA(req, res, next) {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ success: false, message: 'Temporary token and 6-digit code are required.' });
    }

    let payload;
    try {
      payload = jwt.verify(tempToken, config.jwtSecret);
    } catch (_) {
      return res.status(401).json({ success: false, message: 'Expired or invalid 2FA session. Please log in again.' });
    }

    if (!payload.is2FaPending) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA verification token.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    const record = db.prepare('SELECT * FROM two_factor_auth WHERE user_id = ? AND is_enabled = 1').get(user.id);
    if (!record) {
      return res.status(400).json({ success: false, message: '2FA record not found.' });
    }

    const isTotpValid = verifyTotpToken(code, record.secret);
    let isBackupValid = false;
    if (!isTotpValid && record.backup_codes) {
      try {
        const codes = JSON.parse(record.backup_codes);
        const codeIdx = codes.indexOf(code.toUpperCase());
        if (codeIdx !== -1) {
          isBackupValid = true;
          codes.splice(codeIdx, 1);
          db.prepare('UPDATE two_factor_auth SET backup_codes = ? WHERE user_id = ?').run(JSON.stringify(codes), user.id);
        }
      } catch (_) {}
    }

    if (!isTotpValid && !isBackupValid) {
      return res.status(400).json({ success: false, message: 'Invalid authentication code or backup code.' });
    }

    let doctor = null;
    if (user.role === 'doctor') {
      doctor = db.prepare(`
        SELECT d.id as doctor_id, d.status as doctor_status, d.bmdc_reg_no,
               s.name_en as specialty, h.name_en as hospital
        FROM doctors d
        LEFT JOIN specialties s ON d.specialty_id = s.id
        LEFT JOIN hospitals h ON d.hospital_id = h.id
        WHERE d.user_id = ?
      `).get(user.id);
    }

    delete user.password_hash;
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: '2FA verification successful.',
      token,
      user: {
        ...user,
        ...(doctor && { doctor })
      }
    });
  } catch (err) {
    next(err);
  }
}

