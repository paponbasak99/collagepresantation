# DocBook — Product Requirements Document (PRD)

## 1. Product Overview & Vision
**DocBook** is an enterprise-grade, comprehensive healthcare appointment scheduling and clinic operations platform. Designed for patients, doctors, clinic receptionists, and hospital administrators, DocBook simplifies the entire healthcare delivery pipeline: from discovering vetted specialists to securing locked time slots, handling online (bKash/Nagad) and offline payments, managing real-time clinic queues, issuing digital prescriptions, and running clinic analytics.

### Core Value Propositions
- **For Patients:** Instant discovery of doctors by specialty, chamber, fee, and availability; zero-collision slot booking with 5-minute temporary reservation holds; flexible payments (bKash, Nagad, or Cash at Clinic); instant downloadable appointment slips with dynamic verification QR codes; and transparent tiered cancellation refunds.
- **For Doctors:** Flexible weekly schedule and break configuration; real-time outpatient department (OPD) queue management; rich digital prescription authoring with instant patient medical history lookup; and comprehensive consultation earnings insights.
- **For Receptionists:** Streamlined walk-in and phone appointment booking; live patient arrival verification; queue ordering; and fast cash collection.
- **For Administrators:** Centralized doctor credential verification (BMDC registration checks); full CRUD control over clinical entities; high-level executive dashboard with real-time financial and operational metrics; automated CSV exports; and immutable security audit logs.

---

## 2. User Roles & Permission Matrix

| Feature / Action | Patient | Doctor | Receptionist | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Register & Login (Phone + Password + OTP)** | Yes | Yes (Pending Approval) | By Admin | By System |
| **Search Doctors & Browse Profiles** | Yes | Yes | Yes | Yes |
| **Hold & Book Appointment (Self / Family)** | Yes | No | Yes (Walk-in/Phone) | Yes |
| **Cancel / Reschedule Appointment** | Own Only | Own Queue | Yes | Yes |
| **Process Payment (bKash / Nagad / Clinic)** | Own | No | Yes (Clinic Cash) | Yes (Refunds) |
| **View / Print Appointment Slip & QR** | Own | Yes | Yes | Yes |
| **Doctor Schedule & Leave Management** | No | Own | No | All Doctors |
| **Live Consultation Queue & Status Update** | View Turn | Manage Own | Manage Clinic | View All |
| **Write & Issue Digital Prescriptions** | No | Own Patients | No | View Only |
| **View Medical History & Past Prescriptions** | Own Only | Consulted Patients | No | Audit Access |
| **Submit Doctor Review & Rating** | Verified Only | No | No | Moderation |
| **Doctor Approval / Verification** | No | No | No | Yes |
| **Analytics Dashboard & CSV Export** | No | Own Earnings | Queue Stats | Full Metrics |
| **System Audit Logs** | No | No | No | Full Access |

---

## 3. Detailed Functional Requirements

### 3.1 Patient Module
1. **Authentication & Profile:**
   - Phone number and password authentication.
   - Mock SMS OTP verification system for account registration and password resets (OTP prefilled in demo mode / displayed in UI notification for easy testing).
   - Profile management: Full name, phone, age, gender, blood group, address, emergency contact.
2. **Doctor Discovery & Search:**
   - Multi-criteria search filter: Doctor Name, Medical Specialty, Hospital/Clinic, District/Location, Consultation Fee range, Minimum Rating, and Availability (Today, Tomorrow, Specific Date).
   - Dynamic sorting: Top Rated, Lowest Fee, Most Experienced, Earliest Available.
3. **Doctor Profile Page:**
   - Professional details: Verified BMDC registration badge, qualifications (e.g., MBBS, FCPS, MD), years of clinical experience, bio, consultation & follow-up fees.
   - Chamber information: Clinic name, physical address, contact telephone, directions.
   - Patient reviews and average rating score with breakdown.
   - Interactive schedule calendar showing real-time slot availability grouped by session (Morning, Afternoon, Evening).
4. **Slot Locking & Booking Flow:**
   - 5-minute atomic slot reservation hold with live visual countdown timer.
   - If user does not complete checkout within 5 minutes, the slot is automatically released back to the pool.
   - Option to book for "Self" or "Family Member" (capturing patient name, age, gender, relation, and visit reason).
   - Medical notes attachment for the doctor.
5. **Payment Processing:**
   - **bKash & Nagad Online Checkout:** Interactive sandbox modal replicating the mobile financial service (MFS) payment flow (mock wallet number, mock OTP, mock PIN) with immediate verification.
   - **Pay at Clinic (Cash):** Generates a confirmed appointment with payment marked as `PENDING`, to be collected by reception upon arrival.
   - Real-time status update: `PENDING`, `CONFIRMED`, `FAILED` (releases held slot).
6. **Appointment Slip & QR Verification:**
   - Formatted printable token containing: Appointment ID, Serial Number (e.g. SL-04), Patient Details, Doctor Details, Chamber Address, Reporting Time, Payment Status, and Barcode/QR Code.
   - Dynamic QR code encodes the verification URL (`/verify-slip?id=...`), allowing clinic reception or doctors to scan with any smartphone camera to view instant validity.
   - One-click PDF download / Print stylesheet optimization.
