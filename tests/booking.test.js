import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';
import { getDb } from '../src/db/connection.js';

let patient1Token;
let patient2Token;
let doctor1Id;
let testDate;

test.before(async () => {
  await seedDatabase();

  // Login patient 1
  const p1Login = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000005', password: 'Patient@1234' });
  patient1Token = p1Login.body.token;

  // Login patient 2
  const p2Login = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000011', password: 'Patient@1234' });
  patient2Token = p2Login.body.token;

  // Get first doctor
  const docRes = await request(app).get('/api/doctors');
  doctor1Id = docRes.body.data[0].id;

  // Pick date (+2 days)
  const d = new Date();
  d.setDate(d.getDate() + 2);
  testDate = d.toISOString().slice(0, 10);
});

test('Booking: Hold an available slot for 5 minutes', async () => {
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctor1Id}/slots?date=${testDate}`)
    .set('Authorization', `Bearer ${patient1Token}`);

  assert.equal(slotsRes.status, 200);
  const availableSlot = slotsRes.body.data.find(s => s.effective_status === 'AVAILABLE');
  assert.ok(availableSlot, 'Must have at least one available slot');

  // Hold slot
  const holdRes = await request(app)
    .post(`/api/slots/${availableSlot.id}/hold`)
    .set('Authorization', `Bearer ${patient1Token}`);

  assert.equal(holdRes.status, 200);
  assert.equal(holdRes.body.success, true);
  assert.equal(holdRes.body.data.holdSeconds, 300);
  assert.ok(holdRes.body.data.heldUntil);

  // Patient 2 attempts to hold the same slot -> Must receive 409 Conflict
  const conflictRes = await request(app)
    .post(`/api/slots/${availableSlot.id}/hold`)
    .set('Authorization', `Bearer ${patient2Token}`);

  assert.equal(conflictRes.status, 409);
  assert.equal(conflictRes.body.success, false);
});

test('CRITICAL CONCURRENCY: Simultaneous concurrent hold requests by distinct patients on exact same slot', async () => {
  // Find a fresh available slot
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctor1Id}/slots?date=${testDate}`);

  const freshSlot = slotsRes.body.data.find(s => s.effective_status === 'AVAILABLE');
  assert.ok(freshSlot, 'Must have a fresh available slot for concurrency test');

  // Create 15 distinct patient tokens
  const tokens = [patient1Token, patient2Token];
  for (let i = 3; i <= 15; i++) {
    const phone = `018990000${String(i).padStart(2, '0')}`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ phone, name: `Concurrent Patient ${i}`, password: 'Password@123', role: 'patient' });
    const otp = regRes.body.data.mockOtp;
    const verRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone, otp });
    tokens.push(verRes.body.token);
  }

  // Launch 15 simultaneous concurrent requests to hold this EXACT slot at the exact same millisecond
  const promises = tokens.map(token =>
    request(app)
      .post(`/api/slots/${freshSlot.id}/hold`)
      .set('Authorization', `Bearer ${token}`)
  );

  const results = await Promise.all(promises);

  const successes = results.filter(r => r.status === 200);
  const conflicts = results.filter(r => r.status === 409);

  // EXACTLY ONE request must succeed!
  assert.equal(successes.length, 1, `Expected exactly 1 success, but got ${successes.length}`);
  // EXACTLY 14 requests must fail with HTTP 409 Conflict!
  assert.equal(conflicts.length, 14, `Expected 14 conflicts, but got ${conflicts.length}`);

  // Database verification: Slot is HELD, held_by_user_id is not null
  const db = getDb();
  const dbSlot = db.prepare('SELECT * FROM time_slots WHERE id = ?').get(freshSlot.id);
  assert.equal(dbSlot.status, 'HELD');
  assert.ok(dbSlot.held_by_user_id !== null);
});

