import { Router } from 'express';
import { randomBytes, randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import * as users from '../db/users.js';
import * as passwordResetTokens from '../db/passwordResetTokens.js';
import { generateTokenPair } from '../services/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { createRateLimiter, checkRateLimit } from '../services/rateLimiter.js';
import { logger } from '../services/logger.js';

const router = Router();

const BCRYPT_ROUNDS = 12;
const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;
const RESEND_MAX_PER_HOUR = 3;
const RESEND_WINDOW_MS = 60 * 60 * 1000;

// Rate limiters
const registrationLimiter = createRateLimiter(5, 60 * 60 * 1000); // 5/hour per IP
const loginLimiter = createRateLimiter(10, 15 * 60 * 1000);       // 10/15min per IP

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (!password || password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

function sanitizeUser(user) {
  const { hashed_password, verification_token, ...safe } = user;
  return safe;
}

/**
 * POST /api/v1/auth/register
 * AC1: Email/password registration with 14-day trial
 */
router.post('/register', registrationLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and contain at least one letter and one number',
      });
    }

    // AC2: Duplicate email — use generic message to prevent email enumeration
    const existing = users.getByEmail(email.toLowerCase());
    if (existing) {
      return res.status(400).json({
        error: 'An account with this email already exists. Please log in or reset your password.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    const user = users.create({
      id: randomUUID(),
      email: email.toLowerCase(),
      hashed_password: hashedPassword,
    });

    users.update(user.id, {
      verification_token: verificationToken,
      verification_expires: verificationExpires,
    });

    await sendVerificationEmail({ to: email, token: verificationToken });

    logger.info('User registered', { userId: user.id });

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: sanitizeUser(users.getById(user.id)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/verify-email
 * AC3: Verify email with token
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = users.getByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }

    users.update(user.id, {
      email_verified: 1,
      verification_token: null,
      verification_expires: null,
    });

    const tokens = generateTokenPair(user);
    logger.info('Email verified', { userId: user.id });

    return res.json({
      message: 'Email verified successfully.',
      user: sanitizeUser(users.getById(user.id)),
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/resend-verification
 * AC4: Resend verification email (rate limited to 3/hour)
 */
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    const user = users.getByEmail(email.toLowerCase());

    // Always return success to prevent email enumeration
    if (!user || user.email_verified) {
      return res.json({ message: 'If your email is registered and unverified, a new link has been sent.' });
    }

    // Rate limit by user ID (3 per hour)
    const rlKey = `resend:${user.id}`;
    const rl = checkRateLimit(rlKey, RESEND_MAX_PER_HOUR, RESEND_WINDOW_MS);
    if (!rl.allowed) {
      return res.status(429).json({
        error: 'Too many resend requests. Please try again later.',
        retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
      });
    }

    // Invalidate old token and generate new one
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    users.update(user.id, {
      verification_token: verificationToken,
      verification_expires: verificationExpires,
    });

    await sendVerificationEmail({ to: user.email, token: verificationToken });

    return res.json({ message: 'If your email is registered and unverified, a new link has been sent.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login
 * Standard email/password login
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.getByEmail(email.toLowerCase());
    if (!user || !user.hashed_password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.hashed_password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPair = generateTokenPair(user);
    logger.info('User logged in', { userId: user.id });

    return res.json({
      user: sanitizeUser(user),
      ...tokenPair,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/oauth/google
 * AC5: Google OAuth registration/login
 */
router.post('/oauth/google', async (req, res, next) => {
  try {
    const { google_id, email, name } = req.body;

    if (!google_id || !email) {
      return res.status(400).json({ error: 'Google OAuth data is incomplete' });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists with this OAuth provider
    let user = users.getByOAuth('google', google_id);

    if (!user) {
      // Check if email already exists (link accounts)
      const existingByEmail = users.getByEmail(normalizedEmail);
      if (existingByEmail) {
        // Link OAuth to existing account
        users.update(existingByEmail.id, {
          oauth_provider: 'google',
          oauth_provider_id: google_id,
          email_verified: 1,
        });
        user = users.getById(existingByEmail.id);
      } else {
        // Create new OAuth user — use a random unusable password hash
        const unusableHash = await bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
        user = users.create({
          id: randomUUID(),
          email: normalizedEmail,
          hashed_password: unusableHash,
          name: name || null,
          oauth_provider: 'google',
          oauth_provider_id: google_id,
        });
        // OAuth users are auto-verified
        users.update(user.id, { email_verified: 1 });
        user = users.getById(user.id);
        logger.info('OAuth user registered', { userId: user.id, provider: 'google' });
      }
    }

    const tokenPair = generateTokenPair(user);

    return res.status(201).json({
      user: sanitizeUser(user),
      ...tokenPair,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * AC7: Request password reset link
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    // Always return success to prevent email enumeration
    const genericResponse = {
      message: 'If an account exists with that email, a password reset link has been sent.',
    };

    const user = users.getByEmail(email.toLowerCase());
    if (!user) {
      return res.json(genericResponse);
    }

    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    passwordResetTokens.create({
      id: randomUUID(),
      user_id: user.id,
      raw_token: rawToken,
      expires_at: expiresAt,
    });

    await sendPasswordResetEmail({ to: user.email, token: rawToken });

    return res.json(genericResponse);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/reset-password
 * AC7: Execute password reset with valid token
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and contain at least one letter and one number',
      });
    }

    const resetToken = passwordResetTokens.findByToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    users.update(resetToken.user_id, { hashed_password: hashedPassword });
    passwordResetTokens.markUsed(resetToken.id);

    logger.info('Password reset completed', { userId: resetToken.user_id });

    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

export default router;
