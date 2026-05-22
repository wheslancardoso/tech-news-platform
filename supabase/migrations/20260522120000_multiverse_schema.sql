-- Migração SQL: 20260522120000_multiverse_schema.sql
-- Adiciona suporte para a arquitetura de mundos (TECH, MUSIC, GEAR) de forma retrocompatível.

-- 1. Iniciar Transação de Segurança
BEGIN;

-- =========================================================================
-- PARTE A: Modificações na Tabela POSTS
-- =========================================================================

-- Adiciona a coluna temporariamente permitindo nulos para evitar quebra instantânea
ALTER TABLE posts ADD COLUMN IF NOT EXISTS world text;

-- Atualiza todos os registros existentes e históricos de posts para o mundo padrão 'TECH'
UPDATE posts SET world = 'TECH' WHERE world IS NULL;

-- Aplica a restrição de NOT NULL e define o valor padrão para novos inserts
ALTER TABLE posts ALTER COLUMN world SET DEFAULT 'TECH';
ALTER TABLE posts ALTER COLUMN world SET NOT NULL;


-- =========================================================================
-- PARTE B: Modificações na Tabela NEWSLETTERS
-- =========================================================================

-- Adiciona a coluna temporariamente permitindo nulos
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS world text;

-- Atualiza edições existentes e históricas para o mundo padrão 'TECH'
UPDATE newsletters SET world = 'TECH' WHERE world IS NULL;

-- Aplica restrição de NOT NULL e define o valor padrão
ALTER TABLE newsletters ALTER COLUMN world SET DEFAULT 'TECH';
ALTER TABLE newsletters ALTER COLUMN world SET NOT NULL;


-- =========================================================================
-- PARTE C: Modificações na Tabela SUBSCRIBERS
-- =========================================================================

-- Adiciona a coluna de preferências de mundos ativos com array default contendo 'TECH'
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS active_worlds text[] NOT NULL DEFAULT '{TECH}';


-- =========================================================================
-- PARTE D: Criação de Índices de Alta Performance
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_posts_world_score_status 
ON posts(world, score DESC) 
WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_newsletters_world_edition 
ON newsletters(world, edition_number DESC) 
WHERE status = 'published';

-- Finalizar Transação com Sucesso
COMMIT;
