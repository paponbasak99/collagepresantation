# DocBook — Technical Requirements Document (TRD)

## 1. System Architecture Overview

DocBook is architected as a lightweight, high-performance web platform combining a modular **Node.js + Express** REST API backend with a clean, decoupled **Vanilla HTML5/CSS3/JavaScript (ES6+)** frontend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Browser (Frontend)                     │
│  - Vanilla JS SPA/MPA Router     - Responsive CSS3 + Dark Mode Engine  │
│  - Internationalization (EN/BN)  - QR Code & Print Engine              │
│  - State & Session Storage       - Real-time Slot Countdown Timer      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Express.js Application Layer                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security Middlewares: Helmet, Rate Limiter, CORS, XSS Sanitize   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Authentication & Authorization: JWT, Bcrypt, RBAC Guard          │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Zod Input Validation Layer (Strict Schema Checking)              │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Controllers & Business Services (Booking, Payments, Rx, Queue)   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Background Tasks: Slot Hold Sweeper & Notification Dispatcher    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ Parameterized Queries & Transactions
┌─────────────────────────────────────▼──────────────────────────────────┐
│                   Database Engine: SQLite (better-sqlite3)             │
│  - WAL (Write-Ahead Logging) Mode for maximum concurrency              │
│  - Foreign Key constraints enabled (`PRAGMA foreign_keys = ON`)       │
│  - ACID Transactions (`db.transaction()`) with immediate lock          │
│  - Explicit ANSI SQL structure (1:1 drop-in compatibility with PG)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema & Data Models

The database uses SQLite via `better-sqlite3` configured with `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;`. All table definitions strictly adhere to relational standards so that transitioning to PostgreSQL requires only replacing the driver with `pg` / `knex` / `pg-promise`.

### 2.1 Complete Relational Table Definitions

```sql
-- 1. USERS TABLE
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

-- 2. SPECIALTIES TABLE
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

-- 3. HOSPITALS / CLINICS TABLE
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

-- 4. DOCTORS TABLE
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
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('PENDING_APPROVAL', 'APPROVED', 'SUSPENDED')),
    rating_avg REAL NOT NULL DEFAULT 0.0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(specialty_id) REFERENCES specialties(id),
    FOREIGN KEY(hospital_id) REFERENCES hospitals(id)
);

-- 5. DOCTOR WEEKLY SCHEDULES TABLE
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

-- 6. DOCTOR LEAVES TABLE
CREATE TABLE IF NOT EXISTS doctor_leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    leave_date TEXT NOT NULL, -- "YYYY-MM-DD"
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE(doctor_id, leave_date)
);

-- 7. TIME SLOTS TABLE (CRITICAL CONCURRENCY ANCHOR)
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
    UNIQUE(doctor_id, date, start_time) -- HARD DATABASE-LEVEL DOUBLE-BOOKING PREVENTION
);

-- 8. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_number TEXT NOT NULL UNIQUE, -- E.g. "APT-20261005-0012"
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL UNIQUE,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    serial_number INTEGER NOT NULL, -- Sequential serial for the doctor's shift
    patient_type TEXT NOT NULL CHECK(patient_type IN ('SELF', 'FAMILY')),
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_age INTEGER NOT NULL,
    patient_gender TEXT NOT NULL CHECK(patient_gender IN ('MALE', 'FEMALE', 'OTHER')),
    patient_relation TEXT, -- "Self", "Spouse", "Child", "Parent", etc.
    reason_for_visit TEXT NOT NULL,
    notes TEXT,
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

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    method TEXT NOT NULL CHECK(method IN ('BKASH', 'NAGAD', 'CASH_AT_CLINIC')),
    transaction_ref TEXT,
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

-- 10. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL UNIQUE,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    diagnosis TEXT NOT NULL,
    symptoms TEXT,
    advice TEXT,
    follow_up_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- 11. PRESCRIPTION ITEMS TABLE
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

-- 12. PRESCRIPTION TESTS TABLE
CREATE TABLE IF NOT EXISTS prescription_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- 13. REVIEWS TABLE
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

-- 14. NOTIFICATIONS LOG TABLE
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

-- 15. AUDIT LOGS TABLE
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
```

