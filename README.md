# 🩺 DocBook — Doctor Appointment Booking & Clinic Management System

**DocBook** is an enterprise-grade, full-stack doctor appointment booking and outpatient department (OPD) clinic management platform. Built with zero frontend frameworks, pure vanilla HTML5, CSS3, and ES6+ JavaScript, powered by a high-performance Node.js (ES modules) backend with parameterized SQLite database transactions (with standard ANSI SQL schema easily switchable to PostgreSQL).

---

## 🌟 Key Highlights & Engineering Features

1. **AI Symptom Checker (English & বাংলা):**
   - Natural language clinical symptom analyzer supporting English and Bengali input with emergency red-flag triage detection (e.g., acute angina, stroke symptoms, respiratory distress).
   - Differential diagnosis suggestions, confidence metrics, and instant matching with verified active specialists.
   - Global modal accessible directly from the navbar across all views.

2. **Live Chamber Queue Tracking:**
   - Real-time patient OPD queue positioning (`SL - 01`, `SL - 02`, ...) displaying exact counts ("3 patients before you") and dynamic estimated wait time in minutes.
   - Interactive live widget on patient dashboard (`my-appointments.html`) with instant refresh.

3. **Emergency Priority Booking & Doctor Alerts:**
   - One-click priority triage booking for acute conditions with clinical triage notes.
   - Real-time high-priority SMS/system emergency alert dispatched directly to the attending doctor.

4. **Priority Cancellation Waitlist:**
   - Automated waitlist system allowing patients to queue for fully booked doctor dates.
   - Instant automated SMS notification dispatched to waiting patients the moment any existing appointment is cancelled or rescheduled.

5. **Official E-Prescription with Doctor Signature Seal & QR Code:**
   - Printable e-prescription (`/prescription-slip.html`) with digital physician signature seal, BMDC accreditation stamp, medication dosage tables, diagnostic test orders, and public verification QR code.

6. **Doctor BMDC Verification & Certification:**
   - Admin credential inspection modal verifying physician registration numbers against simulated Bangladesh Medical & Dental Council (BMDC) records before granting clinic privileges.

7. **Atomic Concurrency & Anti-Double-Booking Guarantee:**
   - Real-time **5-minute slot reservation holds** using Compare-And-Swap (CAS) atomic transactions.
   - Database-level unique constraints (`UNIQUE(doctor_id, date, start_time)` and partial index `appointments(slot_id) WHERE status != 'CANCELLED'`).
   - Stress-tested with 15 simultaneous parallel patient booking races where exactly 1 succeeds and 14 cleanly fail with HTTP 409 Conflict.
   - Background slot sweeper worker releases abandoned holds every 30 seconds.

8. **End-to-End Medical Data Encryption (AES-256-GCM) & Access Audit Logs:**
   - Sensitive clinical data (diagnoses, symptoms, advice) encrypted at rest in the database using authenticated AES-256-GCM (`enc:v1:`).
   - Strict audit trail logging every view of confidential medical records (`VIEW_MEDICAL_RECORD`).

9. **Security, Rate Limiting, CAPTCHA & OTP:**
   - Mathematical CAPTCHA with HMAC-signed tokens on registration to prevent bot signups.
   - Passwordless phone OTP login flow (`/api/auth/login-otp-request` & `/login-otp-verify`).
   - Idempotent payment verification and duplicate prevention using `Idempotency-Key` headers.

10. **PostgreSQL Production Migration:**
    - Zero-downtime automated database migrator (`node src/db/migrate-to-postgres.js` or `npm run db:migrate-postgres`) converting SQLite schemas to PostgreSQL with relational integrity and data transfer.

11. **Accessibility & Design System:**
    - Multi-level font sizing (Normal, Large `A+`, Extra Large `A++`) and High-Contrast mode switcher (`public/js/accessibility.js`).
    - Full keyboard navigation focus rings, mobile-first responsive layout, and bilingual (English/বাংলা) live translation.
    - Interactive SVG charts for daily consultations, revenue channels, top specialists, and peak hours.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, Vanilla CSS3 (Custom Design System & Tokens), Vanilla ES6+ JavaScript Modules |
| **Backend** | Node.js (v26 native ES Modules), Express.js |
| **Database** | SQLite via Node native `DatabaseSync` (`node:sqlite`) with WAL mode, prepared statements, and `BEGIN IMMEDIATE` transactions |
| **Authentication** | JWT (JSON Web Tokens) in HttpOnly cookies / headers, bcryptjs password hashing (12 salt rounds), mock SMS OTP |
| **Security & Validation** | Helmet CSP headers, Zod schemas, express-rate-limit, parameterized SQL queries, XSS sanitization |
| **Testing** | Node.js native test runner (`node:test`, `node:assert`), Supertest |

---

## 📂 Project Structure

