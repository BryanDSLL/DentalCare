// --- PREFERÊNCIAS DO USUÁRIO ---
// 1. Em ambiente local, a conexão com o banco deve ser feita SEM URL, usando:
//    host: 'localhost', database: 'DENTALCARE', user: 'postgres', password: '#abc123#', port: 5432, ssl: false
// 2. Em produção (Railway), usar apenas a DATABASE_URL e ssl: { rejectUnauthorized: false }
// 3. Nunca tentar usar URL de conexão local, sempre parâmetros explícitos.
// 4. O backend deve importar e usar o pool do db.js SEMPRE, nunca criar Pool direto em index.js
// 5. O .env local não deve definir DATABASE_URL/LOCAL_DATABASE_URL, apenas Railway usa isso.
// 6. O backend deve logar as configurações de conexão ao iniciar.
// --- FIM DAS PREFERÊNCIAS ---

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Configuração dinâmica da conexão
let pool;

if (process.env.NODE_ENV === 'production') {
  // Railway ou produção: usa DATABASE_URL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Local: usa parâmetros explícitos, sem URL
  pool = new Pool({
    user: 'postgres',
    password: '#abc123#',
    host: 'localhost',
    database: 'DENTALCARE',
    port: 5432,
    ssl: false
  });
}

console.log('Tentando conectar ao PostgreSQL com as configurações:');
console.log(pool.options || pool.connectionParameters);

export { pool };

// Testa conexão ao banco na inicialização
pool.query('SELECT 1')
  .then(() => console.log('Conexão com PostgreSQL estabelecida com sucesso!'))
  .catch((err) => {
    console.error('Erro ao conectar ao PostgreSQL:', err);
    if (err && err.message) {
      console.error('Mensagem detalhada:', err.message);
    }
    if (err && err.stack) {
      console.error('Stack:', err.stack);
    }
  });
