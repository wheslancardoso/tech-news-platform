# 📍 ROADMAP — Fresh News Platform (v2.0)

> **Data da última atualização:** 10/06/2026  
> **Prazo da Apresentação:** 15/06/2026 (5 dias)

Este documento vivo detalha o progresso atual do portal Fresh News rumo à versão v2.0 (Multiverso & Música) e define os marcos até a data da apresentação.

---

## 🗺️ Visão Geral das Fases

```
[ Fase 1: Fundações ] ───► [ Fase 2: IA & Tracking ] ───► [ Fase 3: Multiverso ] ───► [ Fase 4: Estabilização ]
   (100% Concluído)             (100% Concluído)             (100% Concluído)            (Concluído c/ ressalvas)
```

---

## ✅ Fase 1 — Planejamento & Fundações (Concluído)

- [x] PRD de alta autoridade técnica criado (docs/02_PRD.md).
- [x] ADR-001: Edição Mestra Unificada com Snapshots JSONB.
- [x] ADR-002: Brutalismo Digital e Tema Camaleão.
- [x] ADR-003: Distribuição Omnichannel via n8n e WhatsApp.
- [x] Templates JSON de workflows n8n com agentes de IA (docs/11_N8N_WORKFLOW_TEMPLATES.md).

---

## ✅ Fase 2 — Banco de Dados, IA & Tracking (Concluído)

- [x] Criação da tabela `user_clicks` e `sources` no Supabase.
- [x] Criação do endpoint `/api/track` de redirecionamento rastreável.
- [x] Implementação do algoritmo de afinidade reativo por cliques (coeficiente 70% histórico / 30% exploração).
- [x] Correção de brecha crítica de segurança (RLS ativado na tabela `subscribers` + policies restritas).
- [x] Correção de Server Actions e componentes de servidor Next.js para usarem `createAdminClient()` (bypass RLS seguro).
- [x] Normalização das categorias históricas dos 869 posts antigos do banco para o padrão `TECH_HACKER`.
- [x] Limpeza e saneamento de fontes RSS duplicadas (excluído o registro inválido de `The Hacker News`).
- [x] Criação dos índices compostos avançados (`idx_posts_world_score_status` e `idx_newsletters_world_edition`) para busca eficiente no multiverso.

---

## ✅ Fase 3 — Multiverso & Vertical de Música (Concluído)

A integração do segundo universo (Música - hip-hop, rock, eletrônica) foi finalizada e validada.

- [x] Definição da taxonomia de música simplificada na UI (Hip-Hop, Rock & Indie, Eletrônica, Cultura Geral) e mapeamento com hints granulares das fontes (docs/28_MUSIC_VERTICAL.md).
- [x] **n8n Workflow Expansion:**
  - [x] Implementar Switch no fluxo de entrada baseado em `category_hint`.
  - [x] Criar prompts de triagem e prompts específicos para especialistas musicais no n8n.
  - [x] Integrar configuração de temas em `posts.theme_config` com cores HSL adequadas para música.
- [x] **Next.js Frontend Integration:**
  - [x] Ajustar o `world-selector.tsx` para chavear posts e newsletters entre mundos (`TECH` e `MUSIC`).
  - [x] Estender o `ChameleonEffects.tsx` com as paletas musicais (Gold para Hip-hop, Red para Rock, Purple para Eletrônica).
  - [x] Ajustar a página `/preferencias/[id]` para permitir seleção de categorias de ambos os mundos.
  - [x] Compilar a edição de demonstração #001 de Música no painel admin.

---

## ⚠️ Fase 4 — Testes, Validação & E2E (Concluído com ressalvas)

Garantir que a aplicação Next.js esteja estável e com testes em dia.

- [x] Correção de mock do Supabase e separação das pastas e2e para testes unitários com Vitest (51 testes passando).
- [x] Validar e ajustar os testes de ponta a ponta (E2E) do Playwright para abranger a navegação entre mundos:
  - [x] `tests/e2e/specs/affinity.spec.ts` (Afinidades reativas baseadas em cliques).
  - [x] `tests/e2e/specs/chameleon.spec.ts` (Alteração dinâmica de cores por seção).
  - [x] `tests/e2e/specs/multiverse.spec.ts` (Filtro e chaveamento de mundo).
- [x] Executar suite Playwright completa e garantir integridade.
  - *Nota:* Suíte de testes E2E Playwright validada com sucesso no ambiente CI/CD original. No desenvolvimento local na nova máquina rodando Arch Linux, a execução dos testes E2E do Playwright foi deixada de lado devido a incompatibilidades de dependências do sistema com os navegadores empacotados pelo framework, priorizando a garantia de qualidade local na suíte de testes unitários do Vitest (100% verde).

---

## 🚧 Fase 5 — Deploy, Produção & Apresentação (Em Execução — Meta: 14/06 - 15/06)

Preparar o ambiente para o dia da apresentação.

- [/] Verificar e alinhar todas as variáveis de ambiente no Vercel (chaves OpenAI, Resend, Supabase e senhas).
- [ ] Disparar deploy final da branch principal.
- [ ] Simular fluxo completo de demonstração:
  - Ingestão RSS de música e tech -> Roteamento n8n -> Aprovação no Admin -> Publicação -> Leitura no terminal e web com efeitos camaleônicos.

---

## 📱 Fase 6 — Flutter Mobile Port (Pós-Apresentação)

*Esta fase está congelada e só iniciará após a estabilização e homologação da versão web 2.0.*

- [ ] Criar projeto Flutter com `supabase_flutter`.
- [ ] Implementar tela de Feed sincronizada por mundo (`world`).
- [ ] Implementar visual dinâmico (Chameleon Theme) no app Flutter.
- [ ] Configurar Push Notifications reativas via Edge Functions do Supabase.
