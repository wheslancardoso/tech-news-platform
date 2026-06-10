# 🗄️ Esquema de Banco de Dados: Fresh News Platform (v2.0)

Este documento detalha o esquema de banco de dados PostgreSQL do Supabase, refletindo a modelagem DDL real do projeto.

---

## 📋 Tabelas do Sistema

### 1. `public.subscribers` (Assinantes)
Gerencia os leads e o estado de recepção das newsletters.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `email` | `text` | `UNIQUE`, `NOT NULL` | Email único do assinante. |
| `phone` | `text` | `NULLABLE` | Telefone / WhatsApp do assinante. |
| `preferences` | `jsonb` | Default: `'[]'::jsonb` | Categorias preferenciais do assinante. |
| `status` | `text` | Default: `'active'` | `active`, `unsubscribed`. |
| `unsubscribe_token` | `uuid` | Default: `uuid_generate_v4()` | Token único para descadastro via link. |
| `active_worlds` | `text[]` | Default: `'{TECH}'` | Lista de mundos assinados (ex: `{'TECH', 'MUSIC'}`). |
| `created_at` | `timestamptz`| Default: `now()` | Data de inscrição. |

**Índices**: 
- `idx_subscribers_email` (btree) em `email`.
- `idx_subscribers_token` (btree) em `unsubscribe_token`.
- `idx_subscribers_phone` (btree) em `phone`.

---

### 2. `public.posts` (Repositório de Notícias)
Contém os registros capturados via RSS e processados por IA.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `title` | `text` | `NOT NULL` | Título da notícia. |
| `url` | `text` | `UNIQUE`, `NOT NULL` | Link original para deduplicação. |
| `content` | `text` | `NULLABLE` | Conteúdo bruto extraído (markdown). |
| `summary` | `text` | `NULLABLE` | Resumo técnico gerado por IA. |
| `source` | `text` | `NULLABLE` | Nome da fonte (ex: TechCrunch). |
| `score` | `integer` | Default: `0` | Nota de relevância (0-100). |
| `status` | `post_status` | Default: `'pending'` | Enum: `pending`, `approved`, `rejected`, `published`. |
| `category` | `text` | Default: `'TECH_HACKER'` | Categoria principal (ex: `TECH_HACKER`, `MUSIC`). |
| `sub_category` | `text` | Default: `'GERAL'` | Subcategoria (ex: `IA`, `SEC`, `HIP_HOP`, `ROCK_INDIE`). |
| `theme_config` | `jsonb` | Default: `'{}'` | Configurações estéticas camaleão (cores HSL, efeitos). |
| `whatsapp_summary` | `text` | `NULLABLE` | Teaser formatado para envio no WhatsApp. |
| `world` | `text` | Default: `'TECH'` | Universo ao qual o post pertence (`TECH`, `MUSIC`). |
| `metadata` | `jsonb` | `NULLABLE` | Metadados extras da notícia. |
| `created_at` | `timestamptz`| Default: `now()` | Data de captura. |

**Índices**:
- `idx_posts_status` (btree) para filtragem rápida por status.
- `idx_posts_score` (btree) para ordenação por relevância.
- `idx_posts_category_sub` (btree) composto em `category` e `sub_category`.
- `idx_posts_world_score_status` (btree) composto condicional em `world` e `score desc` onde `status = 'approved'`.

---

### 3. `public.newsletters` (Edições)
Registro das edições enviadas aos assinantes e disponibilizadas na web.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `edition_number` | `serial` | `NOT NULL` | Contador sequencial automático. |
| `title` | `text` | `NOT NULL` | Assunto/Título do email. |
| `summary_intro` | `text` | `NULLABLE` | Breve introdução à edição. |
| `content_json` | `jsonb` | `NULLABLE` | Snapshot imutável dos posts incluídos na edição. |
| `debate_log` | `jsonb` | Default: `'[]'` | Transcrição do debate entre as IAs especialistas. |
| `html_content` | `text` | `NULLABLE` | Código HTML final do email. |
| `status` | `text` | Default: `'draft'` | `draft`, `published`. |
| `image_url` | `text` | `NULLABLE` | URL da imagem gerada por IA (Capa da edição). |
| `image_prompt` | `text` | `NULLABLE` | Prompt de IA utilizado para gerar a imagem. |
| `category` | `text` | `NULLABLE` | Categoria de destaque. |
| `world` | `text` | Default: `'TECH'` | Universo ao qual pertence (`TECH`, `MUSIC`). |
| `created_at` | `timestamptz`| Default: `now()` | Data de criação. |
| `published_at` | `timestamptz`| `NULLABLE` | Data da publicação e disparo. |

**Índices**:
- `idx_newsletters_status` (btree) em `status`.
- `idx_newsletters_edition` (btree) em `edition_number`.
- `idx_newsletters_world_edition` (btree) composto condicional em `world` e `edition_number desc` onde `status = 'published'`.

---

### 4. `public.sources` (Fontes de Conteúdo RSS)
Gerencia as fontes RSS cadastradas no portal Fresh News.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `name` | `text` | `NOT NULL` | Nome legível do canal (ex: The Verge). |
| `rss_url` | `text` | `UNIQUE`, `NOT NULL` | Link do feed XML/RSS oficial. |
| `category_hint` | `text` | `NULLABLE` | Dica de categoria (ex: `SECURITY`, `MUSICA_URBANA`). |
| `is_active` | `boolean` | Default: `true` | Habilita/Desabilita a leitura no n8n. |
| `created_at` | `timestamptz`| Default: `now()` | Data de inserção. |

---

### 5. `public.user_clicks` (Eventos de Rastreabilidade)
Registra a interação do usuário com posts individuais para o algoritmo de recomendação reativa.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `subscriber_id` | `uuid` | FK, `subscribers.id` | Identificador do assinante (Cascade delete). |
| `newsletter_id` | `uuid` | FK, `newsletters.id` | Identificador da edição associada (Cascade delete). |
| `category` | `text` | `NOT NULL` | Categoria do post clicado. |
| `clicked_at` | `timestamptz`| Default: `now()` | Timestamp do clique. |

**Índices**:
- `idx_user_clicks_subscriber` (btree) em `subscriber_id` para busca ágil de interações recentes.

---

## 🔒 Políticas RLS (Row Level Security)

As políticas de acesso garantem que o banco não seja exposto indevidamente na API pública (PostgREST/REST).

### Tabela `subscribers`
- **INSERT (Público/Anon)**: Permitido para qualquer visitante se cadastrar.
- **SELECT/UPDATE/DELETE (Público/Anon)**: Bloqueado. O Next.js no servidor gerencia estas operações de forma segura através do cliente administrativo (`service_role`).

### Tabela `posts`
- **SELECT (Público/Anon)**: Permitido apenas para registros com `status = 'approved'`.
- **UPDATE/INSERT/DELETE (Público/Anon)**: Bloqueado.

### Tabela `newsletters`
- **SELECT (Público/Anon)**: Permitido apenas para registros com `status = 'published'`.
- **UPDATE/INSERT/DELETE (Público/Anon)**: Bloqueado.

### Tabelas `sources` e `user_clicks`
- **TODAS AS OPERAÇÕES (Público/Anon)**: Completamente bloqueadas no RLS. O acesso é feito apenas de forma interna (n8n e Next.js Server Actions) via chave `service_role`.
