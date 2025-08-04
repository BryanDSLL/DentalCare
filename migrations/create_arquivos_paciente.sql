-- Migração para tabela de arquivos de paciente
CREATE TABLE arquivos_paciente (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50),
    arquivo BYTEA NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
