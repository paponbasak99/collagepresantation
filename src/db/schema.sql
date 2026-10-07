-- DocBook Relational Database Schema
-- Compatible with SQLite (better-sqlite3) and easily portable to PostgreSQL

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient', 'receptionist')),
    avatar_url TEXT,
    age INTEGER,
    gender TEXT CHECK(gender IN ('MALE', 'FEMALE', 'OTHER')),
    blood_group TEXT,
    address TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SPECIALTIES
CREATE TABLE IF NOT EXISTS specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT NOT NULL UNIQUE,
    name_bn TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. HOSPITALS / CLINICS
CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    address_en TEXT NOT NULL,
    address_bn TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    specialty_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    bmdc_reg_no TEXT NOT NULL UNIQUE,
    qualifications TEXT NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    consultation_fee NUMERIC NOT NULL,
    follow_up_fee NUMERIC NOT NULL,
    bio_en TEXT,
    bio_bn TEXT,
    chamber_address TEXT NOT NULL,
    digital_signature TEXT,
    is_bmdc_verified INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'APPROVED' CHECK(status IN ('PENDING_APPROVAL', 'APPROVED', 'SUSPENDED')),
    rating_avg REAL NOT NULL DEFAULT 0.0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(specialty_id) REFERENCES specialties(id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
);

-- 5. DOCTOR WEEKLY SCHEDULES
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TEXT NOT NULL, -- "HH:MM" 24h
    end_time TEXT NOT NULL,   -- "HH:MM" 24h
    slot_duration_minutes INTEGER NOT NULL DEFAULT 15,
    break_start TEXT,
    break_end TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE(doctor_id, day_of_week)
);

-- 6. DOCTOR LEAVES
CREATE TABLE IF NOT EXISTS doctor_leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    leave_date TEXT NOT NULL, -- "YYYY-MM-DD"
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE(doctor_id, leave_date)
);

-- 7. TIME SLOTS (HARD UNIQUE CONSTRAINT PREVENTS DOUBLE-BOOKING)
CREATE TABLE IF NOT EXISTS time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    date TEXT NOT NULL,       -- "YYYY-MM-DD"
    start_time TEXT NOT NULL, -- "HH:MM"
    end_time TEXT NOT NULL,   -- "HH:MM"
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'HELD', 'BOOKED')),
    held_by_user_id INTEGER,
    held_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY(held_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(doctor_id, date, start_time)
);

-- 8. APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_number TEXT NOT NULL UNIQUE,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    serial_number INTEGER NOT NULL,
    patient_type TEXT NOT NULL CHECK(patient_type IN ('SELF', 'FAMILY')),
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_gender TEXT NOT NULL CHECK(patient_gender IN ('MALE', 'FEMALE', 'OTHER')),
    patient_relation TEXT,
    reason_for_visit TEXT NOT NULL,
    notes TEXT,
    is_emergency INTEGER NOT NULL DEFAULT 0,
    emergency_notes TEXT,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN (
        'PENDING_PAYMENT', 'CONFIRMED', 'ARRIVED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    )),
    fee_amount NUMERIC NOT NULL,
    cancellation_reason TEXT,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(slot_id) REFERENCES time_slots(id)
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    method TEXT NOT NULL CHECK(method IN ('BKASH', 'NAGAD', 'CASH_AT_CLINIC')),
    transaction_ref TEXT,
    idempotency_key TEXT,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    refund_amount NUMERIC DEFAULT 0.0,
    refund_percentage INTEGER DEFAULT 0,
    refund_reason TEXT,
    payment_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 10. PRESCRIPTIONS (ENCRYPTED SENSITIVE MEDICAL RECORD)
CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    advice TEXT,
    follow_up_date TEXT,
    digital_signature_seal TEXT,
    is_encrypted INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- 11. PRESCRIPTION ITEMS (MEDICATIONS)
CREATE TABLE IF NOT EXISTS prescription_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,        -- E.g. "1+0+1"
    instruction TEXT NOT NULL,   -- E.g. "After Meal"
    duration TEXT NOT NULL,      -- E.g. "7 Days"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 12. PRESCRIPTION TESTS
CREATE TABLE IF NOT EXISTS prescription_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 13. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    appointment_id INTEGER,
    type TEXT NOT NULL CHECK(type IN ('SMS', 'EMAIL', 'SYSTEM')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT' CHECK(status IN ('SENT', 'FAILED')),
    scheduled_for DATETIME,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(appointment_id) REFERENCES appointments(id)
);

-- 15. WAITLIST FOR CANCELLED SLOTS
CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    preferred_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK(status IN ('WAITING', 'NOTIFIED', 'BOOKED', 'EXPIRED')),
    notified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE(user_id, doctor_id, preferred_date)
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. PATIENT MEDICAL RECORDS & LAB REPORT VAULT (EHR)
CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DISCHARGE_SUMMARY', 'OTHER')),
    file_name TEXT NOT NULL,
    file_data TEXT NOT NULL, -- base64 or stored URL
    file_size INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL,
    test_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. DOCTOR DELAY & EMERGENCY BROADCASTS
CREATE TABLE IF NOT EXISTS doctor_broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    broadcast_date TEXT NOT NULL, -- "YYYY-MM-DD"
    delay_minutes INTEGER NOT NULL DEFAULT 0,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'RESOLVED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 19. TWO-FACTOR AUTHENTICATION (2FA / TOTP)
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    secret TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 0,
    backup_codes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 20. TELEMEDICINE WEBRTC SIGNALING RELAY
CREATE TABLE IF NOT EXISTS telemedicine_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    sender_user_id INTEGER NOT NULL,
    recipient_user_id INTEGER NOT NULL,
    signal_type TEXT NOT NULL CHECK(signal_type IN ('offer', 'answer', 'candidate', 'hangup')),
    signal_data TEXT NOT NULL,
    is_delivered INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- INDEXES FOR FAST FILTERING & SEARCH
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_doc_date ON time_slots(doctor_id, date, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_held ON time_slots(status, held_until);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_lookup ON waitlist(doctor_id, preferred_date, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot ON appointments(slot_id) WHERE status != 'CANCELLED';
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_broadcasts_date ON doctor_broadcasts(doctor_id, broadcast_date, status);
CREATE INDEX IF NOT EXISTS idx_telemed_signals_lookup ON telemedicine_signals(appointment_id, recipient_user_id, is_delivered);


