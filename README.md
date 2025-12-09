# 🛡️ Tech News - Plataforma de Curadoria Técnica com IA

**Versão:** 1.2 (Stable Release) | **Status:** ✅ Produção

---

O **Tech News** é um SaaS de curadoria de notícias tecnológicas totalmente automatizado. Utiliza uma **Arquitetura Híbrida** e **Inteligência Artificial Generativa (GPT-4o)** para atuar como um "Editor Chefe" digital, combatendo o hype e a desinformação com conteúdo técnico de alta densidade.

## 🚀 Diferenciais de Engenharia

### Ingestão Híbrida (Multi-Source)
- Consome dados de **~40 Feeds RSS** de Blogs de Engenharia (Netflix, Uber, Nubank, Google SRE)
- Integração com **TabNews** para capturar discussões da comunidade brasileira
- Processamento em paralelo com `Promise.allSettled` para máxima resiliência

### Curadoria via LLM (Arquitetura Map-Reduce)
- **Map:** Divide posts em chunks de 5 → Processa em paralelo via GPT-4o
- **Reduce:** Consolida e agrupa por categoria
- Persona "Dev-to-Dev" para tradução e explicação técnica em PT-BR

### Sistema de Scoring Inteligente
| Categoria | Pontuação | Exemplos |
|-----------|-----------|----------|
| 🛡️ Segurança | +5 | `vulnerability`, `CVE`, `security` |
| 🤖 IA/LLM | +5 | `GPT`, `Claude`, `Gemini`, `AI` |
| 💻 Dev Tools | +2 | `React`, `Docker`, `Kubernetes` |
| 📢 Ruído | -5 | `job`, `hiring`, `podcast` |
| 📱 Consumo | -10 | `iPhone`, `Galaxy`, `Black Friday` |

### Resiliência e Segurança
- **Trava de 24h:** Descarta automaticamente conteúdo obsoleto
- **Rate Limiting:** Delay de 2s entre envios de email (100% entregabilidade)
- **Fallback:** Tolerância a falhas individuais de feeds

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Core** | Next.js 15 (App Router) + TypeScript |
| **UI** | Tailwind CSS + shadcn/ui |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **IA Engine** | OpenAI GPT-4o |
| **Email** | Resend + React Email |
| **Validação** | Zod |
| **Testes** | Vitest + React Testing Library |
| **Infraestrutura** | Vercel (Cron Jobs) + Docker |

---

## 📁 Estrutura do Projeto

```
tech-news-platform/
├── actions/                 # Server Actions (Backend)
│   ├── auth.ts             # Login/Logout
│   ├── admin.ts            # CRUD newsletters (delete, update)
│   ├── subscribe.ts        # Inscrição de usuários
│   ├── unsubscribe.ts      # Cancelamento de inscrição
│   ├── publish.ts          # Disparo de emails
│   └── generate.ts         # Wrapper para gerar edição
│
├── app/                     # Rotas (App Router)
│   ├── page.tsx            # Homepage
│   ├── about/page.tsx      # Página Sobre
│   ├── login/page.tsx      # Login Admin
│   ├── archive/            # Arquivo de edições
│   │   ├── page.tsx        # Lista completa
│   │   └── [id]/           # Detalhe + Editor
│   └── api/
│       ├── generate/route.ts # Geração manual (POST)
│       └── cron/route.ts     # Cron Job (GET)
│
├── components/              # Componentes React
│   ├── news-card.tsx       # Card de edição
│   ├── newsletter-editor.tsx # Editor WYSIWYG
│   ├── subscribe-form.tsx  # Formulário de inscrição
│   └── ui/                 # shadcn/ui
│
├── emails/                  # Templates React Email
│   └── daily-template.tsx
│
├── lib/
│   └── services/
│       └── newsletter.ts   # Core: Ingestão + Geração (Map-Reduce)
│
└── __tests__/               # Testes automatizados
```

---

## 📦 Como Rodar

### Desenvolvimento Local (Docker)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/tech-news-platform.git
cd tech-news-platform

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# 3. Suba o ambiente
docker-compose up --build

# 4. Acesse
# http://localhost:3000
```

### Sem Docker

```bash
# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

---

## ⚙️ Variáveis de Ambiente

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# OpenAI
OPENAI_API_KEY=...

# Resend (Email)
RESEND_API_KEY=...

# Admin
ADMIN_PASSWORD=...

# Cron (Vercel)
CRON_SECRET=...

# Kill Switch (opcional)
ENABLE_CRON_JOB=true
```

---

## 🧪 Testes

```bash
# Modo watch (desenvolvimento)
npm test

# Execução única (CI/CD)
npm run test:run
```

**Cobertura Atual:**
- 38 testes passando
- Algoritmo de scoring (`scoreItem`)
- Componente `NewsCard`

Para mais detalhes, veja [TESTING.md](./TESTING.md).

---

## ⚡ Funcionalidades Administrativas

| Funcionalidade | Descrição |
|----------------|-----------|
| **Login Admin** | Acesse `/login` com a senha definida em `ADMIN_PASSWORD` |
| **Gerar Edição** | Botão flutuante ⚡ na Home (apenas para admin) |
| **Editar Draft** | Editor visual do JSON antes de publicar |
| **Publicar** | Dispara emails para todos os assinantes ativos |
| **Excluir** | Remove edição com reindexação automática |

### Agendamento Automático
- **Horário:** 06:00 BRT (Segunda a Sábado)
- **Config Vercel:** `0 9 * * 1-6`
- **Kill Switch:** Defina `ENABLE_CRON_JOB=false` para pausar

---

## 📊 Banco de Dados

### Tabelas Principais

#### `newsletters`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `edition_number` | SERIAL | Número da edição |
| `title` | TEXT | Título da edição |
| `content_json` | JSONB | Estrutura completa |
| `html_content` | TEXT | HTML para email |
| `status` | ENUM | `draft` \| `published` |

#### `subscribers`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `email` | TEXT | Email do assinante |
| `status` | ENUM | `active` \| `unsubscribed` |
| `unsubscribe_token` | UUID | Token único para cancelar |

#### `posts`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | PK |
| `title` | TEXT | Título do post |
| `url` | TEXT | URL única (evita duplicatas) |
| `score` | INTEGER | Pontuação de relevância |
| `status` | ENUM | `pending` \| `approved` \| `published` |

Para o diagrama completo, veja [DIAGRAM.md](./DIAGRAM.md).

---

## 📚 Documentação Adicional

| Arquivo | Descrição |
|---------|-----------|
| [STUDY_GUIDE.md](./STUDY_GUIDE.md) | Guia de estudo completo (arquitetura, fluxos, código) |
| [RELEASE_NOTES.md](./RELEASE_NOTES.md) | Changelog e histórico de versões |
| [TESTING.md](./TESTING.md) | Guia de testes e cobertura |
| [DIAGRAM.md](./DIAGRAM.md) | Diagrama de classes (Mermaid) |

---

## 🔮 Roadmap (v1.3)

- [ ] Dashboard administrativo com métricas
- [ ] Suporte a múltiplos formatos (HTML/Plain Text)
- [ ] Sistema de tags customizáveis
- [ ] Integração com Analytics
- [ ] Webhooks para eventos

---

**Mantido por:** Tech News Team  
**Licença:** MIT
