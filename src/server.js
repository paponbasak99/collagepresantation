import app from './app.js';
import config from './config.js';
import { sweepExpiredSlots } from './services/slotService.js';
import { getDb, closeDb } from './db/connection.js';

// Verify database connection on startup
try {
  const db = getDb();
  const res = db.prepare('SELECT 1 as connected').get();
  if (res && res.connected === 1) {
    console.log(`[Database] SQLite connected successfully at: ${config.databaseUrl}`);
  }
} catch (err) {
  console.error('[Database] Failed to connect to SQLite:', err);
  process.exit(1);
}

// Background cleanup worker for expired 5-minute slot reservations
const SWEEP_INTERVAL_MS = 30000; // run every 30 seconds
const sweeperTimer = setInterval(() => {
  try {
    const released = sweepExpiredSlots();
    if (released > 0) {
      console.log(`[SlotSweeper] Released ${released} expired slot reservations back to AVAILABLE.`);
    }
  } catch (err) {
    console.error('[SlotSweeper] Error sweeping expired slots:', err);
  }
}, SWEEP_INTERVAL_MS);

// Start HTTP Server
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  DocBook - Doctor Appointment Booking System        `);
  console.log(`  Environment: ${config.nodeEnv}                     `);
  console.log(`  Server Port: ${config.port}                        `);
  console.log(`  Local URL:   http://localhost:${config.port}       `);
  console.log(`  Health Check: http://localhost:${config.port}/api/health`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Commencing graceful shutdown...`);
  clearInterval(sweeperTimer);
  server.close(() => {
    try {
      closeDb();
      console.log('[Database] Database connection closed cleanly.');
    } catch (e) {
      console.error('[Database] Error closing database connection:', e);
    }
    console.log('[Server] HTTP connections closed. Shutting down complete.');
    process.exit(0);
  });

  // Force shutdown if hung
  setTimeout(() => {
    console.error('[Server] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Catch unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default server;

