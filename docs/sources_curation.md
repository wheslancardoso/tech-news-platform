# Guia de Curadoria & Fontes RSS: Multiverso Fresh News

Este documento serve como mapa de curadoria técnica e cultural para o Fresh News. Ele detalha as subcategorias do portal e fornece **fontes RSS de altíssima densidade intelectual** recomendadas para monitorar e configurar nas automações de ingestão do pipeline no **n8n**.

---

## 💻 Mundo: `TECH` (Tecnologia & Engenharia)

Foco em computação científica, arquitetura de sistemas distribuídos, segurança cibernética agressiva e código puro de baixo nível.

### 1. `IA` // INTELIGÊNCIA ARTIFICIAL (Partículas Neurais / Violeta)
Foco em redes neurais profundas, LLMs locais de código aberto, matemática de otimização e inferência.
- **Hugging Face Research Blog**: `https://huggingface.co/blog/feed.xml`
  - *Por que usar:* Fonte primária de lançamentos de modelos open-source e artigos técnicos densos.
- **Berkeley AI Research (BAIR)**: `https://bair.berkeley.edu/blog/feed.xml`
  - *Por que usar:* Blog acadêmico e técnico da universidade de Berkeley sobre robótica e deep learning.
- **OpenAI Research & News**: `https://openai.com/news/rss.xml`
  - *Por que usar:* Acompanhar a fronteira comercial de algoritmos geradores.

### 2. `SEGURANÇA` // CYBERSECURITY (Glitch Vermelho / Scanlines)
Foco em análise de vulnerabilidades, engenharia reversa de malwares, criptografia e técnicas defensivas/ofensivas.
- **The Daily Swig (PortSwigger)**: `https://portswigger.net/daily-swig/rss`
  - *Por que usar:* Referência de notícias sobre falhas de segurança da web profunda.
- **Hacker News (Filtrado para Cybersecurity)**: `https://news.ycombinator.com/rss`
  - *Por que usar:* Filtrar posts com palavras-chave `exploit`, `vulnerability`, `cve`, `zero-day`.
- **Krebs on Security**: `https://krebsonsecurity.com/feed/`
  - *Por que usar:* Jornalismo investigativo de alta fidelidade sobre cibercrimes e vazamentos.

### 3. `DEV` // SOURCE CODE (Fósforo Verde / Terminal)
Foco em compiladores, linguagens robustas (Rust, Go, C++, Zig), engenharia de software pragmática e padrões de arquitetura.
- **Rust Programming Blog**: `https://blog.rust-lang.org/feed.xml`
  - *Por que usar:* Lançamentos oficiais, detalhes de compiladores e atualizações de sintaxe.
- **GitHub Engineering Blog**: `https://github.blog/category/engineering/feed/`
  - *Por que usar:* Desafios reais de engenharia de software em escalas massivas.
- **Martin Fowler**: `https://martinfowler.com/feed.xml`
  - *Por que usar:* Discussões clássicas e de vanguarda sobre design e arquitetura de software limpo.

### 4. `CLOUD` // INFRAESTRUTURA & SRE (Ciano Digital / Grid)
Foco em Kubernetes, arquitetura serverless, redes complexas, infraestrutura como código (IaC) e resiliência de sistemas.
- **Kubernetes Official Blog**: `https://kubernetes.io/feed.xml`
  - *Por que usar:* Frequência técnica oficial da principal ferramenta de orquestração de nuvem.
- **AWS Architecture Blog**: `https://aws.amazon.com/blogs/architecture/feed/`
  - *Por que usar:* Casos de estudo de design e topologias de nuvem corporativa de alta densidade.

---

## 🎵 Mundo: `MUSIC` (Cultura Urbana & Sons)

Foco na contracultura, design sonoro, análises densas de álbuns clássicos e técnicas de produção musical visceral.

### 1. `HIP_HOP` // STREET ART & BEATS (Yellow Asfalto / Tape Noise)
Foco em música urbana, batidas lo-fi de fita cassete, sintetizadores clássicos (MPC, SP-1200) e líricas profundas.
- **Pitchfork Hip Hop Filter**: `https://pitchfork.com/feed/feed-reviews-albums/rss`
  - *Dica:* Filtrar no n8n pelo gênero `Rap/Hip-Hop` para resenhas críticas profundas de álbuns.
