# 🗄️ Esquema de Banco de Dados: Tech News Platform

Este documento detalha o esquema oficial do banco de dados PostgreSQL no Supabase, refletindo a modelagem DDL real do projeto.

---

## 📋 Tabelas do Sistema

### 1. `public.subscribers` (Assinantes)
Gerencia os leads e o estado de recepção da newsletter.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `email` | `text` | `UNIQUE`, `NOT NULL` | Email único do assinante. |
| `status` | `text` | Default: `'active'` | `active`, `unsubscribed`. |
| `unsubscribe_token` | `uuid` | Default: `uuid_generate_v4()` | Token único para descadastro via link. |
| `created_at` | `timestamptz`| Default: `now()` | Data de inscrição. |

**Índices**: 
- `idx_subscribers_token` (btree) em `unsubscribe_token` para buscas rápidas no fluxo de opt-out.

---

### 2. `public.posts` (Repositório de Notícias)
Contém os registros capturados via RSS e processados por IA.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `title` | `text` | `NOT NULL` | Título da notícia. |
| `url` | `text` | `UNIQUE`, `NOT NULL` | Link original para deduplicação. |
| `content` | `text` | `NULLABLE` | Conteúdo bruto extraído (opcional). |
| `summary` | `text` | `NULLABLE` | Resumo técnico gerado por IA. |
| `source` | `text` | `NULLABLE` | Nome da fonte (ex: TechCrunch). |
| `score` | `integer` | Default: `0` | Nota de relevância (0-100). |
| `status` | `post_status` | Default: `'pending'` | Enum: `pending`, `approved`, `rejected`. |
| `created_at` | `timestamptz`| Default: `now()` | Data de captura. |

**Índices**:
- `idx_posts_status` (btree) para filtragem no painel administrativo.
- `idx_posts_score` (btree) para ordenação por relevância.

---

### 3. `public.newsletters` (Edições)
Registro das newsletters criadas e seu respectivo histórico.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | `uuid` | PK, Default: `uuid_generate_v4()` | Identificador único. |
| `edition_number` | `serial` | `NOT NULL` | Contador sequencial automático. |
| `title` | `text` | `NOT NULL` | Assunto/Título do email. |
| `summary_intro` | `text` | `NULLABLE` | Breve introdução à edição. |
| `content_json` | `jsonb` | `NULLABLE` | Snapshot dos posts incluídos (Imutabilidade). |
| `html_content` | `text` | `NULLABLE` | Código HTML renderizado final. |
| `status` | `text` | Default: `'draft'` | `draft`, `published`. |
| `created_at` | `timestamptz`| Default: `now()` | Data de criação. |
| `published_at` | `timestamptz`| `NULLABLE` | Data e hora do envio/publicação. |

---

## 🔒 RL_S (Row Level Security)

As políticas de acesso garantem que o banco não seja exposto indevidamente.

### Tabela `subscribers`
- **INSERT**: Público (Permite que qualquer visitante se inscreva no formulário da Home).
- **SELECT/UPDATE**: Proibido para público. Utilizado pelo Admin para gestão.

### Tabelas `posts` e `newsletters`
- **SELECT (Público)**: Somente posts com `status = 'approved'` ou newsletters com `status = 'published'`.
- **ALL (Admin)**: Acesso total via `SERVICE_ROLE_KEY` nas Server Actions.

---

## 🏗️ Considerações Técnicas

> [!NOTE]
> A utilização de `JSONB` em `newsletters.content_json` foi mantida para garantir que o conteúdo enviado por email seja preservado no banco mesmo se os registros originais em `posts` forem alterados ou deletados.
