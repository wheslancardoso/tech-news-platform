-- Migration: Camaleão Schema Update e RLS
-- Data: 2026-04-23
-- Descrição: Adiciona colunas para controle dinâmico de UI e aplica Row Level Security

-- 1. Adicionar colunas do Design Dinâmico na tabela `posts`
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS theme_config jsonb,
ADD COLUMN IF NOT EXISTS whatsapp_summary text;

-- 2. Habilitar RLS nas tabelas
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para a tabela `posts`
-- Público só pode ler posts aprovados
CREATE POLICY "Público pode ver posts aprovados" ON posts
  FOR SELECT USING (status = 'approved');

-- 4. Políticas para a tabela `subscribers`
-- Qualquer um pode se inscrever (inserir)
CREATE POLICY "Público pode se inscrever" ON subscribers
  FOR INSERT WITH CHECK (true);

-- 5. Políticas para a tabela `newsletters`
-- Público só pode ler newsletters publicadas
CREATE POLICY "Público pode ver newsletters publicadas" ON newsletters
  FOR SELECT USING (status = 'published');

-- Nota: O Admin tem acesso total via SERVICE_ROLE_KEY nas Server Actions do Next.js.
