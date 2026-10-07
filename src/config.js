import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'docbook_default_dev_jwt_secret_key_super_secure_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || './data/docbook.db',
  clinic: {
    name: process.env.CLINIC_NAME || 'DocBook Health Center',
    city: process.env.CLINIC_CITY || 'Dhaka',
    phone: process.env.CLINIC_PHONE || '+8801700000000'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10)
  },
  slotHoldMinutes: parseInt(process.env.SLOT_HOLD_MINUTES || '5', 10),
  encryptionKey: process.env.ENCRYPTION_KEY || 'docbook_super_secret_aes256_encryption_key_32bytes!!'
};

// Security check for production environments
if (config.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || config.jwtSecret.includes('docbook_default_dev')) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be set to a secure custom secret in production mode.');
  }
  if (!process.env.ENCRYPTION_KEY || config.encryptionKey.includes('docbook_super_secret_aes256')) {
    throw new Error('FATAL SECURITY ERROR: ENCRYPTION_KEY must be set to a dedicated 32-byte secret in production mode.');
  }
}

export default config;

