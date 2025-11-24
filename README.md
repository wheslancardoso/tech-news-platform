# 🛡️ Tech News API - Plataforma de Curadoria Técnica com IA

**Versão:** 1.2 (Stable Release) | **Status:** ✅ Concluído

---

O **Tech News** é um SaaS de curadoria de notícias tecnológicas totalmente automatizado. Diferente de agregadores comuns, ele utiliza uma **Arquitetura Híbrida** e **Inteligência Artificial Generativa** para atuar como um "Editor Chefe", combatendo o hype e a desinformação com conteúdo técnico de alta densidade.

## 🚀 Diferenciais de Engenharia

### Ingestão Híbrida (Multi-Source):
- Consome dados de **~40 Feeds RSS** de Blogs de Engenharia (Netflix, Uber, Nubank, Google SRE).
- Consome paralelamente a **API REST do TabNews** para capturar discussões relevantes da comunidade brasileira.

### Curadoria via LLM (GPT-4o):
- O sistema não faz apenas resumo. Ele utiliza **Prompt Engineering avançado** com uma persona definida ("Tech Lead Descontraído") para filtrar fofocas, traduzir para PT-BR e explicar o impacto técnico de cada notícia.

### Resiliência e Segurança:
- **Trava de 24h**: Filtro temporal que descarta automaticamente conteúdo obsoleto na fonte.
- **Rate Limiting**: Sistema de distribuição de e-mails com throttling (delay) para garantir 100% de entregabilidade e respeito aos limites de API.

## 🛠️ Stack Tecnológica

- **Core:** Next.js 15 (App Router) + TypeScript
- **Backend:** Serverless (Server Actions)
- **Banco de Dados:** Supabase (PostgreSQL)
- **IA Engine:** OpenAI (GPT-4o)
- **E-mail:** Resend (Transacional) + React Email
- **Infraestrutura:** Vercel (Cron Jobs) + Docker (Dev Environment)

## 📦 Como Rodar (Docker)

O projeto é containerizado para garantir execução idêntica em Windows, Linux e Mac.

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/tech-news-platform.git
cd tech-news-platform
```

2. **Configure as Variáveis de Ambiente:** Crie um arquivo `.env.local` na raiz com as chaves necessárias (Supabase, OpenAI, Resend).

3. **Suba o Ambiente:**
```bash
docker-compose up --build
```

4. **Acesse:** Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## ⚙️ Funcionalidades Administrativas

- **Painel Admin:** Acesse `/login` para autenticação.
- **Disparo Manual:** Utilize o botão flutuante ⚡ **(Dev) Gerar Edição** na Home para forçar a execução do pipeline de notícias fora do horário agendado.
- **Agendamento:** O sistema roda automaticamente às **06:00 (BRT)** de Segunda a Sábado via Vercel Cron.
