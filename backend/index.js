import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import multer from 'multer';
import path from 'path';
const JWT_SECRET = 'sua_chave_secreta'; 

const app = express();
app.use(cors());
app.use(express.json());


import dotenv from 'dotenv';
dotenv.config();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.pdf', '.csv', '.xls', '.xlsx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

app.get('/api/ping', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ now: result.rows[0].now });
});

// Registro e autenticação de usuários
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


//////////////// Rotas de pacientes ////////////////
app.post('/api/pacientes', authMiddleware, async (req, res) => {
  const { nome, email, telefone, endereco, data_nascimento, observacoes } = req.body;
  const idusuario = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO pacientes (idusuario, nome, email, telefone, endereco, data_nascimento, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [idusuario, nome, email, telefone, endereco, data_nascimento, observacoes]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(400).json({ error: 'Erro ao cadastrar paciente' });
  }
});

// Upload múltiplos arquivos para paciente
app.post('/api/pacientes/:id/arquivos', authMiddleware, upload.single('arquivos'), async (req, res) => {
  const pacienteId = req.params.id;
  const idusuario = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  try {
    // Remove arquivo anterior, se existir
    await pool.query('DELETE FROM arquivos_paciente WHERE paciente_id = $1', [pacienteId]);
    const file = req.file;
    const buffer = await import('fs').then(fs => fs.readFileSync(file.path));
    await pool.query(
      'INSERT INTO arquivos_paciente (paciente_id, nome_arquivo, tipo_arquivo, arquivo) VALUES ($1, $2, $3, $4)',
      [pacienteId, file.originalname, file.mimetype, buffer]
    );
    await import('fs').then(fs => fs.unlinkSync(file.path)); // Remove arquivo do disco
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar arquivos', details: err.message });
  }
});

// Listar arquivos de um paciente
app.get('/api/pacientes/:id/arquivos', authMiddleware, async (req, res) => {
  const pacienteId = req.params.id;
  const result = await pool.query('SELECT id, nome_arquivo, tipo_arquivo, data_upload FROM arquivos_paciente WHERE paciente_id = $1 ORDER BY data_upload DESC', [pacienteId]);
  res.json(result.rows);
});