- **Complex Music**: `https://www.complex.com/feeds/rss/music`
  - *Por que usar:* Lançamentos e cultura de rua instantânea.
- **HipHopDX**: `https://hiphopdx.com/rss/news.xml`
  - *Por que usar:* Cobertura constante da vanguarda urbana americana e global.

### 2. `ROCK_GRUNGE` // ALT & UNDERGROUND (Xerox Grunge / Vermelho)
Foco no rock alternativo de garagem, distorção valvulada analógica, grunge clássico de Seattle e heavy metal experimental.
- **Stereogum**: `https://www.stereogum.com/feed/`
  - *Por que usar:* Excelente cobertura de música indie, pós-punk e rock alternativo underground.
- **Louder Sound (Classic & Alt Rock)**: `https://www.loudersound.com/feeds/all`
  - *Por que usar:* Matérias históricas densas de bandas clássicas de rock analógico.
- **Consequence of Sound**: `https://consequence.net/feed/`
  - *Por que usar:* Resenhas e notícias diárias do mundo alternativo.

### 3. `ELECTRONICA_SYNTH` // TECHNO & CLUB (Roxo Neon / Synth Lines)
Foco no techno industrial de Berlim, sintetizadores modulares analógicos, demoscene retro, house progressivo e sintetizadores de mesa.
- **Resident Advisor (RA News)**: `https://ra.co/xml/news.xml`
  - *Por que usar:* A Bíblia do techno e house alternativo mundial. Foco em festivais e subcultura noturna.
- **MusicRadar Synth & Tech**: `https://www.musicradar.com/feeds/all`
  - *Dica:* Filtrar no n8n por tópicos de `synth`, `modular` ou `production` para análises de hardware sonoro.
- **Attack Magazine**: `https://www.attackmagazine.com/feed/`
  - *Por que usar:* Blog altamente técnico de produção de música eletrônica e design sonoro.

---

## 🏎️ Mundo: `GEAR` (Cultura Motorizada & Silício)

Foco em engenharia extrema, aerodinâmica de carros de corrida, microarquitetura de processadores e eletrônica artesanal (do-it-yourself).

### 1. `F1_MOTORSPORT` // RACING & AERODYNAMICS (Vermelho F1 / Carbono)
Foco em telemetria avançada, dinâmica de fluidos computacional (CFD), motorização híbrida de vanguarda e táticas de corrida.
- **F1 Technical**: `https://www.f1technical.net/rss/news.xml`
  - *Por que usar:* Absolutamente ideal para a alma técnica. Discute aerodinâmica de spoilers, suspensões e telemetria de carros reais de F1.
- **Autosport F1 News**: `https://www.autosport.com/rss/f1/`
  - *Por que usar:* Cobertura global instantânea e análises táticas da pista.
- **Motorsport.com (F1)**: `https://www.motorsport.com/rss/f1/news/`
  - *Por que usar:* Artigos e opiniões de correspondentes especializados nos bastidores da velocidade.

### 2. `RAW_HARDWARE` // BENCHMARKS & SILICON (Cinza Metal / Amarelo Alerta)
Foco em arquitetura x86/ARM/RISC-V, litografia de chips, benchmarks extremos de placas de silício, modificação física (modding) e projetos eletrônicos caseiros.
- **AnandTech**: `https://www.anandtech.com/rss`
  - *Por que usar:* O mais profundo portal de benchmarks e diagramas lógicos de processadores e placas mãe do mercado.
- **Hackaday**: `https://hackaday.com/feed/`
  - *Por que usar:* Projetos DIY brutais. Hackers que modificam fisicamente eletrônicos antigos, criam robôs de garagem e chips artesanais.
- **Phoronix**: `https://www.phoronix.com/phoronix-rss.php`
  - *Por que usar:* Cobertura diária focada em drivers de hardware de baixo nível do Linux e benchmarks gráficos (Phoronix Test Suite).
