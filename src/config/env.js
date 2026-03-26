import { config } from 'dotenv';

config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_PATH = process.env.DATABASE_PATH || './data/prices.db';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-access-secret-change-in-production';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pricetracker.app';
