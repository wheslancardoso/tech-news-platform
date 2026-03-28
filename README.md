# 📰 Tech News Platform

Uma plataforma moderna de curadoria de notícias de tecnologia, alimentada por IA e focada em entregar insights técnicos de alto nível diretamente na caixa de entrada dos assinantes.

---

## 🚀 Visão Geral

O projeto automatiza o ciclo de vida de uma newsletter:
1. **Ingestão**: Captura de feeds RSS de fontes renomadas.
2. **Curadoria IA**: Resumos executivos e score de relevância.
3. **Moderação**: Painel administrativo premium para aprovação de conteúdo.
4. **Distribuição**: Envio de edições diárias via email (HTML Responsivo).

---

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), Tailwind CSS.
- **Backend/DB**: Supabase (PostgreSQL + RLS).
- **Inteligência**: OpenAI / Gemini (Prompt Engineering).
- **Email**: Resend / React Email.
- **Testes**: Vitest, Playwright.

---

## 📖 Documentação Detalhada (Arquitetura & Guias)

Explore cada pilar do projeto nos links abaixo:

1. 🎨 **[Design System](file:///home/lan/tech-news-platform/DESIGN_SYSTEM.md)**: Identidade visual, cores HSL e specs de componentes premium.
2. 🏛️ **[Arquitetura Admin](file:///home/lan/tech-news-platform/ADMIN_ARCHITECTURE.md)**: Roteamento, segurança de cookies e Server Actions.
3. 🚀 **[Workflow da Newsletter](file:///home/lan/tech-news-platform/NEWSLETTER_WORKFLOW.md)**: O pipeline completo do RSS à Inbox.
4. 🗄️ **[Esquema de Banco](file:///home/lan/tech-news-platform/DATABASE_SCHEMA.md)**: Modelagem de tabelas, índices e políticas de RLS.
5. 🤖 **[Engenharia de Prompts](file:///home/lan/tech-news-platform/AI_PROMPT_ENGINEERING.md)**: Como a IA analisa e resume as notícias.
6. 🛠️ **[Guia de Início](file:///home/lan/tech-news-platform/GETTING_STARTED.md)**: Variáveis de ambiente e setup local.
7. 🧪 **[Estratégia de Testes](file:///home/lan/tech-news-platform/TESTING_STRATEGY.md)**: Garantia de qualidade e CI/CD.

---

## 🚦 Como rodar o projeto

Consulte o arquivo **[GETTING_STARTED.md](file:///home/lan/tech-news-platform/GETTING_STARTED.md)** para instruções passo a passo sobre a configuração do `.env.local` e do banco de dados Supabase.

```bash
npm install
npm run dev
```

---

## 📐 Regras do Projeto (Convenções)
Todas as contribuições devem seguir o **[User Rules (Global)](file:///home/lan/tech-news-platform/.project_rules)** para padrões de Git, Commits Semânticos e estrutura de pastas.
