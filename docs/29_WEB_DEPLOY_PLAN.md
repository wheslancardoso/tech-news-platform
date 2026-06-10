# 🚀 Plano de Homologação Web & Deploy de Produção

Este documento consolida as tarefas necessárias para validar localmente e colocar em produção a versão **Web v2.0 (Multiverso)** do portal Fresh News, abrangendo os 4 mundos (`TECH`, `MUSIC`, `GEAR` e `GAME`).

O objetivo deste planejamento é garantir que o operador (Lan) ou qualquer IA possa dar continuidade ao projeto de qualquer máquina através da sincronização do Git.

---

## 📋 Lista de Tarefas (Checklist de Execução)

### Fase 1: Configurações de Ambiente & Infraestrutura (Vercel & Supabase)
- [ ] **1.1** Comparar variáveis locais do `.env.local` com o painel do Vercel e garantir que as credenciais do Supabase remoto e chaves de API estejam corretas.
- [ ] **1.2** Confirmar que o schema remoto do Supabase tem todas as atualizações de tabela (colunas `world` em posts/newsletters, tabelas `sources` e tabela de cliques/afinidades).
- [ ] **1.3** Validar políticas RLS (Row Level Security) no Supabase de produção para garantir que as assinaturas públicas via Vercel funcionem sem erro.

### Fase 2: Cadastro de Fontes RSS de Teste (Ingestão)
- [ ] **2.1** Cadastrar fontes RSS reais para o canal **`GEAR`**:
  * Hackaday: `https://hackaday.com/blog/feed/` (category_hint: `RAW_HARDWARE`)
  * Everyday Carry: `https://everydaycarry.com/feed` (category_hint: `EDC`)
  * Motorsport: `https://www.motorsport.com/rss/f1/news/` (category_hint: `GEARHEAD`)
- [ ] **2.2** Cadastrar fontes RSS reais para o canal **`GAME`**:
  * Kotaku: `https://kotaku.com/rss` (category_hint: `GAME`)
  * Eurogamer: `https://www.eurogamer.net/feed/news` (category_hint: `GAME`)
- [ ] **2.3** Executar o script de ingestão e validar se os posts foram baixados e marcados com o `world` correspondente no banco.

### Fase 3: Validação Estética & Funcional (Frontend Web Local)
- [ ] **3.1** Validar o seletor de mundos no cabeçalho: certificar que os 4 botões (`TECH`, `MUSIC`, `GEAR`, `GAME`) filtram corretamente a listagem.
- [ ] **3.2** Testar o comportamento do Chameleon Theme no scroll da Home e na tela de leitura de artigos de cada canal:
  * Verde Neon no mundo `TECH` (Glow/CRT para Segurança).
  * Vermelho/Dourado/Roxo no mundo `MUSIC` (Papel Xerox para Rock, Glitch para Hip-hop).
  * Laranja Industrial no mundo `GEAR` (Grade de Blueprint de Engenharia).
  * Roxo Synthwave/Rosa no mundo `GAME` (Scanlines CRT de TV e Flicker retro).

### Fase 4: Deploy & Testes em Produção
- [ ] **4.1** Disparar o deploy final no Vercel e verificar se a compilação Next.js 15 conclui sem avisos de linter ou erros de TypeScript.
- [ ] **4.2** Testar o fluxo completo em produção: Ingestão de novas notícias → Curadoria no painel Admin → Publicação de Edição do Multiverso.
- [ ] **4.3** Configurar a cron-job do n8n de produção apontando para a API de produção da newsletter.

---

## 🎨 Especificações Estéticas Web dos Novos Mundos

### Mundo `GEAR` (Laranja)
* **CSS Variable overrides:**
  * `--theme-primary`: `hsl(38, 95%, 50%)` (Laranja Industrial)
  * `--theme-accent`: `hsl(38, 90%, 45%)`
* **Filtros visuais:** Efeito `blueprint_grid` ativado no fundo das seções de leitura.

### Mundo `GAME` (Roxo/Rosa)
* **CSS Variable overrides:**
  * `--theme-primary`: `hsl(280, 85%, 55%)` (Roxo Synthwave)
  * `--theme-accent`: `hsl(320, 90%, 50%)` (Rosa Choque)
* **Filtros visuais:** Efeitos `scanlines` CRT + `glitch` sutil em botões.
