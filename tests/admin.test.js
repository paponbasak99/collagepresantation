import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

let adminToken;

test.before(async () => {
  await seedDatabase();

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000001', password: 'Admin@1234' });
  adminToken = adminLogin.body.token;
});

test('Admin: Dashboard metrics overview', async () => {
  const res = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(typeof res.body.data.totalAppointments === 'number');
  assert.ok(typeof res.body.data.grossRevenue === 'number');
  assert.ok(typeof res.body.data.cancellationRate === 'number');
});

test('Admin: Analytics chart datasets', async () => {
  const res = await request(app)
    .get('/api/admin/charts')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data.dailyAppointments));
  assert.ok(Array.isArray(res.body.data.revenueByMethod));
  assert.ok(Array.isArray(res.body.data.topDoctors));
});

test('Admin: Approve pending doctor registration', async () => {
  const pendingRes = await request(app)
    .get('/api/admin/doctors/pending')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(pendingRes.status, 200);
  assert.ok(pendingRes.body.data.length >= 1);
  const pendingDoc = pendingRes.body.data[0];

  const approveRes = await request(app)
    .put(`/api/admin/doctors/${pendingDoc.doctor_id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.success, true);
});

test('Admin: Export appointments as CSV', async () => {
  const res = await request(app)
    .get('/api/admin/export/appointments')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'text/csv; charset=utf-8');
  assert.ok(res.text.includes('Appointment Number,Serial,Date,Time'));
});

test('Admin: Export payments as CSV', async () => {
  const res = await request(app)
    .get('/api/admin/export/payments')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'text/csv; charset=utf-8');
  assert.ok(res.text.includes('Payment ID,Appointment Number'));
});

test('Admin: Audit logs inspector', async () => {
  const res = await request(app)
    .get('/api/admin/audit-logs')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 1);
});
