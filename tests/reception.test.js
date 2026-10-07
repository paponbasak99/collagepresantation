import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

let receptionToken;
let doctorId;

test.before(async () => {
  await seedDatabase();

  const recLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000004', password: 'Reception@1234' });
  receptionToken = recLogin.body.token;

  const docRes = await request(app).get('/api/doctors');
  doctorId = docRes.body.data[0].id;
});

test('Reception: Get active doctors practicing today', async () => {
  const res = await request(app)
    .get('/api/reception/doctors-today')
    .set('Authorization', `Bearer ${receptionToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length >= 1);
});

test('Reception: Mark patient arrived and collect cash payment', async () => {
  const queueRes = await request(app)
    .get('/api/reception/queue')
    .set('Authorization', `Bearer ${receptionToken}`);

  assert.equal(queueRes.status, 200);
  const pendingApt = queueRes.body.data.find(a => a.payment_status === 'PENDING') || queueRes.body.data[0];

  // Mark arrived
  const arriveRes = await request(app)
    .put(`/api/reception/queue/${pendingApt.id}/arrive`)
    .set('Authorization', `Bearer ${receptionToken}`);
  assert.equal(arriveRes.status, 200);

  // Collect cash
  const cashRes = await request(app)
    .put(`/api/reception/queue/${pendingApt.id}/collect-cash`)
    .set('Authorization', `Bearer ${receptionToken}`);
  assert.equal(cashRes.status, 200);
});

test('Reception: Walk-in appointment creation with immediate cash collection', async () => {
  const walkInRes = await request(app)
    .post('/api/reception/walk-in')
    .set('Authorization', `Bearer ${receptionToken}`)
    .send({
      doctorId,
      patientName: 'Jamal Uddin (Walk-in)',
      patientPhone: '01855001122',
      patientAge: 45,
      patientGender: 'MALE',
      reasonForVisit: 'Sudden knee pain',
      collectCashNow: true
    });

  assert.equal(walkInRes.status, 201);
  assert.equal(walkInRes.body.success, true);
  assert.equal(walkInRes.body.data.status, 'ARRIVED');
  assert.equal(walkInRes.body.data.payment_status, 'PAID');
  assert.ok(walkInRes.body.data.serial_badge.startsWith('SL - '));
  assert.ok(walkInRes.body.data.qr_code_data_url);
});