```
Doctor Appointment Booking System/
├── public/                       # Frontend application (Zero UI frameworks)
│   ├── index.html                # Homepage: hero search, specialties, top doctors, how it works
│   ├── doctors.html              # Specialist directory with faceted sidebar filters & sorting
│   ├── doctor-profile.html       # Doctor profile, chamber details, reviews, live slot selection & hold
│   ├── booking.html              # Checkout with 5-minute countdown bar, fee breakdown, payment gateways
│   ├── appointment-slip.html     # Printable medical slip with sequential SL badge & dynamic QR code
│   ├── my-appointments.html      # Patient dashboard: upcoming, completed, cancelled, reschedule, view Rx
│   ├── login.html                # Auth modal: login, register, mock OTP, 1-click demo role logins
│   ├── doctor-panel.html         # Doctor workspace: live OPD queue, status updates, e-prescriptions, shifts
│   ├── reception-panel.html      # Front desk: practicing doctors, check-in, cash collection, walk-in tokens
│   ├── admin-dashboard.html      # Admin: KPIs, SVG charts, doctor verification, CRUD, CSV export, audit logs
│   ├── verify-slip.html          # Public verification landing page for scanned QR codes
│   ├── 404.html                  # Custom 404 error page
│   ├── robots.txt & sitemap.xml  # Search engine indexing configuration
│   ├── css/
│   │   ├── main.css              # Color tokens, typography, CSS resets, layout grid, print styles
│   │   └── components.css        # Buttons, cards, form inputs, badges, modals, countdown bar, tables
│   └── js/
│       ├── api.js                # Authenticated fetch wrapper & session storage
│       ├── i18n.js               # English and Bengali dictionaries & live translator
│       ├── navbar.js             # Reusable dynamic navigation header & footer
│       ├── theme.js              # Dark/Light mode switcher
│       └── toast.js              # Floating notification toast center
├── src/                          # Backend application
│   ├── app.js                    # Express app mounting middleware and routes
│   ├── server.js                 # HTTP server entrypoint, background slot sweeper, shutdown handlers
│   ├── config.js                 # Central environment configuration
│   ├── controllers/              # REST API controllers
│   ├── routes/                   # Express route definitions
│   ├── services/                 # Slot holds, booking transactions, cancellations, audit logger
│   ├── middleware/               # Auth (JWT, RBAC, medical privacy), rate limiters, central error handler
│   ├── db/                       # SQLite connection wrapper, schema.sql, init.js, seed.js
│   └── validators/               # Zod input validation schemas
├── tests/                        # Automated test suites (37 test cases)
├── PRD.md                        # Product Requirements Document
├── TRD.md                        # Technical Requirements Document
├── DESIGN.md                     # UI/UX Style Guide & Design System Specs
├── TASKS.md                      # Development roadmap & phase breakdown
├── DEPLOYMENT.md                 # Production deployment & PostgreSQL migration guide
├── package.json
├── .env & .env.example
```

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with active demo accounts for all roles:

| Role | Phone | Password | Access & Capabilities |
|---|---|---|---|
| **Admin** | `01700000001` | `Admin@1234` | Full system KPI analytics, doctor verification, entity CRUD, CSV exports, audit logs |
| **Doctor** | `01700000002` | `Doctor@1234` | Chamber OPD queue, status call-in, digital prescription writer, schedule & leaves, earnings |
| **Receptionist** | `01700000003` | `Reception@1234` | Practicing doctors desk, arrival check-in, cash collection, walk-in appointment ticketing |
| **Patient** | `01700000004` | `Patient@1234` | Booking appointments, slot reservations, cancellation/reschedule, prescriptions, reviews |

*(Note: On `/login.html`, click any of the 4 demo role buttons to instantly log in without typing!)*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher (v26 recommended)
- **npm**: v9 or higher

### Installation
1. Clone or navigate to the project directory:
   ```bash
   cd "Doctor Appointment Booking System"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize and seed the database:
   ```bash
   npm run db:init
   npm run db:seed
   ```

4. Run the automated test suite:
   ```bash
   npm test
   ```
   *(All 37 test cases across auth, doctor catalog, CAS concurrency race conditions, QR slips, doctor portal, reception desk, admin dashboard, and HIPAA-style access control will execute).*

5. Start the development server:
   ```bash
   npm start
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 Automated Testing Verification

DocBook includes automated tests covering all critical paths:

```bash
npm test
```

### Test Suites Included (45 Automated Tests):
- `tests/auth.test.js`: Registration, OTP verification, login, JWT validation, bad password rejection.
- `tests/doctor.test.js`: Specialties, hospitals, search by doctor name/specialty/hospital, fee slider, doctor profiles.
- `tests/booking.test.js`: 5-minute atomic slot hold, **15 simultaneous patient race condition stress test**, bKash payment booking, 90% refund cancellation, slot rescheduling.
- `tests/slip.test.js`: Dynamic QR code generation, sequential serial formatting (`SL - 01`), public verification endpoint `/api/appointments/verify/:number`.
- `tests/doctor_portal.test.js`: OPD queue viewing, patient status transitions (`IN_CONSULTATION`), digital prescription creation, doctor earnings reports.
- `tests/reception.test.js`: Practicing doctors today, patient lobby arrival check-in, cash collection, walk-in booking.
- `tests/admin.test.js`: KPI metrics, chart datasets, pending doctor BMDC approvals, CSV exports, security audit logs.
- `tests/access_control.test.js`: Medical record confidentiality enforcement (prescriptions viewable only by patient, prescribing doctor, and admin; receptionist and other patients denied with 403).
- `tests/new_features.test.js`: AI symptom checker in English & Bengali, mathematical CAPTCHA validation on registration, emergency triage bookings with instant doctor notification, live queue positions and wait time calculations, automated waitlist cancellation alerts, AES-256-GCM prescription encryption & audit logging, BMDC registry verification & certifying approvals.

---

## 🛡️ Security & Performance

- **Rate Limiting:** Protects `/api/auth` (15 req/15min) and booking routes against brute-force and scraping.
- **SQL Injection Prevention:** 100% of SQL statements use parameterized prepared statements.
- **Strict Content Security Policy (CSP):** Helmet configured with trusted origins for fonts, scripts, and images.
- **CSRF & XSS Mitigation:** Sanitized HTML inputs, HttpOnly cookies, and strict CORS configuration.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
