import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../data/docbook.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class DatabaseWrapper {
  constructor(filepath) {
    this.rawDb = new DatabaseSync(filepath);
    this.rawDb.exec('PRAGMA foreign_keys = ON;');
    this.rawDb.exec('PRAGMA journal_mode = WAL;');
    this.rawDb.exec('PRAGMA synchronous = NORMAL;');
  }

  prepare(sql) {
    const stmt = this.rawDb.prepare(sql);
    return {
      run: (...args) => stmt.run(...args),
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args)
    };
  }

  exec(sql) {
    return this.rawDb.exec(sql);
  }

  pragma(pragmaStr) {
    return this.rawDb.exec(`PRAGMA ${pragmaStr};`);
  }

  transaction(fn) {
    return (...args) => {
      this.rawDb.exec('BEGIN IMMEDIATE');
      try {
        const result = fn(...args);
        this.rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        this.rawDb.exec('ROLLBACK');
        throw err;
      }
    };
  }

  close() {
    this.rawDb.close();
  }
}

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseWrapper(dbPath);
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export default getDb;