// Download de arquivo
app.get('/api/pacientes/:id/arquivos/:arquivoId', authMiddleware, async (req, res) => {
  const { id, arquivoId } = req.params;
  const result = await pool.query('SELECT nome_arquivo, tipo_arquivo, arquivo FROM arquivos_paciente WHERE id = $1 AND paciente_id = $2', [arquivoId, id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Arquivo não encontrado' });
  const file = result.rows[0];
  res.setHeader('Content-Disposition', `attachment; filename="${file.nome_arquivo}"`);
  res.setHeader('Content-Type', file.tipo_arquivo);
  res.send(file.arquivo);
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
  } catch {
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

//////////////// Rotas de agendamentos ////////////////
app.post('/api/agendamentos', authMiddleware, upload.single('arquivo'), async (req, res) => {
  // Recebe os campos do frontend: idpaciente, data, tipo, notas, status
  const { idpaciente, data, tipo, notas, status } = req.body;
  const idusuario = req.user.id;
  let arquivo = null;
  if (req.file) {
    arquivo = req.file.filename + '_' + req.file.originalname;
    // Renomeia para manter o nome original
    const fs = await import('fs');
    fs.renameSync(req.file.path, path.join(req.file.destination, arquivo));
  }
  try {
    const result = await pool.query(
      'INSERT INTO agendamentos (idusuario, idpaciente, data, tipo, notas, arquivo, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [idusuario, idpaciente, data, tipo, notas, arquivo, status || 'Pendente']
    );
    res.json(result.rows[0]);
  } catch {
    res.status(400).json({ error: 'Erro ao agendar' });
  }
});

app.get('/api/agendamentos', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { start, end, status } = req.query;
  let result;
  let statusArray = [];
  if (status) {
    try {
      statusArray = JSON.parse(status);
    } catch {
      statusArray = Array.isArray(status) ? status : [status];
    }
  }
  // Se nenhum status estiver selecionado, retorna vazio
  if (statusArray.length === 0) {
    return res.json([]);
  }
  let query = "SELECT id, idusuario, idpaciente, to_char(data, 'YYYY-MM-DD HH24:MI:SS') as data, tipo, notas, status FROM agendamentos WHERE idusuario = $1";
  let params = [idusuario];
  let paramIdx = 2;
  if (start && end) {
    query += ` AND data::date >= $${paramIdx}::date AND data::date <= $${paramIdx + 1}::date`;
    params.push(start, end);
    paramIdx += 2;
  }
  if (statusArray.length > 0) {
    query += ` AND status = ANY($${paramIdx})`;
    params.push(statusArray);
    paramIdx++;
  }
  query += " ORDER BY data";
  result = await pool.query(query, params);
  res.json(result.rows);
});

app.put('/api/agendamentos/:id', authMiddleware, upload.single('arquivo'), async (req, res) => {
  const idusuario = req.user.id;
  const { id } = req.params;
  const { idpaciente, data, tipo, notas, status } = req.body;
  let arquivo = null;
  if (req.file) {
    arquivo = req.file.filename + '_' + req.file.originalname;
    const fs = await import('fs');
    fs.renameSync(req.file.path, path.join(req.file.destination, arquivo));
  }
  try {
    const result = await pool.query(
      'UPDATE agendamentos SET idpaciente=$1, data=$2, tipo=$3, notas=$4, arquivo=$5, status=$6 WHERE id=$7 AND idusuario=$8 RETURNING *',
      [idpaciente, data, tipo, notas, arquivo, status, id, idusuario]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
    res.json(result.rows[0]);
  } catch {
    res.status(400).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.get('/api/agendamentos/arquivo/:nome', authMiddleware, (req, res) => {
  const nome = req.params.nome;
  const filePath = path.join(process.cwd(), 'uploads', nome);
  res.download(filePath);
});

app.delete('/api/agendamentos/:id', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { id } = req.params;
  const result = await pool.query('DELETE FROM agendamentos WHERE id = $1 AND idusuario = $2 RETURNING *', [id, idusuario]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Agendamento não encontrado' });
  res.json({ success: true });
});

//////////////// Rotas de configurações da clínica ////////////////
app.get('/api/configuracoes', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const result = await pool.query('SELECT * FROM configuracoes WHERE idusuario = $1 LIMIT 1', [idusuario]);
  if (result.rows.length === 0) {
    // Retorna valores padrão se não houver registro
    return res.json({
      nome: '',
      endereco: '',
      telefone: '',
      email: '',
      horario_inicio: '08:00',
      horario_fim: '18:00'
    });
  }
  res.json(result.rows[0]);
});

app.post('/api/configuracoes', authMiddleware, async (req, res) => {
  const idusuario = req.user.id;
  const { nome, endereco, telefone, email, horario_inicio, horario_fim } = req.body;
  try {
    // Verifica se já existe registro
    const result = await pool.query('SELECT id FROM configuracoes WHERE idusuario = $1', [idusuario]);
    if (result.rows.length === 0) {
      // Insere novo
      const insert = await pool.query(
        'INSERT INTO configuracoes (idusuario, nome, endereco, telefone, email, horario_inicio, horario_fim) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [idusuario, nome, endereco, telefone, email, horario_inicio, horario_fim]
      );
      return res.json(insert.rows[0]);
    } else {
      // Atualiza existente
      const update = await pool.query(
        'UPDATE configuracoes SET nome=$1, endereco=$2, telefone=$3, email=$4, horario_inicio=$5, horario_fim=$6 WHERE idusuario=$7 RETURNING *',
        [nome, endereco, telefone, email, horario_inicio, horario_fim, idusuario]
      );
      return res.json(update.rows[0]);
    }
  } catch (err) {
    console.error('Erro ao salvar configurações:', err);
    res.status(500).json({ error: 'Erro ao salvar configurações', details: err.message });
  }
});


app.listen(3001, '0.0.0.0', () => console.log('API rodando na porta 3001'));