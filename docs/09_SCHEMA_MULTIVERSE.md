# Especificação Técnica de Banco de Dados: Schema Multiverso

Esta documentação descreve as modificações físicas e lógicas que devem ser aplicadas à base de dados do **Supabase** de forma segura e retrocompatível para viabilizar a **Arquitetura de Mundos Multiverso** do Fresh News.

---

## 🏛️ Alterações de Schema Recomendadas

### 1. Tabela `posts` (Artigos Curados Individuais)
Adicionaremos a coluna de mundo para segmentar as curadorias individuais do feed de afinidades.

| Coluna | Tipo de Dado | Restrição | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `world` | `text` | NOT NULL | `'TECH'` | Segmentação de mundo do artigo (ex: `'TECH'`, `'MUSIC'`, `'GEAR'`). |

### 2. Tabela `newsletters` (Edições Completas Compiladas)
Adicionaremos a coluna de mundo para segmentar as edições brutais inteiras compiladas pela IA/Editores.

| Coluna | Tipo de Dado | Restrição | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `world` | `text` | NOT NULL | `'TECH'` | Segmentação de mundo da edição (ex: `'TECH'`, `'MUSIC'`, `'GEAR'`). |

### 3. Tabela `subscribers` (Assinantes do Zine)
Mapeamento dos mundos nos quais o assinante está conectado para receber transmissões ativas.

| Coluna | Tipo de Dado | Restrição | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `active_worlds` | `text[]` | NOT NULL | `'{TECH}'` | Array de mundos ativos para a transmissão omnichannel do leitor. |

---

## 🏎️ Otimização & Indexação (Performance)
Para garantir que as consultas de feed ordenados e filtrados por mundo sejam de baixíssima latência (menos de 5ms), criaremos índices de árvore B (B-Tree) nas colunas de filtragem frequente.

```sql
-- Índice para filtragem rápida de posts por mundo e score de relevância
CREATE INDEX IF NOT EXISTS idx_posts_world_score_status 
ON posts(world, score DESC) 
WHERE status = 'approved';

-- Índice para busca de edições segmentadas por mundo
CREATE INDEX IF NOT EXISTS idx_newsletters_world_edition 
ON newsletters(world, edition_number DESC) 
WHERE status = 'published';
```

---

## 🚀 Script SQL de Migração Retrocompatível (Seguro)

Este script foi desenhado com comandos isolados e tratamento de nulidade para assegurar que a execução em produção não interrompa as operações ativas do Fresh News. Os registros legados são atualizados automaticamente para o mundo `'TECH'`, garantindo consistência relacional total.

```sql
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
-- PARTE C: Modificações na Tabela SUBSCRIBER
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
```

---

## 🛠️ Procedimento de Execução na Nuvem (Supabase Console)

1. Faça login no [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione o projeto `tech-news-platform` (produção).
3. Navegue até a aba **SQL Editor** no painel lateral esquerdo.
4. Crie uma nova query chamada `02_schema_multiverse_migration`.
5. Copie e cole o Script SQL acima no editor.
6. Clique em **Run** (Executar).
7. Valide a saída para garantir que a transação foi commitada com sucesso.