### 2.2 Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_doc_date ON time_slots(doctor_id, date, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_held ON time_slots(status, held_until);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);
```

---

## 3. Concurrency Control & Double-Booking Prevention

### 3.1 The 5-Minute Slot Hold Lifecycle
To deliver a stress-free checkout experience while strictly protecting schedule integrity, DocBook applies a two-phase reservation pattern:
1. **Phase 1: Temporary Hold (`HELD`)**
   - When a patient selects an available slot, the client calls `POST /api/slots/:id/hold`.
   - The server initiates an immediate atomic SQLite transaction:
     ```sql
     UPDATE time_slots 
     SET status = 'HELD', 
         held_by_user_id = :userId, 
         held_until = datetime('now', '+5 minutes')
     WHERE id = :slotId 
       AND (status = 'AVAILABLE' OR (status = 'HELD' AND held_until < datetime('now')));
     ```
   - If `changes === 0`, another patient has locked the slot; the transaction fails with HTTP 409 Conflict.
   - If `changes === 1`, the hold is locked for 5 minutes (`300` seconds). The client starts the live visual countdown.

2. **Phase 2: Confirmation / Booking (`BOOKED`)**
   - The user submits booking details and chooses payment mode (`POST /api/appointments/book`).
   - The server verifies inside a single atomic transaction:
     * The slot belongs to `held_by_user_id = :userId`.
     * The `held_until >= datetime('now')`.
     * Update `status = 'BOOKED'`.
     * Calculate sequential `serial_number` for that doctor on that date:
       `SELECT COALESCE(MAX(serial_number), 0) + 1 FROM appointments WHERE doctor_id = :doctorId AND date = :date`.
     * Insert into `appointments` with unique constraint on `slot_id`.
     * Insert corresponding record into `payments`.

3. **Phase 3: Auto-Release Mechanism**
   - A background cleanup timer runs every 60 seconds executing:
     ```sql
     UPDATE time_slots 
     SET status = 'AVAILABLE', held_by_user_id = NULL, held_until = NULL 
     WHERE status = 'HELD' AND held_until < datetime('now');
     ```
   - Furthermore, all slot fetch queries dynamically treat expired held slots as available:
     ```sql
     CASE 
       WHEN status = 'HELD' AND held_until < datetime('now') THEN 'AVAILABLE'
       ELSE status 
     END AS effective_status
     ```

---

## 4. REST API Endpoint Specifications

### 4.1 Authentication & Profile (`/api/auth`)
- `POST /api/auth/register`: Register new user with phone, name, password, role. Issues mock OTP.
- `POST /api/auth/verify-otp`: Validate 6-digit mock OTP to activate account.
- `POST /api/auth/login`: Authenticate with phone & password; returns JWT token + user profile.
- `GET /api/auth/me`: Fetch authenticated user profile & role.
- `PUT /api/auth/profile`: Update personal info (name, age, gender, blood group, address).

### 4.2 Doctors & Search (`/api/doctors`)
- `GET /api/doctors`: Filterable doctor directory:
  - Query params: `search`, `specialty_id`, `hospital_id`, `city`, `min_fee`, `max_fee`, `min_rating`, `date`, `sort`.
- `GET /api/doctors/:id`: Complete doctor public profile with credentials, hospital chamber, review summary, and weekly working hours.
- `GET /api/doctors/:id/reviews`: Paginated reviews list with ratings and comments.

### 4.3 Specialties & Hospitals (`/api/specialties`, `/api/hospitals`)
- `GET /api/specialties`: List all active clinical specialties with bilingual names and icons.
- `GET /api/hospitals`: List all clinics and hospitals with locations and cities.

### 4.4 Slots & Scheduling (`/api/slots`)
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD`: Retrieve all slots for doctor on date (generates dynamic slots from weekly schedule if not yet instantiated).
- `POST /api/slots/:id/hold`: Atomically acquire 5-minute hold on a slot.
- `POST /api/slots/:id/release`: Manually release held slot (e.g. if patient leaves checkout).

### 4.5 Appointments (`/api/appointments`)
- `POST /api/appointments/book`: Convert held slot into confirmed appointment. Validates server-side doctor fee.
- `GET /api/appointments/my`: Get current patient's appointments (filtered by `upcoming`, `completed`, `cancelled`).
- `GET /api/appointments/:id`: Retrieve single appointment with full doctor, hospital, payment, and serial details.
- `GET /api/appointments/:id/slip`: Generate appointment slip data payload with QR verification token.
- `POST /api/appointments/:id/cancel`: Cancel appointment, apply refund formula, release slot.
- `POST /api/appointments/:id/reschedule`: Change to another available slot of the same doctor.

