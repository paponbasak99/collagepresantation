import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';
import { getDb } from '../src/db/connection.js';
import { generateCaptcha } from '../src/services/captchaService.js';

let adminToken;
let doctorToken;
let doctorId;
let doctorUserId;
let patientToken;
let patientUser;
let testDate;

test.before(async () => {
  await seedDatabase();

  // Admin login
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000001', password: 'Admin@1234' });
  adminToken = adminLogin.body.token;

  // Doctor login (01711000002)
  const docLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000002', password: 'Doctor@1234' });
  doctorToken = docLogin.body.token;
  doctorUserId = docLogin.body.user.id;

  // Patient login
  const patLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000005', password: 'Patient@1234' });
  patientToken = patLogin.body.token;
  patientUser = patLogin.body.user;

  // Get doctor ID for the logged in doctor
  const db = getDb();
  const docRecord = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(doctorUserId);
  doctorId = docRecord.id;

  const d = new Date();
  d.setDate(d.getDate() + 3);
  testDate = d.toISOString().slice(0, 10);
});

test('AI Symptom Checker: Detect emergency cardiology symptoms in English', async () => {
  const res = await request(app)
    .post('/api/ai/symptom-checker')
    .send({ symptoms: 'I have severe crushing chest pain, breathlessness, and dizziness' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.suggestedSpecialty.slug, 'cardiology');
  assert.equal(res.body.data.urgency, 'EMERGENCY');
  assert.ok(res.body.data.emergencyAlert);
  assert.ok(Array.isArray(res.body.data.recommendedDoctors));
});

test('AI Symptom Checker: Detect dermatology symptoms in Bengali', async () => {
  const res = await request(app)
    .post('/api/ai/symptom-checker')
    .send({ symptoms: 'আমার চামড়ায় প্রচণ্ড চুলকানি এবং লাল ফুসকুড়ি ও এলার্জি হয়েছে' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.suggestedSpecialty.slug, 'dermatology');
  assert.notEqual(res.body.data.urgency, 'EMERGENCY');
});

test('CAPTCHA & OTP Security: Enforce valid captcha verification on registration', async () => {
  // 1. Get captcha challenge
  const capRes = await request(app).get('/api/auth/captcha');
  assert.equal(capRes.status, 200);
  assert.ok(capRes.body.data.question);
  assert.ok(capRes.body.data.token);

  // 2. Reject registration with incorrect answer
  const badReg = await request(app)
    .post('/api/auth/register')
    .send({
      phone: '01999888777',
      name: 'Captcha Test User',
      password: 'Password@123',
      role: 'patient',
      captchaAnswer: '99999',
      captchaToken: capRes.body.data.token
    });

  assert.equal(badReg.status, 400);
  assert.match(badReg.body.message, /CAPTCHA/i);

  // 3. Register successfully with valid captcha
  const validCap = generateCaptcha();
  const decodedPayload = Buffer.from(validCap.token, 'base64').toString('utf8');
  const validAnswer = decodedPayload.split(':')[0];

  const goodReg = await request(app)
    .post('/api/auth/register')
    .send({
      phone: '01999888777',
      name: 'Captcha Test User',
      password: 'Password@123',
      role: 'patient',
      captchaAnswer: validAnswer,
      captchaToken: validCap.token
    });

  assert.equal(goodReg.status, 200);
  assert.equal(goodReg.body.success, true);
  assert.ok(goodReg.body.data.mockOtp);
});

test('Emergency Booking: Priority slot booking dispatches doctor emergency alert', async () => {
  // Get an available slot
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctorId}/slots?date=${testDate}`)
    .set('Authorization', `Bearer ${patientToken}`);

  const slot = slotsRes.body.data.find(s => s.effective_status === 'AVAILABLE');
  assert.ok(slot, 'Should have an available slot');

  // Hold slot
  await request(app)
    .post(`/api/slots/${slot.id}/hold`)
    .set('Authorization', `Bearer ${patientToken}`);

  // Book with emergency flag
  const bookRes = await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      slotId: slot.id,
      patientType: 'SELF',
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      patientAge: 40,
      patientGender: 'MALE',
      reasonForVisit: 'Sudden chest tightening',
      paymentMethod: 'CASH_AT_CLINIC',
      isEmergency: true,
      emergencyNotes: 'High priority triage - Patient experiencing acute angina symptoms'
    });

  assert.equal(bookRes.status, 201);
  assert.equal(bookRes.body.success, true);
  assert.equal(bookRes.body.data.is_emergency, 1);
  assert.equal(bookRes.body.data.emergency_notes, 'High priority triage - Patient experiencing acute angina symptoms');

  // Verify doctor received emergency notification in database
  const db = getDb();
  const notif = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? AND message LIKE '%EMERGENCY%'
    ORDER BY id DESC LIMIT 1
  `).get(doctorUserId);

  assert.ok(notif, 'Doctor must have received an emergency notification');
  assert.match(notif.message, /Sudden chest tightening/i);
});

