import { Router } from 'express';
import { 
  register, 
  verifyOtp, 
  login, 
  getMe, 
  updateProfile, 
  logout, 
  getCaptchaChallenge, 
  requestLoginOtp, 
  verifyLoginOtp,
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus,
  verifyLogin2FA
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/captcha', getCaptchaChallenge);
router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/login', authLimiter, login);
router.post('/login-2fa-verify', authLimiter, verifyLogin2FA);
router.post('/login-otp-request', authLimiter, requestLoginOtp);
router.post('/login-otp-verify', authLimiter, verifyLoginOtp);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

// Two-Factor Authentication Management
router.get('/2fa/status', requireAuth, get2FAStatus);
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/enable', requireAuth, enable2FA);
router.post('/2fa/disable', requireAuth, disable2FA);

export default router;
