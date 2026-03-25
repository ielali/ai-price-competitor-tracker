import { config } from 'dotenv';

config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_PATH = process.env.DATABASE_PATH || './data/prices.db';
