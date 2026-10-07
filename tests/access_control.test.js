import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

let patient1Token;
let patient2Token;
let doctorToken;
let receptionistToken;
let adminToken;
let prescriptionId;
let appointmentId;

test.before(async () => {
  await seedDatabase();

  const p1Login = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000005', password: 'Patient@1234' });
  patient1Token = p1Login.body.token;

  const p2Login = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000011', password: 'Patient@1234' });
  patient2Token = p2Login.body.token;

  const docLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000002', password: 'Doctor@1234' });
  doctorToken = docLogin.body.token;

  const recLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000004', password: 'Reception@1234' });
  receptionistToken = recLogin.body.token;

  const admLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000001', password: 'Admin@1234' });
  adminToken = admLogin.body.token;

  // Appointment 1 belongs to patient 1 and has a seeded prescription
  const p1Apts = await request(app)
    .get('/api/appointments/my')
    .set('Authorization', `Bearer ${patient1Token}`);

  const aptWithRx = p1Apts.body.data.find(a => a.prescription_id);
  appointmentId = aptWithRx.id;
});

test('Access Control: Patient can view their own prescription', async () => {
  const res = await request(app)
    .get(`/api/prescriptions/appointment/${appointmentId}`)
    .set('Authorization', `Bearer ${patient1Token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.diagnosis);
});

test('Access Control: Treating Doctor can view the patient prescription', async () => {
  const res = await request(app)
    .get(`/api/prescriptions/appointment/${appointmentId}`)
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('Access Control: System Admin can view prescription for audit purposes', async () => {
  const res = await request(app)
    .get(`/api/prescriptions/appointment/${appointmentId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('Access Control: Unrelated Patient cannot access another patient medical prescription (403)', async () => {
  const res = await request(app)
    .get(`/api/prescriptions/appointment/${appointmentId}`)
    .set('Authorization', `Bearer ${patient2Token}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('Access Control: Receptionist cannot access clinical medical prescriptions (403)', async () => {
  const res = await request(app)
    .get(`/api/prescriptions/appointment/${appointmentId}`)
    .set('Authorization', `Bearer ${receptionistToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});
