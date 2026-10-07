import { getDb } from '../db/connection.js';

export function logAudit({
  userId = null,
  action,
  entity,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null
}) {
  try {
    const db = getDb();
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const userAgent = req ? (req.headers['user-agent'] || 'System') : 'System';

    db.prepare(`
      INSERT INTO audit_logs (
        user_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      action,
      entity,
      entityId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      String(ip),
      String(userAgent)
    );
  } catch (error) {
    console.error('Audit logging failed (non-blocking):', error.message);
  }
}
