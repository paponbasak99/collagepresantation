# DocBook — Implementation Roadmap & Tasks (TASKS.md)

This document outlines the systematic, phased implementation plan for **DocBook**. All phases have been implemented, upgraded, and verified through automated test suites (45/45 passing).

---

## Phase 1: Project Initialization, Database Architecture & Seeding
- [x] **1.1 Project Structure Setup**
  - Initialize Node.js project (`package.json`) with ES modules (`type: "module"`), Node 22+ engine constraint.
  - Dependencies configured: `express`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `zod`, `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `qrcode`.
  - Development tools: `supertest`, Node native test runner (`node:test`).
  - Configured `.env` and `.env.example` with `ENCRYPTION_KEY`.
- [x] **1.2 Database Schema & Connection Engine**
  - Implement SQLite database connection in `src/db/connection.js` with WAL mode, foreign keys, synchronous transaction wrapper, and cleanup handlers.
  - Implement DDL schema generator in `src/db/schema.sql` and `src/db/init.js`.
  - Atomic zero-downtime backup script in `src/db/backup.js` via `VACUUM INTO`.
- [x] **1.3 Seed Data Script**
  - Create `src/db/seed.js` with realistic clinical seed data:
    * 24 medical specialties with bilingual English & Bengali names.
    * 15 Dinajpur hospitals and diagnostic centers.
    * Demo accounts for all roles (Admin, Doctor, Receptionist, Patient).
    * Doctor profiles with BMDC registration, qualifications, consultation fees, and weekly schedules.
    * Sample appointments, payments, and reviews.

---

## Phase 2: Core Server, Security, Authentication & RBAC
- [x] **2.1 Express Application Bootstrap & Security Hardening**
  - Setup Express app in `src/app.js` and server entrypoint in `src/server.js`.
  - Configure `helmet`, CORS, body parsers, uncaught exception handlers, and graceful shutdown.
  - Configure rate limiters: global API limiter, strict auth limiter, and booking limiter in `src/middleware/rateLimiter.js`.
- [x] **2.2 Authentication & OTP Engine**
  - Implement `src/controllers/authController.js` and `src/routes/authRoutes.js`.
  - Phone + password registration with bcrypt password hashing (12 rounds) and CAPTCHA verification.
  - Mock OTP generation & verification system.
  - JWT token generation and verification with secure expiration.
- [x] **2.3 RBAC & Authorization Middlewares**
  - Implement `src/middleware/auth.js` (`requireAuth`, `requireRole(['admin', 'doctor', ...])`).
  - Implement medical data privacy guard (`canAccessPatientMedicalData`).

---

## Phase 3: Doctor Catalog, Specialties, Search & Filter API
- [x] **3.1 Specialties & Hospitals Endpoints**
  - Public routes for listing specialties and clinic locations.
- [x] **3.2 Doctor Search & Filter Engine**
  - Advanced SQL query builder supporting:
    * Search query (doctor name, bio, qualifications).
    * Specialty filter.
    * Hospital / location filter.
    * Fee range (min/max).
    * Minimum rating filter.
    * Date availability filter.
    * Dynamic sorting (rating, fee, experience).
- [x] **3.3 Doctor Public Profile & Reviews API**
  - Fetch detailed doctor profile including BMDC badge, chamber schedule, and patient ratings.

---

## Phase 4: Slot Generation, Concurrency Locking & 5-Min Hold System
- [x] **4.1 Dynamic Slot Generation Engine**
  - Service to generate daily time slots on-demand based on doctor's active weekly schedule and leaves.
  - Enforce `UNIQUE(doctor_id, date, start_time)` in SQLite schema.
- [x] **4.2 Atomic 5-Minute Hold Mechanism**
  - Implement `POST /api/slots/:id/hold`:
    * Atomically updates slot to `HELD` with `held_by_user_id` and `held_until = datetime('now', '+5 minutes')`.
    * Handles conflict gracefully (HTTP 409) if already held or booked.
  - Implement `POST /api/slots/:id/release`: Allows user or frontend to release slot.
  - Background sweeper in `src/services/slotService.js` that runs every 30s to return expired held slots to `AVAILABLE`.
- [x] **4.3 Appointment Booking Transaction**
  - Implement `POST /api/appointments/book`:
    * Runs within an immediate SQLite transaction.
    * Verifies that the slot is held by the authenticated user and has not expired.
    * Sets slot status to `BOOKED`.
    * Computes sequential `serial_number` for the doctor's shift.
    * Inserts record into `appointments` and creates linked `payments` record.

---

## Phase 5: Payment Processing & Tiered Refund Cancellation
- [x] **5.1 Payment Processing Engine**
  - Implement `POST /api/payments/process`:
    * Mock bKash gateway verification (validates mock wallet number, OTP, PIN).
    * Mock Nagad gateway verification.
    * Pay at Clinic handling (marks payment as `PENDING` with appointment `CONFIRMED`).
    * Failure handling: If payment fails, slot is immediately freed.
- [x] **5.2 Tiered Refund Cancellation Engine**
  - Implement `POST /api/appointments/:id/cancel`:
    * Checks time delta between current time and scheduled appointment slot:
      - `> 24 hours`: 90% refund (10% platform fee deducted).
      - `6 - 24 hours`: 50% refund.
      - `< 6 hours`: 0% refund (no refund).
    * Updates appointment to `CANCELLED`, payment to `REFUNDED` (with exact refund amount logged), and releases slot to `AVAILABLE`.
- [x] **5.3 Reschedule Engine**
  - Implement `POST /api/appointments/:id/reschedule` allowing date/time change to an available slot.

---

## Phase 6: Appointment Slip, Dynamic QR Code & Printable PDF
- [x] **6.1 Appointment Slip API**
  - Return complete slip data: serial number (e.g., `SL-04`), doctor details, chamber address, patient details, reporting time, and payment status.
- [x] **6.2 Dynamic QR Code Generation**
  - Generate base64 DataURI QR code using `qrcode` package pointing to verification URL.
- [x] **6.3 Verification Endpoint**
  - Public endpoint `/api/appointments/verify/:number` allowing clinic staff to scan and confirm validity.
- [x] **6.4 Printable / PDF Stylesheet**
  - Dedicated print stylesheet (`@media print`) rendering a crisp, professional 80mm/A4 appointment slip.

---

## Phase 7: Doctor Outpatient Panel & Digital Prescriptions
- [x] **7.1 Live Queue Management**
  - Today's appointment queue with state transitions: `ARRIVED`, `IN_CONSULTATION`, `COMPLETED`, `NO_SHOW`.
- [x] **7.2 Schedule & Leave Management**
  - Doctor endpoints to configure weekly shifts, slot durations, break times, and block leave dates.
- [x] **7.3 Digital E-Prescription System**
  - Complete Rx creation: Diagnosis, symptoms, medication list (name, dosage, instruction, duration), diagnostic tests, advice, follow-up date.
  - Patient past prescription timeline lookup with strict role access checks.
- [x] **7.4 Consultation Earnings & Statistics**
  - Aggregated consultation revenue and patient count by day, week, and month.

---

## Phase 8: Receptionist Front-Desk Portal
- [x] **8.1 Live Waiting Room Desk**
  - Multi-doctor queue viewer with real-time patient check-in buttons (`Mark Arrived`).
- [x] **8.2 Walk-in & Telephone Quick Booking**
  - Front-desk booking interface to quickly schedule patients, collect cash, and print instant serial slips.
- [x] **8.3 Cash Collection**
  - Update `Pay at Clinic` pending payments to `PAID`.

---

## Phase 9: Admin Dashboard, Analytics, Entity CRUD & Audit Logs
- [x] **9.1 Executive Dashboard Metrics & Visual Charts**
  - Analytics API: Total revenue, total appointments, active doctors, no-show rate, cancellation rate.
  - Trend datasets: daily appointments volume, revenue by method, peak hours, doctor performance.
- [x] **9.2 Doctor Approval & Verification Workflow**
  - Review pending doctor registrations, verify BMDC credentials, approve or suspend accounts.
- [x] **9.3 Entity CRUD**
  - Full management of Specialties, Hospitals, Doctor Fees, Schedules, and User Roles.
- [x] **9.4 CSV Export & Audit Logging**
  - CSV export for appointment rosters, transaction ledgers, and doctor statistics.
  - Audit logging middleware recording admin actions with timestamps, IP addresses, and payload diffs.

---

## Phase 10: Complete Frontend Application & UI/UX Polish
- [x] **10.1 Core Frontend Framework & Design System**
  - Modern, responsive Vanilla CSS (`public/css/main.css`, `public/css/components.css`).
  - Light & Dark mode toggle with zero flicker (`public/js/theme.js`).
  - Full English & Bengali internationalization dictionary (`public/js/i18n.js`).
  - Reusable toast notification system (`public/js/toast.js`).
  - API client wrapper with JWT token handling (`public/js/api.js`).
- [x] **10.2 Patient Interface Pages**
  - Home page (`index.html`) with hero search, specialty pills, featured doctors, how-it-works.
  - Doctor catalog & filter page (`doctors.html`).
  - Doctor profile & booking page (`doctor-profile.html`).
  - Booking & 5-minute countdown hold modal.
  - Interactive payment modals (bKash, Nagad, Cash).
  - Appointment slip view (`appointment-slip.html`) with QR code & print button.
  - My Appointments & Prescriptions dashboard (`my-appointments.html`).
  - Patient review submission modal.
  - Login & Registration modal / page (`login.html`) with mock OTP display.
- [x] **10.3 Role-Specific Portals**
  - Doctor Outpatient Portal (`doctor-panel.html`): live queue, status controls, e-prescription modal, schedule manager, earnings.
  - Receptionist Desk (`reception-panel.html`): walk-in booking drawer, arrival check-in, cash collection.
  - Admin Dashboard (`admin-dashboard.html`): KPI metrics, interactive SVG charts, doctor approvals, entity CRUD, CSV downloads, audit trail.
  - 404 Error page (`404.html`).

---

## Phase 11: Comprehensive Automated Testing Suite
- [x] **11.1 Concurrency & Double-Booking Stress Test**
  - Simultaneous race condition test: 50 concurrent requests attempting to hold/book the exact same time slot. Verify only 1 succeeds and 49 receive HTTP 409 Conflict.
- [x] **11.2 Authentication & RBAC Test**
  - Register, OTP verification, JWT login, and permission enforcement for patient, doctor, receptionist, and admin.
- [x] **11.3 Booking & 5-Minute Hold Lifecycle Test**
  - Slot hold, expiration release, and booking finalization.
- [x] **11.4 Tiered Refund Rules Test**
  - Test >24h cancellation (90%), 6-24h cancellation (50%), and <6h cancellation (0%).
- [x] **11.5 Medical Records Privacy Test**
  - Ensure unauthorized users and receptionists cannot access private prescriptions.

---

## Phase 12: Production Readiness, SEO & Documentation
- [x] **12.1 SEO & Meta Polish**
  - `sitemap.xml`, `robots.txt`, Open Graph social cards, favicon, meta descriptions.
- [x] **12.2 Documentation & Config**
  - Comprehensive `README.md` with setup steps, default credentials, API documentation, and testing guide.
  - `DEPLOYMENT.md` for production hosting with Node.js and PM2 / Docker / PostgreSQL migration instructions.
  - Final `.env.example` validation with production secret security guards.
  - Docker containerization (`Dockerfile`, `docker-compose.yml`), PM2 configuration (`ecosystem.config.cjs`), and GitHub Actions CI workflow.
