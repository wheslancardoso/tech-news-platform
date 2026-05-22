# ADR-002: Arquitetura de Mundos Multiverso (Fresh News)

**Status:** Aceito (Alinhado em 22 de maio de 2026)

---

## Contexto

Para superar portais estáticos e lineares de tecnologia (como o Tech Drop), o Fresh News evoluirá de um portal focado puramente em engenharia de software para uma plataforma de **Zine Omnichannel Multiverso**. O ecossistema abordará diferentes esferas da cultura técnica e urbana de forma completamente separada e isolada, garantindo que leitores consumam apenas o que lhes interessa, com imersão visual estrita.

## Decisão

Implementaremos a **Arquitetura de Mundos Multiverso** estruturada nos seguintes pilares:

### 1. Modelagem de Dados Relacional
- Adição da coluna `world` (`text` com default `'TECH'`) nas tabelas `posts` e `newsletters`.
- Mundos iniciais homologados:
  - `TECH`: Engenharia de Software, Cybersecurity e Cloud Computing.
  - `MUSIC`: Vanguarda Musical e Cultura Urbana (Hip Hop, Rock/Grunge, Techno/Synth e Indie/MPB).
  - `GEAR`: Cultura Motorizada, Performance, Hardware e Formula 1.
- Adição do suporte a canais ativos no cadastro de assinantes (`subscribers.active_worlds` array de `text` com default `{'TECH'}`).

### 2. Transmutação Estética Brutalista (Chameleon Engine)
O front-end Next.js adaptará 100% o estilo e efeitos visuais da tela de acordo com o mundo e a categoria sob foco visual:
- **HIP_HOP**: Amarelo Ocre / Asfalto, tipografia pesada sans-serif, efeitos de ruído de cassete e street art.
- **ROCK_GRUNGE**: Xerox Preto e Branco estragado com detalhes em vermelho sangue, tipografia serifada áspera e grão denso.
- **ELECTRONICA_SYNTH**: Roxo neon e verde fósforo, tipografia monoespaçada, brilho de fósforo CRT e scanlines.
- **INDIE_MPB**: Minimalista monocromático conceitual, tipografia serifada fina de vanguarda e texturas sutis.

### 3. Sincronização Omnichannel por Agente IA (Hermes Agent)
- O assinante poderá gerenciar de forma granular em quais frequências de transmissão (mundos) deseja se conectar.
- O **Hermes Agent** atuará de forma adaptativa no WhatsApp/E-mail. A IA assumirá um tom de voz característico ajustado a cada subcultura (ex: jargão técnico hacker para `TECH`, tom visceral e analítico de crítica para `MUSIC`), enviando boletins e respondendo a consultas específicas em isolamento.

## Consequências & Trade-offs

### Prós:
- **Exclusividade Editorial**: Cria uma barreira de diferenciação insuperável em relação ao Tech Drop. O portal se torna uma revista de cultura urbana e técnica imersiva.
- **Retenção de Audiência**: Leitores que não gostam de tecnologia podem consumir música sem ruído, e vice-versa.
- **Sinergia Visual**: O Chameleon Engine demonstra todo o seu poder através de transmutações drásticas de gêneros artísticos inteiros.

### Contras:
- **Complexidade de Curadoria**: O fluxo do n8n e a IA precisarão ser configurados para processar e classificar fontes de diferentes nichos em mundos apartados.
- **Segregação de Sessão**: Exige controle de cookies e query strings robusto na navegação do portal para manter a persistência do mundo ativo do usuário.