test('Live Queue Tracking: Accurate queue position and estimated wait calculation', async () => {
  // Find slots for queue testing
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctorId}/slots?date=${testDate}`)
    .set('Authorization', `Bearer ${patientToken}`);

  const availableSlots = slotsRes.body.data.filter(s => s.effective_status === 'AVAILABLE');
  assert.ok(availableSlots.length >= 2, 'Need at least 2 slots for queue test');

  // Book appointment 1
  await request(app)
    .post(`/api/slots/${availableSlots[0].id}/hold`)
    .set('Authorization', `Bearer ${patientToken}`);

  await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      slotId: availableSlots[0].id,
      patientType: 'SELF',
      patientName: 'Queue Patient 1',
      patientPhone: '01711000005',
      patientAge: 30,
      patientGender: 'MALE',
      reasonForVisit: 'General Checkup',
      paymentMethod: 'CASH_AT_CLINIC'
    });

  // Book appointment 2
  await request(app)
    .post(`/api/slots/${availableSlots[1].id}/hold`)
    .set('Authorization', `Bearer ${patientToken}`);

  const apt2Res = await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      slotId: availableSlots[1].id,
      patientType: 'SELF',
      patientName: 'Queue Patient 2',
      patientPhone: '01711000005',
      patientAge: 32,
      patientGender: 'MALE',
      reasonForVisit: 'Follow up',
      paymentMethod: 'CASH_AT_CLINIC'
    });

  const apt2Id = apt2Res.body.data.id;

  // Check queue position for patient 2
  const queueRes = await request(app)
    .get(`/api/appointments/${apt2Id}/queue-position`)
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(queueRes.status, 200);
  assert.equal(queueRes.body.success, true);
  assert.ok(queueRes.body.data.mySerial >= 2);
  assert.ok(queueRes.body.data.doctorName);
  assert.ok(typeof queueRes.body.data.patientsAhead === 'number');
  assert.ok(typeof queueRes.body.data.estimatedWaitMinutes === 'number');
});

test('Waitlist System: Join waitlist and receive notification when booked slot is cancelled', async () => {
  // Join waitlist for doctor
  const joinRes = await request(app)
    .post('/api/waitlist')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      doctorId,
      preferredDate: testDate
    });

  assert.equal(joinRes.status, 201);
  assert.equal(joinRes.body.success, true);
  assert.ok(joinRes.body.waitlistId);

  // Verify list in /my
  const myWaitlist = await request(app)
    .get('/api/waitlist/my')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(myWaitlist.status, 200);
  assert.ok(myWaitlist.body.data.length >= 1);

  // Trigger a cancellation of an appointment on this date to activate waitlist
  const db = getDb();
  const aptToCancel = db.prepare(`
    SELECT a.* FROM appointments a
    JOIN time_slots s ON a.slot_id = s.id
    WHERE s.doctor_id = ? AND s.date = ? AND a.status = 'CONFIRMED'
    LIMIT 1
  `).get(doctorId, testDate);

  if (aptToCancel) {
    const cancelRes = await request(app)
      .post(`/api/appointments/${aptToCancel.id}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ reason: 'Cannot attend' });

    assert.equal(cancelRes.status, 200);

    // Verify notification was sent to waitlisted user
    const waitNotif = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ? AND message LIKE '%opened up%'
      ORDER BY id DESC LIMIT 1
    `).get(patientUser.id);

    assert.ok(waitNotif, 'Waitlisted patient should receive slot opened notification');
  }
});

test('Medical Data Encryption & Audit Logging: Protect sensitive patient diagnoses', async () => {
  const db = getDb();

  // Find a confirmed appointment for this doctor
  const apt = db.prepare(`
    SELECT a.* FROM appointments a
    WHERE a.doctor_id = ? AND a.status IN ('CONFIRMED', 'ARRIVED', 'IN_CONSULTATION')
    LIMIT 1
  `).get(doctorId);

  assert.ok(apt, 'Must have an appointment to create prescription');

  const sensitiveDiagnosis = 'Class II Angina Pectoris with elevated troponin levels and ischemic ECG changes';
  const sensitiveAdvice = 'Strict bed rest for 48 hours, avoid physical exertion';

  // Doctor creates prescription
  const rxRes = await request(app)
    .post('/api/prescriptions')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      appointmentId: apt.id,
      diagnosis: sensitiveDiagnosis,
      symptoms: 'Substernal chest pressure radiating to left arm',
      advice: sensitiveAdvice,
      medicines: [
        {
          medicineName: 'Nitroglycerin 0.5mg',
          dosage: '1 tab sublingually',
          duration: '3 days',
          instruction: 'Dissolve under tongue'
        }
      ]
    });

  assert.equal(rxRes.status, 201);
  const rxId = rxRes.body.data.prescriptionId;

  // 1. Verify directly in database that raw data is encrypted (not plain text)
  const rawRx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(rxId);
  assert.equal(rawRx.is_encrypted, 1, 'is_encrypted column must be 1');
  assert.ok(rawRx.diagnosis.startsWith('enc:v1:'), 'Ciphertext must start with enc:v1: prefix');
  assert.ok(!rawRx.diagnosis.includes(sensitiveDiagnosis), 'Plaintext diagnosis must NOT be stored in raw database column');
  assert.ok(rawRx.digital_signature_seal, 'Digital signature seal hash must be generated');

  // 2. Patient / Doctor reads prescription -> Automatically decrypted on output
  const viewRes = await request(app)
    .get(`/api/prescriptions/${rxId}`)
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(viewRes.status, 200);
  assert.equal(viewRes.body.data.diagnosis, sensitiveDiagnosis, 'Diagnosis must be accurately decrypted');
  assert.equal(viewRes.body.data.advice, sensitiveAdvice, 'Advice must be accurately decrypted');

  // 3. Verify audit log entry for viewing medical record
  const auditEntry = db.prepare(`
    SELECT * FROM audit_logs 
    WHERE action = 'VIEW_MEDICAL_RECORD' 
      AND entity = 'PRESCRIPTION' 
      AND entity_id = ?
    ORDER BY id DESC LIMIT 1
  `).get(rxId);

  assert.ok(auditEntry, 'Audit log must record VIEW_MEDICAL_RECORD event');
  assert.equal(auditEntry.user_id, patientUser.id);
});

test('Doctor BMDC Verification & Approval: Admin verifies credentials and certifies practitioner', async () => {
  // Find a pending doctor or create one
  const db = getDb();
  let pendingDoc = db.prepare("SELECT * FROM doctors WHERE status = 'PENDING_APPROVAL' LIMIT 1").get();

  if (!pendingDoc) {
    db.prepare(`
      INSERT INTO doctors (user_id, specialty_id, hospital_id, bmdc_reg_no, qualifications, experience_years, consultation_fee, chamber_address, status)
      VALUES (4, 1, 1, 'BMDC-TEST-9988', 'MBBS, FCPS', 6, 1000, 'Green Life Hospital, Dhaka', 'PENDING_APPROVAL')
    `).run();
    pendingDoc = db.prepare("SELECT * FROM doctors WHERE status = 'PENDING_APPROVAL' LIMIT 1").get();
  }

  assert.ok(pendingDoc, 'Must have a pending doctor');

  // Admin queries official BMDC verification
  const verifyRes = await request(app)
    .get(`/api/admin/doctors/${pendingDoc.id}/bmdc-verify`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.success, true);
  assert.equal(verifyRes.body.data.bmdcRegNo, pendingDoc.bmdc_reg_no);
  assert.equal(verifyRes.body.data.status, 'VALID_ACTIVE');

  // Admin approves doctor
  const approveRes = await request(app)
    .put(`/api/admin/doctors/${pendingDoc.id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.success, true);

  // Verify in database that doctor is approved and is_bmdc_verified = 1
  const updatedDoc = db.prepare('SELECT status, is_bmdc_verified FROM doctors WHERE id = ?').get(pendingDoc.id);
  assert.equal(updatedDoc.status, 'APPROVED');
  assert.equal(updatedDoc.is_bmdc_verified, 1);
});
