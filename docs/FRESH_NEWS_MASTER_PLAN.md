# 📰 FRESH NEWS: Master Plan & Status Report (v2.0)

> **Data da última atualização:** 10/06/2026  
> **Status do Projeto:** Fase de Integração Multiverso (Música)  
> **Meta da Apresentação:** 15/06/2026  

## 🎯 Visão Criativa: "The Neo-Broadsheet"
A Fresh News evoluiu para uma plataforma editorial de alta autoridade baseada no multiverso. O design adota o conceito de **Digital Brutalism**, inspirado em jornais impressos físicos com uma roupagem reativa e tecnológica.

- **Estética:** Dark mode profundo (`#000000`), raio de borda zero (`0px radius`), tipografia de alto impacto (Space Grotesk) e linhas sólidas pesadas (`2px`).
- **Sistema Camaleão (Multiverso):** Efeitos dinâmicos que mudam de cor e estilo na interface dependendo do nicho de conteúdo ativo. Tech (Cyber Cyan, Emerald Green, Warning Red, Orange) e Música (Gold, Red, Purple, Orange).

---

## 🛠️ Stack Tecnológica (v2.0)
- **Frontend:** Next.js 15 (App Router), React, TailwindCSS.
- **Backend/DB:** Supabase (PostgreSQL, Auth, RLS Privado, Chave Administrativa de Servidor).
- **IA:** OpenAI (GPT-5-mini e GPT-5.4-mini) no n8n para classificação e redação especializada.
- **Automação:** n8n Webhook para ingestão inteligente, deduplicação e segmentação por interesses.
- **Distribuição:** Resend (Email responsivo premium) e Evolution API (WhatsApp) no backlog.
- **Design:** Stitch MCP (Prototipagem Rápida e validação de layouts).

---

## ✅ O que já foi feito (Status em 10/06/2026)

### 1. Segurança & Integridade de Banco (Concluído)
- **RLS Habilitado em Subscribers:** Habilitação estrita do Row Level Security na tabela `subscribers`. Remoção de políticas de desenvolvimento inseguras.
- **Bypass Seguro com Admin Client:** Correção estrutural em todas as Server Actions e páginas de servidor Next.js (`archive`, `preferences`, `subscribe`, `unsubscribe`) para utilizarem `createAdminClient()` via `service_role` protegida.
- **Saneamento de Fontes:** Remoção de links duplicados e inválidos em `sources`.
- **Alinhamento de Schema:** Sincronização completa do arquivo local `supabase/schema.sql` com o banco real de produção.

### 2. Normalização Histórica de Dados (Concluído)
- **Migração de Categorias:** Todos os 869 posts históricos foram normalizados para o padrão `TECH_HACKER` e classificados nas subcategorias correspondentes (`IA`, `SEC`, `DEV`, `CLOUD`, `GERAL`), otimizando a compatibilidade retroativa e o motor de indexação.

### 3. Sólida Cobertura de Testes Unitários (Concluído)
- **Vitest Unit Tests:** Correção do conflito de testes locais com o Playwright e correção dos mocks do Supabase. Todos os 46 testes unitários estão passando.

---

## 🚧 Em Execução (Cronograma até 15/06/2026)

### Fase 3: Integração do Universo de Música (Meta: 11/06 - 12/06)
- **Workflow n8n:** Ajustar o nó Switch inicial para separar a rota `TECH` e `MUSIC` com base no `category_hint` das fontes.
- **Especialistas Musicais:** Integrar prompts das IAs especialistas em Hip-hop, Rock/Indie e Eletrônica.
- **Visual Camaleão no Frontend:** Mapear os temas visuais de música (vinyl grain, xerox, neon grid) no Next.js (`ChameleonEffects.tsx`).
- **World Selector:** Homologar o seletor de mundo no Next.js para alternar posts e edições.

### Fase 4: Validação E2E com Playwright (Meta: 13/06)
- **Playwright Test Suite:** Executar os testes de integração e ponta a ponta simulando cliques e verificação de afinidades.
- **Ajustes de Localhost:** Testar de forma isolada os specs de chameleon, multiverse e tracking.

### Fase 5: Deploy & Apresentação (Meta: 14/06 - 15/06)
- **Deploy na Vercel:** Disparar a versão v2.0 com todas as chaves e caminhos alinhados em produção.
- **Demo Rehearsal:** Validar a criação manual de uma edição no admin e publicação completa.

---

## 📱 Port Mobile Flutter (Backlog Pós-Apresentação)
- Projeto Flutter com `supabase_flutter` focado em leitura rápida do feed por mundo, personalização de interesses e efeito camaleão em Dart.
