# 📚 GUIA DE ESTUDO - Tech News Platform

**Período de Estudo:** 07/12 a 10/12/2025 (3 dias)  
**Última Atualização:** 07/12/2025

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Banco de Dados (Supabase)](#5-banco-de-dados-supabase)
6. [Server Actions (Backend)](#6-server-actions-backend)
7. [Serviços (Lib)](#7-serviços-lib)
8. [Componentes React](#8-componentes-react)
9. [Rotas e Páginas](#9-rotas-e-páginas)
10. [Fluxos de Negócio](#10-fluxos-de-negócio)
11. [Cronograma de Estudo Sugerido](#11-cronograma-de-estudo-sugerido)

---

## 1. VISÃO GERAL DO PROJETO

O **Tech News** é um **SaaS de curadoria automática de notícias tecnológicas**. Ele funciona como um "Editor Chefe" digital que:

1. **Coleta** notícias de ~40 feeds RSS (Nubank, Netflix, TabNews, etc.)
2. **Pontua** cada notícia por relevância técnica (segurança, cloud, IA, etc.)
3. **Processa via IA** (GPT-4o) usando arquitetura Map-Reduce
4. **Gera uma Newsletter** em formato HTML profissional
5. **Dispara por e-mail** para os assinantes via Resend

### Diferenciais
- **Trava de 24h:** Ignora notícias velhas
- **Filtro Anti-Ruído:** Penaliza eletrônicos de consumo (TV, iPhone, etc.)
- **Rate Limiting:** Delay de 2s entre envios para garantir entregabilidade
- **Painel Admin:** Edição de drafts, publicação manual, exclusão com reindexação

---

## 2. ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  ┌─────────┐ ┌───────────┐ ┌────────────┐ ┌─────────────────┐  │
│  │ page.tsx│ │ NewsCard  │ │SubscribeForm│ │NewsletterEditor│  │
│  └────┬────┘ └─────┬─────┘ └──────┬─────┘ └────────┬────────┘  │
│       │            │              │                 │           │
│       └────────────┴──────────────┴─────────────────┘           │
│                              ▼                                   │
│                      SERVER ACTIONS                              │
│  ┌──────────┐ ┌───────────┐ ┌─────────┐ ┌──────────────────┐   │
│  │ auth.ts  │ │subscribe.ts│ │publish.ts│ │     admin.ts     │   │
│  └────┬─────┘ └─────┬─────┘ └────┬────┘ └────────┬─────────┘   │
│       │             │            │               │              │
└───────┼─────────────┼────────────┼───────────────┼──────────────┘
        │             │            │               │
        ▼             ▼            ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTES (Serverless)                      │
│        ┌─────────────────┐        ┌─────────────────┐           │
│        │ /api/generate   │        │   /api/cron     │           │
│        │   (POST)        │        │    (GET)        │           │
│        └────────┬────────┘        └────────┬────────┘           │
│                 │                          │                     │
└─────────────────┼──────────────────────────┼─────────────────────┘
                  │                          │
                  ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LIB/SERVICES (Lógica Core)                   │
│              ┌───────────────────────────────────┐              │
│              │      newsletter.ts                │              │
│              │  ┌─────────────────────────────┐  │              │
│              │  │ ingestPostsService()         │  │              │
│              │  │ generateNewsletterService()  │  │              │
│              │  │ scoreItem()                  │  │              │
│              │  └─────────────────────────────┘  │              │
│              └───────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS                            │
│    ┌──────────┐    ┌───────────┐    ┌────────────────┐         │
│    │ Supabase │    │  OpenAI   │    │     Resend     │         │
│    │(Postgres)│    │  GPT-4o   │    │  (Email API)   │         │
│    └──────────┘    └───────────┘    └────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. STACK TECNOLÓGICA

| Categoria | Tecnologia | Uso |
|-----------|------------|-----|
| **Core** | Next.js 15 (App Router) | Framework Full-Stack |
| **Linguagem** | TypeScript | Tipagem estática |
| **Estilização** | Tailwind CSS | Utility-first CSS |
| **Componentes UI** | shadcn/ui | Componentes reutilizáveis |
| **Banco de Dados** | Supabase (PostgreSQL) | Persistência + RLS |
| **IA** | OpenAI GPT-4o | Geração de conteúdo |
| **Email** | Resend + React Email | Envio transacional |
| **Validação** | Zod | Schema validation |
| **Hosting** | Vercel | Deploy + Cron Jobs |
| **Parser RSS** | rss-parser | Consumo de feeds |

---

## 4. ESTRUTURA DE PASTAS

```
tech-news-platform/
├── actions/                 # 🔵 SERVER ACTIONS (Backend Lógico)
│   ├── auth.ts             # Login/Logout
│   ├── admin.ts            # CRUD de newsletters (delete, update)
│   ├── subscribe.ts        # Inscrição de usuários
│   ├── unsubscribe.ts      # Cancelamento de inscrição
│   ├── publish.ts          # Disparo de emails
│   └── generate.ts         # Wrapper para gerar edição
│
├── app/                     # 🟢 ROTAS (App Router)
│   ├── page.tsx            # Homepage (/)
│   ├── layout.tsx          # Layout global
│   ├── globals.css         # Estilos globais
│   ├── about/page.tsx      # Página Sobre
│   ├── login/page.tsx      # Página de Login Admin
│   ├── unsubscribe/page.tsx # Página de cancelamento
│   ├── archive/
│   │   ├── page.tsx        # Arquivo completo (/archive)
│   │   └── [id]/
│   │       ├── page.tsx    # Detalhe da edição (/archive/uuid)
│   │       └── edit/page.tsx # Editor de draft
│   └── api/
│       ├── generate/route.ts # API de geração manual (POST)
│       └── cron/route.ts     # API do Cron Job (GET)
│
├── components/              # 🟡 COMPONENTES REACT
│   ├── news-card.tsx       # Card de edição (client component)
│   ├── newsletter-editor.tsx # Editor WYSIWYG de JSON
│   ├── subscribe-form.tsx  # Formulário de inscrição
│   ├── publish-button.tsx  # Botão de publicar
│   ├── scroll-link.tsx     # Link com scroll suave
│   ├── ui/                 # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── dev/
│       └── FloatingDevMenu.tsx # Menu dev (admin only)
│
├── emails/                  # 📧 TEMPLATES DE EMAIL
│   └── daily-template.tsx  # Template React Email da newsletter
│
├── lib/                     # 📚 UTILITÁRIOS E SERVIÇOS
│   ├── utils.ts            # Helper cn() para classNames
│   ├── services/
│   │   └── newsletter.ts   # CORE: Ingestão + Geração
│   └── supabase/
│       └── server.ts       # Cliente Supabase SSR
│
├── supabase/
│   └── schema.sql          # Definição das tabelas
│
└── public/                  # Arquivos estáticos
```

---

## 5. BANCO DE DADOS (SUPABASE)

### Tabelas Principais

#### 📰 `newsletters`
Armazena cada edição gerada.

```sql
CREATE TABLE newsletters (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition_number  SERIAL,                    -- Número da edição (1, 2, 3...)
  title           TEXT NOT NULL,             -- Título da edição
  summary_intro   TEXT,                      -- Introdução/resumo
  content_json    JSONB,                     -- Estrutura completa (categories, items)
  html_content    TEXT,                      -- HTML renderizado para email
  status          newsletter_status DEFAULT 'draft',  -- 'draft' | 'published'
  created_at      TIMESTAMPTZ DEFAULT now(),
  published_at    TIMESTAMPTZ               -- Quando foi publicada
);
```

#### 👤 `subscribers`
Lista de assinantes da newsletter.

```sql
CREATE TABLE subscribers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT UNIQUE NOT NULL,
  status            subscriber_status DEFAULT 'active',  -- 'active' | 'unsubscribed'
  unsubscribe_token UUID DEFAULT uuid_generate_v4() NOT NULL,  -- Token único para cancelar
  created_at        TIMESTAMPTZ DEFAULT now()
);
```

#### 📝 `posts`
Posts coletados dos feeds RSS (cru, antes de virar newsletter).

```sql
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  url         TEXT UNIQUE NOT NULL,  -- Evita duplicatas
  content     TEXT,
  summary     TEXT,
  source      TEXT,                  -- Hostname do feed
  score       INTEGER DEFAULT 0,     -- Pontuação de relevância
  status      post_status DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected' | 'published'
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Estrutura JSONB (`content_json`)

```typescript
interface NewsletterContent {
  title: string;        // "O estagiário derrubou a prod?"
  intro: string;        // Texto de introdução
  quickTakes: string[]; // ["⚡ Manchete 1", "🔥 Manchete 2"]
  categories: Array<{
    name: string;       // "🛡️ CIBERSEGURANÇA"
    items: Array<{
      headline: string; // "🔥 Nova CVE crítica no Log4j"
      story: string;    // "A vulnerabilidade permite..."
      link: string;     // "https://..."
    }>;
  }>;
}
```

---

## 6. SERVER ACTIONS (BACKEND)

### 📁 `actions/auth.ts`
**Responsabilidade:** Autenticação do Admin

```typescript
// login(formData) - Verifica senha, cria cookie 'admin_session'
// logout() - Deleta cookie, redireciona para /
```

**Fluxo:**
1. Usuário acessa `/login`
2. Digita a senha (ADMIN_PASSWORD do env)
3. Se correto → Cookie httpOnly por 7 dias → Redirect `/`
4. Se errado → Redirect `/login?error=invalid_password`

---

### 📁 `actions/subscribe.ts`
**Responsabilidade:** Gerenciar inscrições

```typescript
// subscribe(prevState, formData) - Server Action Progressivo
```

**Lógica:**
1. Valida email com Zod
2. Se já existe e está `active` → "Já inscrito"
3. Se existe e está `unsubscribed` → Reativa
4. Se não existe → Insert novo

**Conceitos Importantes:**
- `useActionState` (React 19) para estado progressivo
- Retorna `SubscribeState` com `success`, `message`, `errors`

---

### 📁 `actions/publish.ts`
**Responsabilidade:** Disparar emails para assinantes

```typescript
// publishNewsletter(newsletterId) - Envia emails + muda status
```

**Fluxo:**
1. Busca newsletter por ID
2. Se já `published` → Abort
3. Busca todos subscribers `active`
4. Loop sequencial com `delay de 2s` entre cada envio
5. Substitui `href="#"` pelo link personalizado de unsubscribe
6. Atualiza status para `published` + `published_at`

**Rate Limiting:**
```typescript
await new Promise(resolve => setTimeout(resolve, 2000)) // 2s entre envios
```

---

### 📁 `actions/admin.ts`
**Responsabilidade:** Operações administrativas

```typescript
// handleLogout() - Logout + redirect
// deleteNewsletter(id, editionNumber) - Delete + reindexação
// updateNewsletter(id, data) - Update JSON + regenera HTML
```

**Reindexação na Exclusão:**
Ao deletar edição #3, todas as > 3 são decrementadas:
```
#4 → #3
#5 → #4
```

---

## 7. SERVIÇOS (LIB)

### 📁 `lib/services/newsletter.ts`
**O CORAÇÃO DO SISTEMA** - 549 linhas de lógica pura.

#### 🔹 `scoreItem(item)`
Calcula relevância de uma notícia.

```typescript
// Palavras Críticas (+5): security, vulnerability, ai, llm, release...
// Palavras Tech (+2): react, docker, aws, kubernetes...
// Ruído (-5): hiring, job, podcast...
// Consumidor (-10): tv, iphone, samsung, unboxing, promo...
```

**Exemplo:**
```
"Nova versão do React 19 com security fix" 
→ +5 (security) +5 (release) +2 (react) = 12 pontos
```

---

#### 🔹 `ingestPostsService()`
**Fase 1 do Pipeline** - Coleta e armazena posts.

**Fluxo:**
1. Parse de ~40 feeds RSS em paralelo (`Promise.allSettled`)
2. Aplica **Trava de 24h** (ignora posts > 1 dia)
3. Calcula `score` para cada item
4. Ordena por score (desc) → data (desc)
5. Pega TOP 100
6. Upsert no Supabase (ignora duplicatas por URL)

**Retorno:**
```typescript
{ success: true, total: 100, inserted: 85, skipped: 15, avgScore: "7.2" }
```

---

#### 🔹 `generateNewsletterService()`
**Fase 2 do Pipeline** - Arquitetura Map-Reduce com IA.

**Fluxo Detalhado:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SELEÇÃO                                                      │
│    - Busca até 25 posts (approved primeiro, depois pending)     │
│    - Ordena por score (maior primeiro)                          │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. CHUNKING                                                     │
│    - Divide 25 posts em chunks de 5                             │
│    - [chunk1(5), chunk2(5), chunk3(5), chunk4(5), chunk5(5)]   │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MAP (Paralelo)                                               │
│    - Promise.all para processar todos os chunks simultaneamente │
│    - Cada chunk → 1 chamada GPT-4o                              │
│    - Prompt define categorias (CIBERSEG, DEV, IA, DEVOPS, MERC) │
│    - Resposta em JSON com headline, story, link, category       │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. REDUCE                                                       │
│    - .flat() para consolidar todos os arrays                    │
│    - Agrupa por categoria (Map<string, items[]>)                │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. METADADOS                                                    │
│    - Chamada leve ao GPT-4o só com as headlines                 │
│    - Gera: title criativo, intro, quickTakes                    │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. MONTAGEM                                                     │
│    - Junta tudo em contentJson                                  │
│    - Renderiza HTML via React Email                             │
│    - Salva como 'draft' no Supabase                             │
│    - Marca posts usados como 'published'                        │
└─────────────────────────────────────────────────────────────────┘
```

**Por que Map-Reduce?**
- **Paralelismo:** 5 chamadas de IA simultâneas (mais rápido)
- **100% Cobertura:** Nenhum post é "esquecido" pela IA
- **Resiliência:** Se 1 chunk falha, os outros continuam

---

### 📁 `lib/supabase/server.ts`
Cliente SSR do Supabase com cookie handling.

```typescript
// Usa @supabase/ssr para integração com Next.js App Router
// Gerencia cookies automaticamente para RLS
```

---

## 8. COMPONENTES REACT

### 🟡 `NewsCard` (Client Component)
**Arquivo:** `components/news-card.tsx`

**Props:**
```typescript
interface NewsCardProps {
  id: string;
  edition: number;
  title: string;
  date: string;
  intro?: string;
  status?: 'draft' | 'published';
  isAdmin?: boolean;
}
```

**Funcionalidades:**
- Link para `/archive/{id}`
- Badge "Draft" se não publicado (só admin vê)
- Badge `#{edition}` sempre visível
- Botões de Admin: Publicar, Editar, Excluir

**Exclusão com Confirmação:**
```typescript
if (!confirm(`ATENÇÃO: Isso excluirá a Edição #${edition}...`)) return;
```

---

### 🟡 `NewsletterEditor` (Client Component)
**Arquivo:** `components/newsletter-editor.tsx`

**Responsabilidade:** Editor visual do JSON da newsletter.

**Estrutura:**
1. Seção "Informações Gerais" (title, intro)
2. Seção "Giro Tech" (quickTakes[])
3. Seção de Categorias (nome + items)

**Salvamento:**
```typescript
await updateNewsletter(id, data); // Regenera HTML automaticamente
```

---

### 🟡 `SubscribeForm` (Client Component)
**Arquivo:** `components/subscribe-form.tsx`

**Usa `useActionState`** (React 19):
```typescript
const [state, action, isPending] = useActionState(subscribe, initialState);
```

**Estados:**
- `isPending` → Loader spinner
- `state.success` → Mensagem verde
- `state.errors` → Mensagem vermelha

---

### 🟡 `PublishButton` (Client Component)
**Arquivo:** `components/publish-button.tsx`

Botão que chama `publishNewsletter()` e mostra loading.

---

## 9. ROTAS E PÁGINAS

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Page (SSR) | Homepage com últimas 6 edições |
| `/login` | Page | Formulário de senha do admin |
| `/about` | Page | Página institucional |
| `/archive` | Page | Lista completa de edições |
| `/archive/[id]` | Dynamic | Visualização de uma edição |
| `/archive/[id]/edit` | Dynamic | Editor de draft (admin) |
| `/unsubscribe` | Page | Página de cancelamento (via token) |
| `/api/generate` | API Route (POST) | Geração manual de edição |
| `/api/cron` | API Route (GET) | Ingestão automática (Vercel Cron) |

---

## 10. FLUXOS DE NEGÓCIO

### 🔄 Fluxo Completo (Automático)

```
06:00 BRT ─────────────────────────────────────────────────────────┐
                                                                   │
    ┌─────────────────────────────────────────────────────────────┐│
    │ Vercel Cron → GET /api/cron                                 ││
    │ (com header Authorization: Bearer $CRON_SECRET)             ││
    └─────────────────────────────────────────────────────────────┘│
                                │                                   │
                                ▼                                   │
                    ┌─────────────────────┐                        │
                    │ ingestPostsService()│ ← Coleta RSS           │
                    └─────────────────────┘                        │
                                                                   │
    ⚡ O DISPARO DE EMAIL É MANUAL (Admin clica em Publicar)       │
                                                                   │
────────────────────────────────────────────────────────────────────
```

### 🔄 Fluxo Manual (Admin)

```
Admin ──┬─── Clica em "Gerar Edição" ─────────────────────────────┐
        │                                                          │
        │    POST /api/generate                                    │
        │         │                                                │
        │         ▼                                                │
        │    generateNewsletterService()                           │
        │         │                                                │
        │         ▼                                                │
        │    Nova edição salva como 'draft'                        │
        │                                                          │
        ├─── Edita draft (opcional) ──────────────────────────────│
        │         │                                                │
        │         ▼                                                │
        │    Editor → updateNewsletter()                           │
        │                                                          │
        └─── Clica em "Publicar" ─────────────────────────────────│
                  │                                                │
                  ▼                                                │
             publishNewsletter()                                   │
                  │                                                │
                  ▼                                                │
             Loop de envio (2s delay)                              │
                  │                                                │
                  ▼                                                │
             Status → 'published'                                  │
```

---

## 11. CRONOGRAMA DE ESTUDO SUGERIDO

### 📅 DIA 1 (07/12) - Fundamentos

**Manhã (2h):**
- [ ] Ler este guia completo
- [ ] Entender o diagrama de arquitetura
- [ ] Revisar schema.sql e entidades

**Tarde (2h):**
- [ ] Estudar `lib/services/newsletter.ts` linha por linha
- [ ] Entender a função `scoreItem()`
- [ ] Entender `ingestPostsService()` e o fluxo de RSS

**Noite (1h):**
- [ ] Desenhar o fluxo Map-Reduce em papel
- [ ] Revisar anotações

---

### 📅 DIA 2 (08/12) - Server Actions e Componentes

**Manhã (2h):**
- [ ] Estudar todas as Server Actions em `/actions`
- [ ] Entender o fluxo de autenticação (cookies)
- [ ] Entender o fluxo de subscribe/unsubscribe

**Tarde (2h):**
- [ ] Estudar os componentes React principais
- [ ] Entender `useActionState` (React 19)
- [ ] Revisar o template de email (`daily-template.tsx`)

**Noite (1h):**
- [ ] Rodar o projeto localmente
- [ ] Testar fluxo de inscrição
- [ ] Testar login de admin

---

### 📅 DIA 3 (09/12) - Integração e Revisão

**Manhã (2h):**
- [ ] Estudar as rotas de API (`/api/cron`, `/api/generate`)
- [ ] Entender a config do Vercel Cron
- [ ] Revisar environment variables necessárias

**Tarde (2h):**
- [ ] Fazer um "dry run" mental de todo o fluxo
- [ ] Anotar dúvidas para pesquisar
- [ ] Revisar conceitos de SSR vs Client Components

**Noite (1h):**
- [ ] Criar flashcards com perguntas-chave
- [ ] Revisar pontos fracos

---

### 📅 DIA 4 (10/12) - Dia D

**Manhã:**
- [ ] Revisão geral dos flashcards
- [ ] Reler as partes mais complexas (Map-Reduce)
- [ ] Descansar antes da prova/apresentação

---

## 🔑 CONCEITOS-CHAVE PARA MEMORIZAR

1. **Map-Reduce:** Divide posts em chunks → Processa em paralelo → Consolida
2. **Score de Relevância:** Crítico (+5), Tech (+2), Ruído (-5), Consumidor (-10)
3. **Trava de 24h:** Ignora posts com `pubDate > 24 horas atrás`
4. **Rate Limiting:** `setTimeout(2000)` entre envios de email
5. **useActionState:** Hook React 19 para Server Actions progressivas
6. **Client vs Server Components:** `'use client'` define componente interativo

---

## ❓ PERGUNTAS DE AUTO-AVALIAÇÃO

1. Qual é a diferença entre `ingestPostsService()` e `generateNewsletterService()`?
2. Por que usamos Map-Reduce ao invés de uma única chamada de IA?
3. Como funciona a reindexação quando uma edição é excluída?
4. Qual é o papel do `unsubscribe_token` na tabela subscribers?
5. Por que o delay de 2 segundos é importante no `publishNewsletter()`?
6. O que acontece se um feed RSS falhar durante a ingestão?
7. Como o admin é identificado no sistema?

---

**Boa sorte nos estudos! 🚀**
