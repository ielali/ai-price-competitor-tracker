import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as businessProfiles from '../db/businessProfiles.js';
import { requireAuth } from '../services/jwt.js';
import { logger } from '../services/logger.js';

const router = Router();

/**
 * PUT /api/v1/users/profile
 * AC6: Update business profile (onboarding step)
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { business_name, business_type, primary_platform } = req.body;

    const VALID_BUSINESS_TYPES = ['dropshipper', 'reseller', 'retailer', 'other'];
    const VALID_PLATFORMS = ['shopify', 'amazon', 'ebay', 'other'];

    if (business_type && !VALID_BUSINESS_TYPES.includes(business_type)) {
      return res.status(400).json({
        error: `business_type must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`,
      });
    }
    if (primary_platform && !VALID_PLATFORMS.includes(primary_platform)) {
      return res.status(400).json({
        error: `primary_platform must be one of: ${VALID_PLATFORMS.join(', ')}`,
      });
    }

    const profile = businessProfiles.upsert({
      id: randomUUID(),
      user_id: userId,
      business_name: business_name || null,
      business_type: business_type || null,
      primary_platform: primary_platform || null,
    });

    logger.info('Business profile updated', { userId });

    return res.json({ profile });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/users/profile
 * Get current user's business profile
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const profile = businessProfiles.getByUserId(userId);
    return res.json({ profile: profile || null });
  } catch (err) {
    next(err);
  }
});

export default router;
