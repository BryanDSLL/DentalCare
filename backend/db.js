import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './.env' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não definida. Configure no Railway ou no arquivo .env local.');
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
