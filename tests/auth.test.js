import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

test.before(async () => {
  await seedDatabase();
});

test('Auth: Register new patient and verify with OTP', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      phone: '01811999888',
      name: 'Rahim Uddin',
      password: 'SecurePass@123',
      role: 'patient',
      age: 29,
      gender: 'MALE'
    });

  assert.equal(registerRes.status, 200);
  assert.equal(registerRes.body.success, true);
  assert.ok(registerRes.body.data.mockOtp);

  const otp = registerRes.body.data.mockOtp;

  // Verify OTP
  const verifyRes = await request(app)
    .post('/api/auth/verify-otp')
    .send({
      phone: '01811999888',
      otp: otp
    });

  assert.equal(verifyRes.status, 201);
  assert.equal(verifyRes.body.success, true);
  assert.ok(verifyRes.body.token);
  assert.equal(verifyRes.body.user.phone, '01811999888');
  assert.equal(verifyRes.body.user.name, 'Rahim Uddin');
});

test('Auth: Login with valid credentials', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      phone: '01711000005', // Patient Tanvir Ahmed
      password: 'Patient@1234'
    });

  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.success, true);
  assert.ok(loginRes.body.token);
  assert.equal(loginRes.body.user.role, 'patient');
});

test('Auth: Reject login with invalid password', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      phone: '01711000005',
      password: 'WrongPassword'
    });

  assert.equal(loginRes.status, 401);
  assert.equal(loginRes.body.success, false);
});

test('Auth: Access /api/auth/me with token', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      phone: '01711000001', // Admin
      password: 'Admin@1234'
    });

  const token = loginRes.body.token;

  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(meRes.status, 200);
  assert.equal(meRes.body.user.role, 'admin');
  assert.equal(meRes.body.user.phone, '01711000001');
});

test('Auth: Reject /api/auth/me without token', async () => {
  const meRes = await request(app)
    .get('/api/auth/me');

  assert.equal(meRes.status, 401);
  assert.equal(meRes.body.success, false);
});