7. **Appointment Management & Tiered Refund Cancellation:**
   - Tabbed view: `Upcoming`, `Completed`, `Cancelled`.
   - Cancellation with automated refund calculation:
     * **> 24 hours prior to appointment:** 90% refund (10% processing fee).
     * **6 to 24 hours prior to appointment:** 50% refund.
     * **< 6 hours prior to appointment:** 0% refund (No refund).
   - Reschedule feature: Re-allocates to another available slot of the same doctor at no extra charge if > 6 hours in advance.
8. **Medical History & Digital Prescriptions:**
   - Secure patient repository containing all digital prescriptions issued across appointments.
   - View diagnosis, prescribed medications with dosage schedules, diagnostic tests recommended, and doctor advice.
   - Printable / downloadable PDF prescription format.
9. **Doctor Rating & Reviews:**
   - Verified patient reviews: Patients can only submit a 1 to 5 star rating with text review after an appointment is marked `COMPLETED`.
   - One review per completed appointment.
10. **Automated Reminders:**
    - Simulated background notification engine sending SMS and email alerts 24 hours and 2 hours before the scheduled appointment.

### 3.2 Doctor Module
1. **Schedule & Availability Setup:**
   - Weekly recurring schedule builder: Select active days of week (0-6), shift start time, shift end time, consultation slot duration (e.g. 15, 20, 30 mins), and lunch/break windows.
   - Leave & Vacation manager: Block out specific calendar dates or date ranges.
2. **Live Clinic Queue (OPD Consultation Desk):**
   - Real-time today's patient queue list showing token/serial numbers, patient name, arrival time, and payment status.
   - Dynamic workflow state triggers:
     * `Mark Arrived` -> Patient checked in by reception or doctor.
     * `Call In / In-Consultation` -> Patient enters consultation room.
     * `Complete Visit` -> Concludes consultation and prompts digital prescription creation.
     * `Mark No-Show` -> Patient failed to attend.
3. **Digital Prescription Suite:**
   - Structured Rx creation interface:
     * Clinical diagnosis & presenting symptoms.
     * Medications list: Drug name, strength, dosage schedule (e.g., 1+0+1, 0+1+0), meal relation (Before / After meal), duration in days.
     * Recommended diagnostic tests (e.g., CBC, Serum Creatinine, ECG, Chest X-ray).
     * Lifestyle, dietary, and general clinical advice.
     * Follow-up date picker.
   - Instant sidebar to view the patient's previous prescriptions and visit history.
4. **Earnings & Consultation Analytics:**
   - Daily, weekly, and monthly earnings breakdown based on completed consultations.
   - Patient volume breakdown (new vs. follow-up consultations).

### 3.3 Receptionist Module
1. **Front-Desk Walk-in & Phone Booking:**
   - Expedited booking form for walk-in patients or telephone callers.
   - Select doctor, pick today's or upcoming date, assign available slot, capture patient details.
   - Collect cash payment on the spot and generate printed token slip.
2. **Live Queue & Check-in Desk:**
   - Overview of all doctors practicing in the clinic today.
   - Mark patients as arrived when they physically reach the clinic lobby.
   - Update payment status for `Pay at Clinic` bookings from `PENDING` to `PAID`.
   - Real-time display board of current serial being attended in each doctor's chamber.

### 3.4 Administrator Module
1. **Doctor Registration & Credential Verification:**
   - Review pending doctor registrations, verify BMDC registration numbers and credentials, and approve or reject doctor profiles.
2. **Entity Management (Full CRUD):**
   - Doctors: Update profiles, adjust fees, assign hospitals/specialties, activate/deactivate accounts.
   - Specialties: Add, edit, remove medical departments with English & Bengali nomenclature and icons.
   - Hospitals & Clinics: Manage branches, addresses, contact numbers.
   - Users & Staff: Manage roles (Doctor, Patient, Receptionist, Admin), reset passwords, toggle active status.
3. **Analytics & Performance Dashboard:**
   - Metric cards: Total Revenue, Total Appointments, Completed Visits, Cancellation Rate, No-Show Rate.
   - Interactive charts:
     * Daily / Monthly appointments trend.
     * Revenue trend by payment method.
     * Top-performing doctors by patient volume and ratings.
     * Busiest consultation hours heat distribution.
   - One-click CSV export for appointment logs, payment records, and doctor performance.
4. **Security & Audit Logs:**
   - Immutable audit trail recording user identity, action, entity affected, timestamp, IP address, and payload diffs for compliance and fraud detection.

---

## 4. Non-Functional & Security Requirements

1. **Zero Double-Booking Guarantee:**
   - Concurrency-safe atomic transaction handling.
   - Database-level unique constraint on `(doctor_id, date, start_time)`.
   - Immediate lock acquisition to eliminate race conditions even under concurrent high-throughput booking attempts.
2. **Data Privacy & Medical Confidentiality:**
   - Prescriptions and clinical notes accessible strictly by the patient, the attending doctor, and system administrators for legal audit.
   - Receptionists and other doctors are strictly forbidden from reading medical histories.
3. **Input Validation & Sanitization:**
   - Zod schema validation across all API endpoints.
   - Context-aware XSS escaping on all DOM rendering operations.
   - Zero raw SQL execution; 100% parameterized SQLite queries.
4. **Internationalization & Localization:**
   - Dual-language support: English (EN) and Bengali (বাংলা).
   - Seamless toggling without page reload; persists preference in `localStorage`.
5. **Accessibility & Responsive Experience:**
   - WCAG 2.1 AA compliance: High contrast ratios, accessible form labels, keyboard navigable modals, and responsive layout from 320px mobile screens to 4K displays.
   - Integrated dark mode theme with zero flicker (FOUC).
