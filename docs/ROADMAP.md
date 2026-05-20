# 📍 ROADMAP — Fresh News Platform

> Documento vivo de progresso e próximos passos.
> Branch principal de desenvolvimento: `feat/admin-image-curation`
> Última atualização: 2026-05-20

---

## ✅ Fase 1 — Planejamento & Fundações

- [x] PRD de alta autoridade técnica → [`docs/PRD.md`](./PRD.md)
- [x] ADR-001: Edição Mestra Unificada com Snapshots JSONB → [`docs/adr/ADR-001`](./adr/ADR-001-master-edition-architecture.md)
- [x] ADR-002: Brutalismo Digital e Tema Camaleão → [`docs/adr/ADR-002`](./adr/ADR-002-digital-brutalist-chameleon-design.md)
- [x] ADR-003: Distribuição Omnichannel via n8n e WhatsApp → [`docs/adr/ADR-003`](./adr/ADR-003-omnichannel-distribution-n8n-whatsapp.md)
- [x] Templates JSON de workflows n8n com agentes de IA → [`docs/N8N_WORKFLOW_TEMPLATES.md`](./N8N_WORKFLOW_TEMPLATES.md)

---

## ✅ Fase 2 — Motor de IA/ML & Distribuição

- [x] Migration SQL: tabela `user_clicks` com RLS e índices de performance
- [x] API `/api/track`: redirecionamento rastreável + motor de afinidade por categoria
  - Lógica: 70% preferência histórica / 30% exploração (janela de 14 dias)
  - Evita "filter bubble" com coeficiente de exploração
- [x] `ChameleonScrollObserver`: altera `--primary` via Intersection Observer ao rolar entre seções
- [x] Página `/archive/[id]`: injeção de `data-theme-color` e `data-category-name` por seção
- [x] `formatWhatsAppMessage`: teaser minimalista com links rastreáveis para n8n
- [x] Prototipagem mobile completa (Stitch): Home, Admin, Archive, Preferences, Subscribe

**Commits:**
- `docs: adiciona PRD e ADRs para planejamento de produto e arquitetura`
- `feat: adiciona tracking de cliques, ML de afinidade, efeito camaleão e teaser WhatsApp`

---

## 🔲 Fase 3 — Banco de Dados & Infraestrutura

