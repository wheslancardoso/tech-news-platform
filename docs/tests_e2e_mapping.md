# 🎭 Mapeamento de Testes E2E com Playwright: Fresh News

Este documento define a estratégia, a arquitetura e o checklist detalhado para a implementação da suíte de testes ponta a ponta (**End-to-End - E2E**) utilizando o **Playwright** no portal Fresh News (The Neo-Broadsheet). 

O objetivo é garantir a integridade absoluta das mecânicas de produto inovadoras (Multiverso, Debate CRT, Zine Pessoal e Hacker Mode CLI) antes de qualquer deploy em produção.

---

## 🏗️ 1. Arquitetura da Suíte E2E

Para garantir robustez, manutenibilidade e isolamento de seletores, a suíte seguirá estritamente o padrão **Page Object Model (POM)** e as diretrizes de seletores semânticos.

### Estrutura de Diretórios Recomendada
```
tests/
  e2e/
    fixtures/         → Dados estruturados, payloads de mock e estados de sessão
    pages/            → Classes Page Object (POM) isolando seletores e ações
      home.ts
      archive.ts
      preferences.ts
      debate.ts
    specs/            → Suítes de testes funcionais organizadas por feature
      multiverse.spec.ts
      affinity.spec.ts
      debate.spec.ts
      hacker-cli.spec.ts
      chameleon.spec.ts
  playwright.config.ts  → Configuração global (Browsers, WebServer local, StorageState)
```

### Ordem de Preferência para Seletores
1. **Semânticos nativos**: `page.getByRole('button', { name: 'Confirmar' })` ou `page.getByRole('heading', { level: 1 })`
2. **Identificadores de campos**: `page.getByLabel('E-mail')` ou `page.getByPlaceholder('Digite seu e-mail')`
3. **Texto visível**: `page.getByText('Mundo Selecionado: TECH')`
4. **Atributo dedicado**: `page.getByTestId('world-btn-tech')` (utilizado apenas quando os seletores semânticos forem ambíguos)
5. *Evitar a todo custo*: `page.locator('.classe-css-fragil')` (suscetível a quebras durante refatorações de estilo).

---

## 🎯 2. Mapeamento de Cenários por Fluxo do Sistema

### 🌐 Fluxo A: Multiverso e Seleção de Canais
Garante que a transição de sintonia entre os mundos (**TECH**, **MUSIC**, **GEAR**) altera layouts, persiste estados e filtra feeds perfeitamente sem FOUC (Flash of Unstyled Content).

- **Page Object (`home.ts`)**:
  - Métodos: `goto()`, `selectWorld(worldName)`, `getActiveWorldLED()`, `getHeroText()`.
- **Cenários de Teste (`specs/multiverse.spec.ts`)**:
  - **Cenário A.1**: Acessar a Home como usuário anônimo. O mundo padrão deve ser `'TECH'`, o LED correspondente na navbar deve estar piscando (classe `animate-pulse`) e as newsletters listadas devem pertencer ao mundo `'TECH'`.
  - **Cenário A.2**: Clicar no botão do mundo `'MUSIC'`. O botão correspondente deve sofrer a translação visual brutalista (`translate-x-[2px] translate-y-[2px] shadow-none`), o cookie `active_world` deve ser criado no navegador com valor `'MUSIC'` e o Hero deve transmutar instantaneamente para *"Sintonize nas Batidas da Contracultura."*.
  - **Cenário A.3**: Clicar no botão do mundo `'GEAR'`. O layout deve filtrar imediatamente o feed de newsletters para exibir apenas aquelas marcadas com `world = 'GEAR'` e o subtítulo deve mudar para *"Engenharia Extrema & Silício no Asfalto."*.
  - **Cenário A.4**: Recarregar a página (`page.reload()`) após sintonizar em `'GEAR'`. O servidor (SSR) deve ler o cookie ativo e renderizar o HTML inicial diretamente no canal `'GEAR'`, sem flashes estéticos ou oscilações de layout.

---

