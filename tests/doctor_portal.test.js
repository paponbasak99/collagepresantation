import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';

let doctorToken;
let patientToken;

test.before(async () => {
  await seedDatabase();

  const docLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000002', password: 'Doctor@1234' });
  doctorToken = docLogin.body.token;

  const patLogin = await request(app)
    .post('/api/auth/login')
    .send({ phone: '01711000005', password: 'Patient@1234' });
  patientToken = patLogin.body.token;
});

test('Doctor Portal: View today queue and update patient status', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const queueRes = await request(app)
    .get(`/api/doctor-portal/today-queue?date=${today}`)
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(queueRes.status, 200);
  assert.equal(queueRes.body.success, true);
  assert.ok(queueRes.body.count >= 1);

  const targetApt = queueRes.body.data[0];

  // Update status to IN_CONSULTATION
  const updateRes = await request(app)
    .put(`/api/doctor-portal/queue/${targetApt.id}/status`)
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({ status: 'IN_CONSULTATION' });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.data.status, 'IN_CONSULTATION');
});

test('Doctor Portal: Author digital e-prescription with medications and tests', async () => {
  // Find doctor's confirmed appointment
  const today = new Date().toISOString().slice(0, 10);
  const queueRes = await request(app)
    .get(`/api/doctor-portal/today-queue?date=${today}`)
    .set('Authorization', `Bearer ${doctorToken}`);

  const targetApt = queueRes.body.data.find(a => !a.prescription_id) || queueRes.body.data[0];

  const rxRes = await request(app)
    .post('/api/prescriptions')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      appointmentId: targetApt.id,
      diagnosis: 'Acute Bronchitis with productive cough',
      symptoms: 'Low grade fever for 3 days, wheezing',
      advice: 'Steam inhalation twice daily. Drink warm water.',
      followUpDate: '2026-10-15',
      medicines: [
        {
          medicineName: 'Cap. Cefixime 200mg',
          dosage: '1+0+1',
          instruction: 'After meal',
          duration: '7 Days'
        },
        {
          medicineName: 'Syp. Guaifenesin 100mg/5ml',
          dosage: '2 tsp 3 times daily',
          instruction: 'After meal',
          duration: '5 Days'
        }
      ],
      tests: [
        {
          testName: 'Chest X-Ray P/A View',
          notes: 'Rule out pneumonia'
        }
      ]
    });

  assert.equal(rxRes.status, 201);
  assert.equal(rxRes.body.success, true);
  assert.ok(rxRes.body.data.prescriptionId);

  // Fetch created prescription
  const getRxRes = await request(app)
    .get(`/api/prescriptions/appointment/${targetApt.id}`)
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(getRxRes.status, 200);
  assert.equal(getRxRes.body.data.diagnosis, 'Acute Bronchitis with productive cough');
  assert.equal(getRxRes.body.data.medicines.length, 2);
  assert.equal(getRxRes.body.data.tests.length, 1);
});

test('Doctor Portal: View consultation earnings report', async () => {
  const earningsRes = await request(app)
    .get('/api/doctor-portal/earnings')
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(earningsRes.status, 200);
  assert.equal(earningsRes.body.success, true);
  assert.ok(earningsRes.body.data.allTime);
  assert.ok(earningsRes.body.data.allTime.total_revenue >= 0);
});
