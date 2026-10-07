import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../../data/backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `docbook-backup-${timestamp}.db`);
  const escapedBackupPath = backupPath.replace(/'/g, "''");

  console.log(`[Backup] Starting atomic database backup...`);
  const db = getDb();

  try {
    // VACUUM INTO creates an exact, atomic, corruption-free snapshot of SQLite in WAL mode
    db.exec(`VACUUM INTO '${escapedBackupPath}';`);
    const stats = fs.statSync(backupPath);
    console.log(`✅ [Backup] Backup completed successfully!`);
    console.log(`   Destination: ${backupPath}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    return backupPath;
  } catch (err) {
    console.error(`❌ [Backup] Failed to backup database:`, err.message);
    throw err;
  }
}

// Run directly if invoked via CLI
if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  try {
    backupDatabase();
    process.exit(0);
  } catch (_) {
    process.exit(1);
  }
}
