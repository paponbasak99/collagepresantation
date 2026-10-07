import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

let patientToken;
let doctorId;
let appointmentId;
let appointmentNumber;

test.before(async () => {
  await seedDatabase();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000005', password: 'Patient@1234' });
  patientToken = loginRes.body.token;

  // From seed, appointment 1 is already created for patient 1
  const myApts = await request(app)
    .get('/api/appointments/my')
    .set('Authorization', `Bearer ${patientToken}`);

  appointmentId = myApts.body.data[0].id;
  appointmentNumber = myApts.body.data[0].appointment_number;
});

test('Slip: Generate appointment slip with QR code', async () => {
  const res = await request(app)
    .get(`/api/appointments/${appointmentId}/slip`)
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.qr_code_data_url.startsWith('data:image/png;base64,'));
  assert.ok(res.body.data.serial_badge.startsWith('SL - '));
  assert.ok(res.body.data.reporting_time);
  assert.equal(res.body.data.appointment_number, appointmentNumber);
});

test('Slip: Public QR verification endpoint validates authentic slip', async () => {
  const res = await request(app)
    .get(`/api/appointments/verify/${appointmentNumber}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.verified, true);
  assert.equal(res.body.data.appointment_number, appointmentNumber);
  assert.ok(res.body.data.doctor_name);
  assert.ok(res.body.data.serial_badge);
});

test('Slip: Reject invalid appointment number on verification', async () => {
  const res = await request(app)
    .get('/api/appointments/verify/APT-NONEXISTENT-9999');

  assert.equal(res.status, 404);
  assert.equal(res.body.verified, false);
});
