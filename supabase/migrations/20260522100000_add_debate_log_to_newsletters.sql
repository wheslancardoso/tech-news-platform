-- Migration para adicionar o log de debate gerado pelas IAs à tabela de newsletters
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS debate_log JSONB DEFAULT '[]'::jsonb;

-- Comentário na coluna para fins de documentação do esquema de dados
COMMENT ON COLUMN newsletters.debate_log IS 'Guarda o array JSON estruturado com o debate técnico entre as 4 personas de IA especialistas.';