### 🔍 Fluxo B: Zine Pessoal e Feed de Afinidades
Verifica a configuração e o processamento de preferências do leitor, bem como a reordenação relacional do feed de posts por score e categorias de interesse.

- **Page Object (`preferences.ts`, `archive.ts`)**:
  - Métodos: `gotoPreferences(subscriberId)`, `togglePreference(category)`, `savePreferences()`, `getFeedPostsOrder()`, `getCRTAlertState()`.
- **Cenários de Teste (`specs/affinity.spec.ts`)**:
  - **Cenário B.1**: Acessar o Arquivo (`/archive`) anonimamente. O sistema deve exibir um banner brutalista retro-CRT informando o caráter anônimo da sessão e convidando a assinar ou gerenciar interesses.
  - **Cenário B.2**: Acessar a rota de preferências `/preferencias/test-subscriber-id`. A interface deve renderizar os checkboxes brutalistas de tópicos (ex: *IA*, *SEGURANÇA*, *DEV*, *CLOUD*).
  - **Cenário B.3**: Selecionar os tópicos *IA* e *SEGURANÇA* e salvar. O sistema deve enviar os dados para o Supabase, atualizar o array `preferences` do subscriber e redirecionar para `/archive`.
  - **Cenário B.4**: Validar o Feed de Afinidades reordenado no Arquivo. Os posts que correspondem a *IA* ou *SEGURANÇA* devem ser empurrados para o topo do feed de posts (ordenados internamente por `score` descrescente), enquanto posts não-relacionados (ex: *CLOUD*) devem aparecer abaixo.

---

### 🎙️ Fluxo C: Interactive AI Debate Mode (Terminal CRT)
Valida o comportamento e a interatividade da simulação de debates técnicos de inteligência artificial em edições compiladas.

- **Page Object (`debate.ts`)**:
  - Métodos: `gotoEdition(editionId)`, `clickPlayDebate()`, `clickPauseDebate()`, `changeDebateSpeed(speed)`, `getConsoleLogs()`, `verifyTerminalStyles()`.
- **Cenários de Teste (`specs/debate.spec.ts`)**:
  - **Cenário C.1**: Acessar a leitura de uma edição de newsletter `/archive/[id]`. Localizar o contêiner `TerminalDebate` abaixo da seção de Quick Takes.
  - **Cenário C.2**: Verificar a estrutura visual CRT (presença de linhas de varredura SVG, fundo escuro retro, cursor piscando).
  - **Cenário C.3**: Clicar em `PLAY`. O terminal deve disparar a digitação typewriter em tempo real dos diálogos estruturados gerados pelas personas (Neuralista-Chefe, Red Team, Arquiteto Sênior e SRE).
  - **Cenário C.4**: Testar os botões de execução e velocidade. Clicar em `PAUSA` deve interromper a digitação imediatamente; mudar a velocidade para `5x` deve acelerar drasticamente o preenchimento dos logs sem falhas de renderização. Clicar em `REINICIAR` deve limpar o console e reiniciar o fluxo a partir do primeiro log de debate.

---

### 💻 Fluxo D: Hacker Mode CLI & Visual CRT
Certifica a resposta do endpoint CLI de alto nível para requisições via terminal real e o comportamento visual da transmutação retro.

- **Page Object (`home.ts`, `archive.ts`)**:
  - Métodos: `triggerCRTStyleToggle()`, `getCRTOverlayPresence()`.
- **Cenários de Teste (`specs/hacker-cli.spec.ts`)**:
  - **Cenário D.1**: Efetuar uma chamada programática para `/api/cli` injetando o cabeçalho `User-Agent: curl/7.68.0`. O teste deve assegurar que a resposta HTTP:
    - Retorna status `200`.
    - O Content-Type é puros caracteres de texto formatado (`text/plain`).
    - Contém o contorno sólido brutalista ASCII-art correspondente à capa da edição atual e cores de categoria ANSI.
  - **Cenário D.2**: Na interface web do portal (/archive), clicar no botão brutalista *"Hacker Mode"*. O DOM deve receber uma classe global (ex: `crt-mode`) aplicando filtros de oscilação de fósforo verde, scanlines estéticas e texturas retro-CRT de baixa sobrecarga de processamento.

