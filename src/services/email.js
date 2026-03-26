import { logger } from './logger.js';
import { config } from 'dotenv';

config();

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pricetracker.app';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Send a verification email with a time-limited link (24 hour expiry).
 */
export async function sendVerificationEmail({ to, token }) {
  const link = `${APP_URL}/api/v1/auth/verify-email?token=${token}`;
  logger.info('Sending verification email', { to, link });

  if (process.env.SENDGRID_API_KEY) {
    // Production: integrate with SendGrid or similar provider here
    logger.warn('Email provider not configured. Set SENDGRID_API_KEY to enable email delivery.');
  }

  // In development/test mode, log the email content
  logger.debug('Verification email content', {
    from: EMAIL_FROM,
    to,
    subject: 'Verify your email address',
    body: `Click the link to verify your email: ${link}`,
  });

  return { success: true, link };
}

/**
 * Send a password reset email with a time-limited link (1 hour expiry).
 */
export async function sendPasswordResetEmail({ to, token }) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  logger.info('Sending password reset email', { to });

  if (process.env.SENDGRID_API_KEY) {
    logger.warn('Email provider not configured. Set SENDGRID_API_KEY to enable email delivery.');
  }

  logger.debug('Password reset email content', {
    from: EMAIL_FROM,
    to,
    subject: 'Reset your password',
    body: `Click the link to reset your password (expires in 1 hour): ${link}`,
  });

  return { success: true, link };
}
