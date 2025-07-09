import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = 'sua_chave_secreta'; // Troque por uma chave forte

const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DENTALCARE',
  password: '#abc123#',
  port: 5432,
});

app.get('/api/ping', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ now: result.rows[0].now });
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ user, token });
  } catch {
    res.status(400).json({ error: 'Usuário já existe ou erro no cadastro' });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Senha inválida' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ user: { id: user.id, email: user.email }, token });
});


function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token não fornecido' });
  const token = auth.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}


app.get('/api/me', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  res.json({ user });
});

// Rotas de pacientes
app.post('/api/pacientes', authMiddleware, async (req, res) => {
  const { nome, email, telefone, endereco, data_nascimento, observacoes } = req.body;
  const idusuario = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (idusuario, nome, email, telefone, endereco, data_nascimento, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [idusuario, nome, email, telefone, endereco, data_nascimento, observacoes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao cadastrar paciente' });
  }
});

app.get('/api/pacientes', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const result = await pool.query('SELECT * FROM pacientes WHERE idusuario = $1 ORDER BY nome', [idusuario]);
  res.json(result.rows);
});

app.get('/api/pacientes/:id', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM pacientes WHERE id = $1 AND idusuario = $2', [id, idusuario]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json(result.rows[0]);
});

app.put('/api/pacientes/:id', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { id } = req.params;
  const { nome, email, telefone, endereco, data_nascimento, observacoes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pacientes SET nome=$1, email=$2, telefone=$3, endereco=$4, data_nascimento=$5, observacoes=$6 WHERE id=$7 AND idusuario=$8 RETURNING *',
      [nome, email, telefone, endereco, data_nascimento, observacoes, id, idusuario]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar paciente' });
  }
});

app.delete('/api/pacientes/:id', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { id } = req.params;
  const result = await pool.query('DELETE FROM pacientes WHERE id = $1 AND idusuario = $2 RETURNING *', [id, idusuario]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json({ success: true });
});

app.listen(3001, '0.0.0.0', () => console.log('API rodando na porta 3001'));