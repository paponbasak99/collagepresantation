import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initDatabase() {
  const db = getDb();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schemaSql);

  // Dynamic migration helper for SQLite existing tables
  const ensureColumn = (table, col, def) => {
    try {
      const cols = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!cols.some(c => c.name === col)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    } catch (_) {}
  };

  ensureColumn('appointments', 'is_emergency', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('appointments', 'emergency_notes', 'TEXT');
  ensureColumn('appointments', 'idempotency_key', 'TEXT');
  ensureColumn('payments', 'idempotency_key', 'TEXT');
  ensureColumn('doctors', 'is_bmdc_verified', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('prescriptions', 'is_encrypted', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('prescriptions', 'digital_signature_seal', 'TEXT');
  ensureColumn('appointments', 'appointment_type', "TEXT NOT NULL DEFAULT 'IN_PERSON'");

  console.log('✅ Database schema initialized successfully.');
}

// Run directly if called as CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    initDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}
