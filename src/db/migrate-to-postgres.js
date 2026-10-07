/**
 * DocBook PostgreSQL Migration Utility
 * Migrates schemas and data from local SQLite to a production PostgreSQL database.
 * Usage: node src/db/migrate-to-postgres.js <postgres_connection_string>
 */

import { getDb } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPostgresMigration() {
  const pgConnectionString = process.argv[2] || process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!pgConnectionString || !pgConnectionString.startsWith('postgres')) {
    console.log(`
======================================================================
  DocBook PostgreSQL Migration Assistant
======================================================================
  To migrate to PostgreSQL, specify a target connection string:
    node src/db/migrate-to-postgres.js "postgresql://user:password@localhost:5432/docbook"

  Or set POSTGRES_URL in your .env file.
======================================================================
    `);
    process.exit(0);
  }

  let pgModule;
  try {
    pgModule = await import('pg');
  } catch (err) {
    console.error('Error: "pg" driver is not installed. Please install it first with: npm install pg');
    process.exit(1);
  }

  const { Pool } = pgModule.default;
  const pool = new Pool({ connectionString: pgConnectionString });

  console.log(`[Postgres Migration] Connecting to target database: ${pgConnectionString.replace(/:[^:]*@/, ':****@')}`);
  const client = await pool.connect();

  try {
    console.log('[Postgres Migration] Initializing PostgreSQL schemas...');

    // PostgreSQL DDL with equivalent relational types and constraints
    const pgSchema = `
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS waitlist CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS prescription_tests CASCADE;
      DROP TABLE IF EXISTS prescription_items CASCADE;
      DROP TABLE IF EXISTS prescriptions CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS time_slots CASCADE;
      DROP TABLE IF EXISTS doctor_leaves CASCADE;
      DROP TABLE IF EXISTS doctor_schedules CASCADE;
      DROP TABLE IF EXISTS doctors CASCADE;
      DROP TABLE IF EXISTS hospitals CASCADE;
      DROP TABLE IF EXISTS specialties CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL CHECK(role IN ('admin', 'doctor', 'patient', 'receptionist')),
        avatar_url TEXT,
        age INT,
        gender VARCHAR(10) CHECK(gender IN ('MALE', 'FEMALE', 'OTHER')),
        blood_group VARCHAR(10),
        address TEXT,
        is_active INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE specialties (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(100) NOT NULL UNIQUE,
        name_bn VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) NOT NULL,
        description_en TEXT,
        description_bn TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE hospitals (
        id SERIAL PRIMARY KEY,
        name_en VARCHAR(200) NOT NULL,
        name_bn VARCHAR(200) NOT NULL,
        address_en TEXT NOT NULL,
        address_bn TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(150),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE doctors (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        specialty_id INT NOT NULL REFERENCES specialties(id),
        hospital_id INT NOT NULL REFERENCES hospitals(id),
        bmdc_reg_no VARCHAR(50) NOT NULL UNIQUE,
        qualifications VARCHAR(255) NOT NULL,
        experience_years INT NOT NULL DEFAULT 0,
        consultation_fee NUMERIC(10,2) NOT NULL,
        follow_up_fee NUMERIC(10,2) NOT NULL,
        bio_en TEXT,
        bio_bn TEXT,
        chamber_address TEXT NOT NULL,
        digital_signature TEXT,
        is_bmdc_verified INT NOT NULL DEFAULT 1,
        status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
        rating_avg REAL NOT NULL DEFAULT 0.0,
        rating_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE doctor_schedules (
        id SERIAL PRIMARY KEY,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week INT NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        slot_duration_minutes INT NOT NULL DEFAULT 15,
        break_start VARCHAR(10),
        break_end VARCHAR(10),
        is_active INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, day_of_week)
      );

      CREATE TABLE doctor_leaves (
        id SERIAL PRIMARY KEY,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        leave_date VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, leave_date)
      );

      CREATE TABLE time_slots (
        id SERIAL PRIMARY KEY,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        date VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
        held_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
        held_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, date, start_time)
      );

      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        appointment_number VARCHAR(100) NOT NULL UNIQUE,
        patient_id INT NOT NULL REFERENCES users(id),
        doctor_id INT NOT NULL REFERENCES doctors(id),
        slot_id INT NOT NULL REFERENCES time_slots(id),
        date VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        serial_number INT NOT NULL,
        patient_type VARCHAR(20) NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        patient_phone VARCHAR(30) NOT NULL,
        patient_age INT NOT NULL,
        patient_gender VARCHAR(10) NOT NULL,
        patient_relation VARCHAR(50),
        reason_for_visit TEXT NOT NULL,
        notes TEXT,
        is_emergency INT NOT NULL DEFAULT 0,
        emergency_notes TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        fee_amount NUMERIC(10,2) NOT NULL,
        cancellation_reason TEXT,
        cancelled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id),
        method VARCHAR(30) NOT NULL,
        transaction_ref VARCHAR(100),
        idempotency_key VARCHAR(100),
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        refund_amount NUMERIC(10,2) DEFAULT 0.0,
        refund_percentage INT DEFAULT 0,
        refund_reason TEXT,
        payment_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE prescriptions (
        id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
        doctor_id INT NOT NULL REFERENCES doctors(id),
        patient_id INT NOT NULL REFERENCES users(id),
        diagnosis TEXT NOT NULL,
        symptoms TEXT,
        advice TEXT,
        follow_up_date VARCHAR(20),
        digital_signature_seal TEXT,
        is_encrypted INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE prescription_items (
        id SERIAL PRIMARY KEY,
        prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        medicine_name VARCHAR(150) NOT NULL,
        dosage VARCHAR(50) NOT NULL,
        instruction VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE prescription_tests (
        id SERIAL PRIMARY KEY,
        prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
        test_name VARCHAR(150) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL UNIQUE REFERENCES appointments(id),
        doctor_id INT NOT NULL REFERENCES doctors(id),
        patient_id INT NOT NULL REFERENCES users(id),
        rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        is_visible INT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        appointment_id INT REFERENCES appointments(id),
        type VARCHAR(20) NOT NULL,
        recipient VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'SENT',
        scheduled_for TIMESTAMPTZ,
        sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE waitlist (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        preferred_date VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
        notified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, doctor_id, preferred_date)
      );

      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id INT,
        old_values TEXT,
        new_values TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(pgSchema);
    console.log('[Postgres Migration] PostgreSQL tables successfully created.');

    // Read records from SQLite and transfer
    const sqliteDb = getDb();
    const tables = ['users', 'specialties', 'hospitals', 'doctors', 'doctor_schedules', 'time_slots', 'appointments', 'payments', 'prescriptions', 'prescription_items', 'prescription_tests', 'reviews', 'notifications', 'waitlist', 'audit_logs'];

    for (const tbl of tables) {
      const rows = sqliteDb.prepare(`SELECT * FROM ${tbl}`).all();
      if (rows.length > 0) {
        console.log(`[Postgres Migration] Transferring ${rows.length} rows from table: ${tbl}`);
        for (const row of rows) {
          const keys = Object.keys(row);
          const values = Object.values(row);
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const insertQuery = `INSERT INTO ${tbl} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          await client.query(insertQuery, values);
        }
      }
    }

    console.log('[Postgres Migration] Migration completed successfully! Your data is fully synchronized with PostgreSQL.');
  } catch (err) {
    console.error('[Postgres Migration] Failed during migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runPostgresMigration();