### 4.6 Payments & Refund Engine (`/api/payments`)
- `POST /api/payments/process`: Simulate bKash or Nagad payment gateway (validates mock OTP & PIN) or mark as Cash at Clinic.
- `GET /api/payments/:appointmentId`: Inspect payment status and refund breakdown.

### 4.7 Medical Prescriptions (`/api/prescriptions`)
- `POST /api/prescriptions`: Doctor creates digital prescription with medications, dosages, tests, and advice.
- `GET /api/prescriptions/appointment/:appointmentId`: Fetch prescription for a specific visit.
- `GET /api/prescriptions/patient/:patientId`: Medical history timeline (restricted to patient, consulting doctor, admin).

### 4.8 Reviews (`/api/reviews`)
- `POST /api/reviews`: Submit rating (1-5) and feedback for a completed visit.

### 4.9 Doctor Portal (`/api/doctor-portal`)
- `GET /api/doctor-portal/today-queue`: Live queue for today's consultations with status filters.
- `PUT /api/doctor-portal/queue/:appointmentId/status`: Transition patient status: `ARRIVED`, `IN_CONSULTATION`, `COMPLETED`, `NO_SHOW`.
- `GET /api/doctor-portal/schedule`: View weekly recurring schedule.
- `POST /api/doctor-portal/schedule`: Update shifts, slot duration, break times.
- `POST /api/doctor-portal/leaves`: Add / delete leave dates.
- `GET /api/doctor-portal/earnings`: Financial analytics and consultation tally.

### 4.10 Receptionist Portal (`/api/reception`)
- `GET /api/reception/doctors-today`: List of doctors with chambers open today.
- `GET /api/reception/queue?doctorId=...`: Live clinic queue display.
- `POST /api/reception/walk-in-booking`: Rapid book for walk-in patient with cash payment collection.
- `PUT /api/reception/appointment/:id/collect-cash`: Confirm cash payment received at clinic.
- `PUT /api/reception/appointment/:id/mark-arrived`: Mark patient physically present in lobby.

### 4.11 Admin Portal (`/api/admin`)
- `GET /api/admin/dashboard`: Aggregate KPI metrics: Total revenue, total appointments, active doctors, cancellation rate.
- `GET /api/admin/charts`: Trend data for charts (Daily appointments, revenue by mode, busiest hours, doctor load).
- `GET /api/admin/export/:entity`: CSV export for appointments, payments, or doctor stats.
- `GET /api/admin/doctors/pending`: Doctor registrations awaiting approval.
- `PUT /api/admin/doctors/:id/approve`: Approve doctor credentials.
- `PUT /api/admin/doctors/:id/suspend`: Suspend doctor access.
- `POST/PUT/DELETE /api/admin/specialties`: Manage medical specialties.
- `POST/PUT/DELETE /api/admin/hospitals`: Manage hospitals and clinics.
- `GET /api/admin/audit-logs`: Paginated security and transaction audit logs.

---

## 5. Security & Validation Architecture

1. **Password Security:**
   - Salted hashing using `bcryptjs` with cost factor 12. Passwords stripped from all JSON responses.
2. **JWT Authentication:**
   - Signed with `HS256` using secure `JWT_SECRET`.
   - Carries `{ userId, phone, role, name }`. Expiration set to 7 days.
3. **Role-Based Access Control (RBAC):**
   - Middleware `requireAuth`: Verifies token validity.
   - Middleware `requireRole('admin', 'doctor', ...)`: Restricts endpoints to authorized roles.
   - Medical Privacy Guard: Enforces `req.user.id === patientId || req.user.role === 'admin' || isConsultingDoctor`.
4. **Rate Limiting:**
   - Global rate limiter: 150 requests per minute per IP.
   - Auth & OTP limiter: 10 requests per 15 minutes per IP to block brute-force attempts.
   - Slot hold limiter: 30 requests per minute per IP.
5. **Helmet & Security Headers:**
   - Content Security Policy (CSP), anti-clickjacking (`X-Frame-Options`), MIME-sniffing protection (`X-Content-Type-Options`).
6. **Input Validation:**
   - Zod schemas enforce type safety, regex patterns for Bangladesh phone numbers (`^(?:\+88|88)?01[3-9]\d{8}$`), string lengths, and numeric ranges.