---

### 🎨 Fluxo E: Chameleon Engine & Mutação Visual
Garante que o portal transmuta suas variáveis estéticas dinamicamente com base nos metadados de configuração do post aberto.

- **Cenários de Teste (`specs/chameleon.spec.ts`)**:
  - **Cenário E.1**: Abrir um artigo curado marcado com a categoria `TECH_HACKER` / `SEGURANÇA`. O Playwright deve atestar que a raiz `:root` do DOM teve as variáveis CSS de cor de destaque alteradas para vermelho brillante (`#FF0000`) e a fonte transmutada para monospace.
  - **Cenário E.2**: Abrir um post classificado sob a estética `SYNTH_AESTHETICS` / `ARTE_DIGITAL`. O teste deve ler as variáveis de `:root` e verificar se a cor de destaque foi transmutada para roxo sintético (`#800080`) e a tipografia principal para serifada.

---

## 🛠️ 3. Estratégias de Dados e Mocking para Isolamento

Para garantir testes E2E rápidos, determinísticos e independentes de dados flutuantes em produção, adotaremos duas estratégias complementares:

### 1. Interceptação de Chamadas de Rede (Network Mocks)
Usaremos a API `page.route` do Playwright para interceptar requisições direcionadas às rotas internas do Supabase REST API (PostgREST) e retornar payloads estáticos (fixtures JSON) pré-definidos.
* **Vantagem**: Os testes rodam de forma instantânea sem realizar conexões de rede reais e sem a necessidade de popular o banco físico a cada execução.
* **Exemplo de Configuração**:
  ```typescript
  await page.route('**/rest/v1/posts*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPostsFixture)
    });
  });
  ```

### 2. Transações Isoladas no Banco de Dados Real (Integration Specs)
Para fluxos que realizam gravações críticas no Supabase (como `/preferencias/[id]` alterando preferências), teremos uma suite dedicada de integração rodando contra o banco remoto de testes, utilizando um ID de assinante de testes exclusivo (`test-runner-subscriber`), efetuando uma limpeza pós-teste (`afterEach`) para redefinir o registro original ao seu estado padrão.

---

## 📋 4. Checklist Completo de Implementação de Testes E2E

### Fase 1: Setup e Configuração (Pendente de Aprovação)
- [ ] Instalar o pacote de desenvolvimento `@playwright/test`.
- [ ] Criar o arquivo de parametrização `playwright.config.ts` (timeouts, viewports, caminhos de testes, inicialização de servidor Next.js local).
- [ ] Adicionar scripts de execução no `package.json` (`test:e2e`, `test:e2e:ui`).

### Fase 2: Construção dos Page Object Models (POMs)
- [ ] Criar `tests/e2e/pages/home.ts` (mecanismos de mundos).
- [ ] Criar `tests/e2e/pages/archive.ts` (feed de afinidades).
- [ ] Criar `tests/e2e/pages/preferences.ts` (checkboxes e submit CRT).
- [ ] Criar `tests/e2e/pages/debate.ts` (terminal de debates e controles).

### Fase 3: Escrita dos Casos de Teste (Specs)
- [ ] Implementar `tests/e2e/specs/multiverse.spec.ts` (Cenários A.1 a A.4).
- [ ] Implementar `tests/e2e/specs/affinity.spec.ts` (Cenários B.1 a B.4).
- [ ] Implementar `tests/e2e/specs/debate.spec.ts` (Cenários C.1 a C.4).
- [ ] Implementar `tests/e2e/specs/hacker-cli.spec.ts` (Cenários D.1 e D.2).
- [ ] Implementar `tests/e2e/specs/chameleon.spec.ts` (Cenários E.1 e E.2).

### Fase 4: CI/CD e Validação
- [ ] Configurar execução headless e relatórios HTML.
- [ ] Garantir que toda a suite roda de forma bem-sucedida de ponta a ponta sem falsos-positivos.
