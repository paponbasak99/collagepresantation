import crypto from 'crypto';
import config from '../config.js';

const CAPTCHA_SECRET = config.jwtSecret + '_captcha';
const EXPIRES_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates a mathematical CAPTCHA question and returns question text + signed token.
 */
export function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
  const num2 = Math.floor(Math.random() * 9) + 1;
  const isPlus = Math.random() > 0.3;

  const answer = isPlus ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
  const operator = isPlus ? '+' : '-';
  const a = isPlus ? num1 : Math.max(num1, num2);
  const b = isPlus ? num2 : Math.min(num1, num2);

  const question = `${a} ${operator} ${b} = ?`;
  const expiresAt = Date.now() + EXPIRES_MS;
  const payload = `${answer}:${expiresAt}`;

  const hmac = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${hmac}`).toString('base64');

  return {
    question,
    token,
    expiresAt
  };
}

/**
 * Validates the CAPTCHA answer and signed token.
 */
export function verifyCaptcha(token, userAnswer) {
  if (!token || userAnswer === undefined || userAnswer === null) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [correctAnswer, expiresAt, hmac] = decoded.split(':');

    if (!correctAnswer || !expiresAt || !hmac) {
      return false;
    }

    if (Date.now() > Number(expiresAt)) {
      return false; // Expired
    }

    // Check signature
    const expectedPayload = `${correctAnswer}:${expiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', CAPTCHA_SECRET).update(expectedPayload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return String(correctAnswer).trim() === String(userAnswer).trim();
    }
    return false;
  } catch (err) {
    return false;
  }
}
