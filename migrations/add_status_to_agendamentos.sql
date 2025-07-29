-- Adiciona coluna status à tabela agendamentos caso não exista
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE agendamentos ADD COLUMN status VARCHAR(50) DEFAULT 'Pendente';
        
        -- Atualiza agendamentos existentes que estão sem status
        UPDATE agendamentos SET status = 'Pendente' WHERE status IS NULL;
    END IF;
END
$$;
