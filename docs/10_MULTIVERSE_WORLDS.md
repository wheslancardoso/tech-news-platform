# 🌌 Os 4 Mundos do Multiverso Fresh News

O ecossistema **Fresh News** baseia-se no conceito de **Multiverso de Notícias**, onde o leitor pode alternar entre canais autônomos. Cada canal possui sua própria curadoria, taxonomia de tópicos e uma identidade visual reativa exclusiva (Chameleon Theme).

Consolidamos o multiverso em exatamente **4 mundos principais**:

---

## 🚦 Tabela Comparativa dos Mundos

| Mundo | Matiz Base HSL | Cor de Destaque | Estética Visual | Efeitos Gráficos Ativos |
| :--- | :---: | :---: | :--- | :--- |
| **`TECH`** | `142º` | Verde Neon (`#22C55E`) | Digital, Preciso, Terminal Hacker | Grid Computacional, Glitch, Cursor Piscando |
| **`MUSIC`** | `0º` (Variável) | Vermelho Grunge (`#DC2626`) | Analógico, Fanzine, Estilo Xerox | Grão de Poeira Analógico, Desbotado, Scanlines |
| **`GEAR`** | `38º` | Laranja Industrial (`#F59E0B`) | Desenho Técnico, Hardware Hacker | Blueprint Grid, Bordas Negritadas Sólidas |
| **`GAME`** | `280º` | Roxo Synthwave (`#A855F7`) | Retro Arcade, 8-bit, Cyberpunk | Scanlines CRT, Glitch Ativo, Flicker |

---

## 👾 1. Mundo: `TECH` (Tecnologia & Segurança)

Focado em engenharia de software, cibersegurança, computação em nuvem e inteligência artificial.

* **Matiz HSL Principal:** `142º` (Verde)
* **Subcategorias & Personas de IA:**
  * **`IA`** (Inteligência Artificial & Machine Learning): Pinta a interface em verde-ciano ciberbético (`157º`) com o efeito `glow` ativo.
  * **`SEC`** (Cibersegurança & Hacking): Ativa o modo `theme-crt` (terminal de fósforo verde retrô com cintilação).
  * **`DEV`** (Programação, Web Dev, Mobile): Verde menta limpo e cantos retos.
  * **`CLOUD`** (Arquitetura, AWS, Serverless): Ativa o efeito `cloud_compute_grid` de fundo.
  * **`GERAL`** (Notícias gerais de tecnologia).

---

## 🎸 2. Mundo: `MUSIC` (Cultura Sonora & Verticais)

Focado nas tendências do Hip-Hop, Rock Alternativo, Indie e Música Eletrônica.

* **Matiz HSL Principal:** `0º` (Vermelho) — com rotações dinâmicas para as subcategorias.
* **Subcategorias & Personas de IA:**
  * **`HIP_HOP`** (Urbano, Batidas, Rap): Rotaciona a matiz para dourado/amarelo (`45º` / `#EAB308`). Ativa o efeito `street_glitch` de fundo.
  * **`ROCK_INDIE`** (Guitarras, Festivais, Indie): Usa vermelho grunge (`0º`). Ativa o efeito de textura de papel áspero desgastado (`paper_texture`).
  * **`ELECTRONICA`** (Produção, DJs, Synthwave): Rotaciona a matiz para roxo synthwave (`300º` / `#A855F7`). Ativa o efeito `scanlines` no scroll.
  * **`CULTURA_BR`** (Música e tendências brasileiras): Matiz verde-amarela.
  * **`GERAL`** (Notícias gerais do ecossistema de música).

---

## ⚙️ 3. Mundo: `GEAR` (Hardware Hacker, Design & EDC)

Focado em projetos DIY (faça você mesmo), gadgets, design de produtos físicos, automobilismo técnico e engenharia mecânica.

* **Matiz HSL Principal:** `38º` (Laranja/Amarelo Industrial)
* **Subcategorias & Personas de IA:**
  * **`RAW_HARDWARE`** (DIY, Arduino, Raspberry Pi, Solda): Destaques em laranja brilhante. Ativa o efeito `blueprint_grid` (grade de engenharia azulada/branca).
  * **`GEARHEAD`** (Automobilismo, F1, Motores): Destaques em vermelho de corrida clássico.
  * **`EDC`** (Everyday Carry, Canivetes, Relógios, Gadgets de Bolso): Tons de verde oliva e bronze.
  * **`GERAL`** (Notícias de design de produto e engenharia).

---

## 🎮 4. Mundo: `GAME` (Jogos & Cultura Retro)

Focado no desenvolvimento de jogos, análises, cultura indie e esports.

* **Matiz HSL Principal:** `280º` (Roxo/Rosa Arcade)
* **Subcategorias & Personas de IA:**
  * **`INDIE_GAME`** (Desenvolvimento de jogos indie, pixel art): Matiz em ciano/azul neon com efeitos de pixel ativos.
  * **`ESPORTS`** (Competições, torneios, meta-game): Matiz em rosa choque brilhante.
  * **`HARDWARE_CONSOLE`** (Novos consoles, placas de vídeo): Tons de roxo profundo e azul marinho.
  * **`GERAL`** (Notícias gerais sobre grandes lançamentos e mercado de jogos).

---

## 📡 Fluxo de Ingestão e Mapeamento de Dados

O n8n identifica a origem da notícia na tabela `sources` e determina o `world` automaticamente via função `determineWorld` no código. O fluxo garante o desacoplamento e a consistência visual:

```
[RSS Feed] ──► [n8n Switch Node] ──► [Grava no Banco (world: TECH/MUSIC/GEAR/GAME)] ──► [Frontend Renderiza Chameleon]
```
