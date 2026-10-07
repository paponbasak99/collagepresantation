import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

test.before(async () => {
  await seedDatabase();
});

test('Catalog: List specialties with doctor counts', async () => {
  const res = await request(app).get('/api/specialties');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length >= 8);
  const cardiology = res.body.data.find(s => s.slug === 'cardiology');
  assert.ok(cardiology);
  assert.equal(cardiology.name_en, 'Cardiology');
  assert.ok(cardiology.doctor_count >= 1);
});

test('Catalog: List hospitals', async () => {
  const res = await request(app).get('/api/hospitals');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length >= 4);
});

test('Doctors: List all approved doctors', async () => {
  const res = await request(app).get('/api/doctors');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  // All approved doctors from seed
  assert.ok(res.body.data.length >= 6);
});

test('Doctors: Filter by specialty (Cardiology)', async () => {
  const specRes = await request(app).get('/api/specialties');
  const cardiology = specRes.body.data.find(s => s.slug === 'cardiology');

  const res = await request(app).get(`/api/doctors?specialty_id=${cardiology.id}`);
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 1);
  assert.ok(res.body.data.every(d => d.specialty_id === cardiology.id));
});

test('Doctors: Search by name "Rahman"', async () => {
  const res = await request(app).get('/api/doctors?search=Rahman');
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 1);
  assert.ok(res.body.data[0].name.includes('Rahman'));
});

test('Doctors: Filter by max fee 1000', async () => {
  const res = await request(app).get('/api/doctors?max_fee=1000');
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 1);
  assert.ok(res.body.data.every(d => d.consultation_fee <= 1000));
});

test('Doctors: Get doctor profile by ID with schedules and reviews', async () => {
  const listRes = await request(app).get('/api/doctors');
  const docId = listRes.body.data[0].id;

  const res = await request(app).get(`/api/doctors/${docId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.id, docId);
  assert.ok(Array.isArray(res.body.data.schedules));
  assert.ok(Array.isArray(res.body.data.recentReviews));
});