- [ ] Rodar migration `20260520170000_user_clicks_and_multitopic.sql` no Supabase
- [ ] Rodar migration `20260423164000_add_phone_to_subscribers.sql` (campo WhatsApp)
- [ ] Verificar tabela `user_clicks` criada corretamente (RLS, índices)
- [ ] Testar endpoint `/api/track` com params reais: `?sub=ID&cat=IA&url=https://...`
- [ ] Configurar `.env.local` com `NEXT_PUBLIC_APP_URL` e `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔲 Fase 4 — Testes E2E com Playwright

> Stack atual de testes unitários: **Vitest** (38 testes passando).
> A camada E2E será adicionada com **Playwright**, mantendo a pirâmide: Unit → Integration → E2E.

### Setup
- [ ] Instalar Playwright: `npm install -D @playwright/test`
- [ ] Instalar browsers: `npx playwright install --with-deps chromium`
- [ ] Criar `playwright.config.ts` com `baseURL: 'http://localhost:3000'`
- [ ] Criar estrutura de pastas:
  ```
  tests/
    e2e/
      fixtures/     → dados de teste (subscribers, posts, authState.json)
      pages/        → Page Objects (POM)
      specs/        → specs por funcionalidade
  ```

### Page Objects (POM) — obrigatório por regras do projeto
- [ ] `tests/e2e/pages/homePage.ts` — hero, listagem de edições, filtro por categoria
- [ ] `tests/e2e/pages/archivePage.ts` — leitura de edição, efeito camaleão, links rastreáveis
- [ ] `tests/e2e/pages/adminPage.ts` — login, criar edição, curadoria, publicação
- [ ] `tests/e2e/pages/subscriptionPage.ts` — formulário, preferências, confirmação

### Specs por Funcionalidade
- [ ] `tests/e2e/specs/home.spec.ts`
  - [ ] Carrega a home com a última edição em destaque
  - [ ] Filtra edições por categoria (IA, SEC, DEV, Música)
  - [ ] Links direcionam corretamente para `/archive/[id]`
- [ ] `tests/e2e/specs/chameleon.spec.ts`
  - [ ] Cor primária muda ao rolar para seção de categoria diferente
  - [ ] Cor retorna ao padrão ao sair das seções temáticas
- [ ] `tests/e2e/specs/tracking.spec.ts`
  - [ ] Clique em link rastreável redireciona para URL de destino correta
  - [ ] Clique é registrado na tabela `user_clicks` (verificar via API)
- [ ] `tests/e2e/specs/subscription.spec.ts`
  - [ ] Formulário valida campos obrigatórios (nome, email)
  - [ ] Inscrição bem-sucedida exibe confirmação
  - [ ] Inscrição duplicada exibe erro adequado
- [ ] `tests/e2e/specs/admin.spec.ts`
  - [ ] Login com credenciais válidas redireciona ao painel
  - [ ] Login com credenciais inválidas exibe erro
  - [ ] Criar nova edição com todos os campos
  - [ ] Publicar edição altera status para "publicado"
  - [ ] Envio WhatsApp dispara teaser minimalista

### Fixtures & Dados de Teste
- [ ] `tests/e2e/fixtures/subscriber.ts` — subscriber com categorias pré-selecionadas
- [ ] `tests/e2e/fixtures/edition.ts` — edição com posts de múltiplas categorias
- [ ] `tests/e2e/fixtures/authState.json` — sessão admin cacheada via `storageState`

### CI/CD
- [ ] Job `e2e` no GitHub Actions: `npx playwright test`
- [ ] Relatório HTML como artefato da pipeline: `npx playwright show-report`

---

## 🔲 Fase 5 — Interface Mobile Responsiva

- [ ] Mapear telas do Stitch (`stitch-screens/`) para componentes Next.js
- [ ] Home responsiva: hero compacto, grid de categorias em cards
- [ ] Página de leitura mobile: tipografia fluida, scroll suave
- [ ] Tela de preferências: toggles de categoria, campo WhatsApp
- [ ] Testar breakpoints: 375px, 414px, 768px

---

## 🔲 Fase 6 — ML Preditivo Avançado

- [ ] Expandir afinidade para considerar scroll depth (tempo de leitura)
- [ ] Modelo colaborativo: "quem leu X também leu Y" via SQL window functions
- [ ] Dashboard de analytics no Admin: heatmap de categorias por período
- [ ] Exportar preferências para segmentação de campanhas WhatsApp no n8n
- [ ] Sistema de Busca no Archive

---

## 🔲 Fase 7 — Deploy & Produção

- [ ] Configurar deploy no Vercel com variáveis de ambiente de produção
- [ ] Apontar domínio customizado
- [ ] Supabase em projeto de produção (separado do dev)
- [ ] Webhook n8n apontando para URL de produção
- [ ] PWA: transformar em Web App instalável
- [ ] Stress test: 500 subscribers recebendo teaser simultâneo

---

## 🎨 Referência de Design

| Elemento | Valor |
|---|---|
| Background | `#0D0D0D` |
| Border radius | `0px` |
| Border | `2px solid currentColor` |
| Tipografia | Space Grotesk 900 (headings), Inter 400 (body) |
| Categoria IA | Cyan `hsl(185, 100%, 50%)` |
| Categoria Dev | Green `hsl(142, 76%, 46%)` |
| Categoria SEC | Red `hsl(0, 84%, 60%)` |
| Categoria Música | Purple `hsl(270, 76%, 60%)` |

---

## 📜 Histórico de Decisões

| ADR | Decisão |
|---|---|
| [ADR-001](./adr/ADR-001-master-edition-architecture.md) | Edição Mestra Unificada com Snapshots JSONB |
| [ADR-002](./adr/ADR-002-digital-brutalist-chameleon-design.md) | Brutalismo Digital e Efeito Camaleão |
| [ADR-003](./adr/ADR-003-omnichannel-distribution-n8n-whatsapp.md) | Distribuição Omnichannel n8n + WhatsApp |

---

*Documento gerado em 2026-05-20 por Antigravity.*
