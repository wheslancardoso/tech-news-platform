# **Alinhamento Arquitetural e de Produto: Fresh News vs. Tech Drop**

Este documento oficializa as decisões estratégicas e de engenharia de software tomadas em parceria com o time de desenvolvimento durante a sessão de alinhamento `/grill-me`. O objetivo primordial é estruturar um produto revolucionário de publicação digital que supera plataformas tradicionais de notícias (como o Tech Drop), transformando o consumo passivo de notícias em uma experiência de imersão visual e interatividade agêntica de ponta.

---

## **1. Diferenciais Competitivos e de Inovação**

Para superar a concorrência tradicional de newsletters estáticas por e-mail, o **Fresh News** consolidará sua atuação em três frentes complementares de tecnologia e produto:

| Frente de Inovação | Descrição da Abordagem no Fresh News | Impacto em Relação ao Tech Drop |
| :--- | :--- | :--- |
| **Oráculo de Bolso (WhatsApp)** | Canal bilateral interativo usando o **Hermes Agent** via ponte robusta Baileys (sem Chromium/Puppeteer). | O leitor premium deixa de ser um mero leitor passivo de e-mail e passa a conversar diretamente com a inteligência editorial. |
| **Brutalismo Camaleônico (MTV)** | Portal Next.js dinâmico que se deforma visualmente (fontes, cores, efeitos SVG de baixíssima sobrecarga) de acordo com o post. | Ruptura com designs de blogs rígidos e cinzas. Cada artigo se comporta como um mini-game visual ou zine brutalista customizada. |
| **Zine Pessoal (Supabase / ML)** | O assinante define seus interesses e o sistema orquestra recomendações fluidas baseadas em score matemático e intersecção relacional. | O usuário recebe e consome com prioridade exatamente o que lhe interessa, sem ficar preso em um filtro-bolha estrito e opaco. |

---

## **2. Detalhamento Técnico das Decisões**

### **A. Mecânica de Personalização (Híbrida & Fluida)**
*   **Decisão:** O leitor seleciona ativamente seus interesses no perfil do portal (`subscribers.interests` array no Supabase).
*   **Funcionamento do Portal:** A página principal (`Home`) e os feeds do Next.js são reordenados dinamicamente. Os posts que batem com as preferências do leitor ganham prioridade com base na pontuação de relevância (`score`) gerada por algoritmos de banco e data de publicação.
*   **Funcionamento da Newsletter:** A curadoria enviada de forma ativa (WhatsApp/E-mail) é resumida priorizando estes tópicos, mas sempre incluindo links de convite para a visualização unificada da edição completa no portal para fomentar a descoberta e a quebra de filtros-bolha estritos.

### **B. O Escopo do Hermes Agent no WhatsApp (O Assessor Técnico Brutalista)**
*   **Decisão:** O Hermes Agent atuará como um consultor sênior de altíssima densidade intelectual e tom de voz visceral.
*   **Recursos Disponíveis ao Leitor:** O leitor VIP poderá consultar o bot via WhatsApp sobre vulnerabilidades (CVEs), pedir tradução e síntese de documentações complexas de engenharia de software ou solicitar resumos refinados dos tópicos mais quentes do dia.
*   **Mecânica de Execução:** O Hermes utiliza sua infraestrutura de servidor compatível com OpenAI (porta `8642`), realiza buscas autônomas na web através de suas *skills* integradas e formata os relatórios estruturados com emojis nativos e formatação brutalista diretamente no chat do WhatsApp.

### **C. Intensidade do Design System MTV (Mutação Imersiva e Dinâmica)**
*   **Decisão:** A tela de leitura assume 100% da identidade semântica do post em exibição.
*   **Funcionamento:** O portal Next.js utiliza o **Chameleon Engine** (React Hook customizado) para ler os metadados JSONB da coluna `theme_config` de cada post. O hook injeta dinamicamente cores HSL de destaque, tipografias brutas e classes de estilo utilitárias em variáveis CSS `:root`.
*   **Mapeamento de DNA e Mutação:**
    *   `TECH_HACKER` / `SEGURANÇA`: Fundo preto absoluto, fontes monoespaçadas, cor de destaque em vermelho brilhante (`#FF0000`), scanlines e efeito de glitch nas bordas.
    *   `SYNTH_AESTHETICS` / `ARTE_DIGITAL`: Fontes clássicas serifadas, cor de destaque em roxo sintético (`#800080`), texturas de ruído analógico (grains) e efeitos de aberração cromática SVG de baixíssima sobrecarga de GPU.
    *   `GEARHEAD` / `F1_COMPETICAO`: Tipografia pesada sem serifa, fundo cinza asfalto texturizado, cor de destaque em vermelho de corrida (`#CC0000`) e simulação de fibra de carbono.

### **D. Ingestão e Seleção de Notícias no n8n (Curadoria Híbrida Inteligente)**
*   **Decisão:** O pipeline de ingestão do n8n opera de maneira multimodal e descentralizada.
*   **Fontes de Dados:**
    1.  **Monitoramento RSS Automatizado:** Blogs altamente técnicos e focados (Hacker News, GitHub Changelog, bases de CVEs).
    2.  **Monitoramento Social (Firecrawl API):** Raspagem inteligente de discussões quentes sobre tecnologias emergentes nas redes mais povoadas por desenvolvedores.
    3.  **Inboxes de Editores:** Um canal especial no console ou WhatsApp para que os administradores humanos possam enviar links interessantes em tempo real, disparando o processamento imediato da IA.
*   **Deduplicação Proativa:** A inserção tenta gravar a URL no Supabase, sendo bloqueada na camada do PostgreSQL caso o post já exista (UNIQUE constraint), economizando tokens de processamento agênticos.

---

## **3. Próximos Passos de Implementação**

1.  **Fase 1: Chameleon Engine no Front-end (Next.js):**
    *   Criar o React Hook `useTheme(themeConfig)` para mapear as chaves HSL do JSONB do Supabase em variáveis CSS no `:root`.
    *   Ajustar as cores de borda, fundo, títulos e efeitos dos componentes das páginas públicas para responderem a essas variáveis em vez de classes estáticas.
2.  **Fase 2: Estruturação dos Prompts de Sub-Persona do Hermes (n8n):**
    *   Configurar as lógicas de roteamento no n8n para injeção das sub-personas ("O Sentinela", "O Neuralista", "O Artesão").
    *   Ajustar os prompts de sistema do Hermes para popular consistentemente as chaves de tokens, tipografias e classes de efeitos no campo `theme_config` JSONB.
3.  **Fase 3: Ponte de Comunicação do WhatsApp (Baileys):**
    *   Iniciar e parear a ponte agêntica via contêiner Hostinger VPS Docker.
    *   Configurar a validação de inscritos e testes preliminares de chat bilateral Pull.
