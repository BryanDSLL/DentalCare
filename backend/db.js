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

// Testa conexão ao banco na inicialização
pool.query('SELECT 1')
  .then(() => console.log('Conexão com PostgreSQL estabelecida com sucesso!'))
  .catch((err) => console.error('Erro ao conectar ao PostgreSQL:', err));