test('Booking: Book appointment with bKash payment', async () => {
  // Find an available slot
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctor1Id}/slots?date=${testDate}`);
  const availableSlot = slotsRes.body.data.find(s => s.effective_status === 'AVAILABLE');
  assert.ok(availableSlot, 'Should find an available slot');

  // Hold slot
  const holdRes = await request(app)
    .post(`/api/slots/${availableSlot.id}/hold`)
    .set('Authorization', `Bearer ${patient1Token}`);
  assert.equal(holdRes.status, 200);

  // Book appointment
  const bookRes = await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patient1Token}`)
    .send({
      slotId: availableSlot.id,
      patientType: 'SELF',
      patientName: 'Tanvir Ahmed',
      patientPhone: '01711000005',
      patientAge: 32,
      patientGender: 'MALE',
      reasonForVisit: 'Hypertension routine monitoring',
      paymentMethod: 'BKASH',
      transactionRef: 'TRX-BK-TEST12345'
    });

  assert.equal(bookRes.status, 201);
  assert.equal(bookRes.body.success, true);
  assert.equal(bookRes.body.data.status, 'CONFIRMED');
  assert.equal(bookRes.body.data.payment_status, 'PAID');
  assert.ok(bookRes.body.data.serial_number >= 1);
  assert.ok(bookRes.body.data.appointment_number.startsWith('APT-'));
});

test('Cancellation & Refund Rules: 24h+ cancellation yields 90% refund', async () => {
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctor1Id}/slots?date=${testDate}`);
  const availableSlot = slotsRes.body.data.find(s => s.effective_status === 'AVAILABLE');
  assert.ok(availableSlot);

  await request(app)
    .post(`/api/slots/${availableSlot.id}/hold`)
    .set('Authorization', `Bearer ${patient1Token}`);

  const bookRes = await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patient1Token}`)
    .send({
      slotId: availableSlot.id,
      patientType: 'SELF',
      patientName: 'Tanvir Ahmed',
      patientPhone: '01711000005',
      patientAge: 32,
      patientGender: 'MALE',
      reasonForVisit: 'Follow up',
      paymentMethod: 'BKASH'
    });

  assert.equal(bookRes.status, 201);
  const appointmentId = bookRes.body.data.id;
  const originalFee = bookRes.body.data.fee_amount;

  // Cancel appointment
  const cancelRes = await request(app)
    .post(`/api/appointments/${appointmentId}/cancel`)
    .set('Authorization', `Bearer ${patient1Token}`)
    .send({ reason: 'Personal schedule conflict' });

  assert.equal(cancelRes.status, 200);
  assert.equal(cancelRes.body.status, 'CANCELLED');
  assert.equal(cancelRes.body.refundPercentage, 90);
  assert.equal(cancelRes.body.refundAmount, Math.round(originalFee * 0.9));

  // Verify slot is now AVAILABLE again in database
  const db = getDb();
  const slot = db.prepare('SELECT status FROM time_slots WHERE id = ?').get(availableSlot.id);
  assert.equal(slot.status, 'AVAILABLE');
});

test('Reschedule: Move appointment to a different slot', async () => {
  const slotsRes = await request(app)
    .get(`/api/doctors/${doctor1Id}/slots?date=${testDate}`);
  const availableSlots = slotsRes.body.data.filter(s => s.effective_status === 'AVAILABLE');
  assert.ok(availableSlots.length >= 2, 'Need at least 2 available slots');
  const [slotA, slotB] = availableSlots;

  await request(app)
    .post(`/api/slots/${slotA.id}/hold`)
    .set('Authorization', `Bearer ${patient1Token}`);

  const bookRes = await request(app)
    .post('/api/appointments/book')
    .set('Authorization', `Bearer ${patient1Token}`)
    .send({
      slotId: slotA.id,
      patientType: 'SELF',
      patientName: 'Tanvir Ahmed',
      patientPhone: '01711000005',
      patientAge: 32,
      patientGender: 'MALE',
      reasonForVisit: 'Routine check',
      paymentMethod: 'CASH_AT_CLINIC'
    });

  assert.equal(bookRes.status, 201);
  const aptId = bookRes.body.data.id;

  // Reschedule to slotB
  const reschedRes = await request(app)
    .post(`/api/appointments/${aptId}/reschedule`)
    .set('Authorization', `Bearer ${patient1Token}`)
    .send({ newSlotId: slotB.id });

  assert.equal(reschedRes.status, 200);
  assert.equal(reschedRes.body.success, true);
  assert.equal(reschedRes.body.newTime, slotB.start_time);

  // Check that slotA was released and slotB is BOOKED
  const db = getDb();
  assert.equal(db.prepare('SELECT status FROM time_slots WHERE id = ?').get(slotA.id).status, 'AVAILABLE');
  assert.equal(db.prepare('SELECT status FROM time_slots WHERE id = ?').get(slotB.id).status, 'BOOKED');
});
