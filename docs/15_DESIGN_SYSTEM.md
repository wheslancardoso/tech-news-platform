# Design System: Digital Brutalism & Chameleon Multiverse (v2.0)

Este documento define os padrões visuais e as diretrizes estéticas do projeto **Fresh News**. A plataforma adota uma abordagem de **Digital Brutalism ("The Neo-Broadsheet")** combinada com o motor de design dinâmico **Chameleon Engine**, adaptando cores e efeitos estéticos conforme o universo (Tech ou Música) e a categoria de conteúdo ativa.

---

## 1. Conceito Visual (Digital Brutalism)

*   **The Neo-Broadsheet:** Inspirado na diagramação rígida, tipografia pesada e grades de jornais impressos físicos tradicionais.
*   **Geometria de Borda Rígida:** Raio de borda estritamente em **0px** (`border-radius: 0`) para todos os botões, inputs, cards e contêineres.
*   **Grades e Bordas Marcantes:** Uso de bordas sólidas grossas (mínimo de `2px solid`) dividindo colunas, seções e cards, evocando a estética de linotipo.
*   **Tipografia de Extrema Força:**
    *   *Cabeçalhos (Headlines):* `Space Grotesk` (Peso 900/Black) em itálico e com tracking reduzido (`tracking-tighter`).
    *   *Corpo do Texto:* `Inter` para leitura fluida e confortável.
    *   *Labels e Metadados:* Fonte monoespaçada, caixa alta, peso black e tracking amplo (`tracking-[0.2em]`). Ex: `// PROTOCOLO_ZINE`.

---

## 2. Paletas de Cores do Multiverso (Chameleon Engine)

O visual reativo do portal altera a cor primária (variável CSS `--primary`) e aplica filtros visuais com base na notícia ou no mundo selecionado pelo usuário.

### 💻 Mundo 1: TECH (Universo de Tecnologia)
O universo tech adota cores cibernéticas vibrantes sobre fundo escuro absoluto:

| Categoria/Filtro | Cor Primária (Hex) | Variável CSS | Efeitos Visuais / Específico |
| :--- | :--- | :--- | :--- |
| **Padrão/Geral** | `#8B5CF6` (Violeta) | `--primary: 263 90% 66%` | Efeito scanlines e cintilação CRT discreta. |
| **Inteligência Artificial (IA)** | `#00F0FF` (Cyan) | `--primary: 185 100% 50%` | Brilho digital reativo (`glow`). |
| **Desenvolvimento (DEV)** | `#00FF66` (Emerald) | `--primary: 142 100% 50%` | Monocromático clássico de terminal. |
| **Cibersegurança (SEC)** | `#FF3B30` (Warning Red) | `--primary: 0 100% 60%` | Estilo console de aviso hacker / logs. |
| **Cloud & SRE** | `#3B82F6` (Ciano Azulado)| `--primary: 217 91% 60%` | Layout limpo de console de controle. |

### 🎧 Mundo 2: MUSIC (Universo de Música) [NOVO]
O universo de música utiliza tons mais orgânicos e sujos, inspirados na estética de mídias físicas analógicas e zines impressos em fotocópia:

| Categoria UI | Cor Primária (Hex) | Variável CSS | Estética Camaleão & Efeitos |
| :--- | :--- | :--- | :--- |
| **🎤 Hip-Hop & Urbano** | `#EAB308` (Gold) | `--primary: 45 93% 47%` | *Street/MPC:* Granulação áspera de vinil e glitches cromáticos. |
| **🎸 Rock & Indie** | `#DC2626` (Xerox Red) | `--primary: 0 72% 51%` | *Zine/Xerox:* Textura de fotocópia de baixo contraste e bordas rasgadas. |
| **🎹 Eletrônica & Synth** | `#A855F7` (Neon Purple) | `--primary: 270 76% 60%` | *Neon/Grid:* Brilhos neon reativos e grade linear de fundo synthwave. |
| **🌎 Cultura Geral** | `#F97316` (Laranja) | `--primary: 24 95% 53%` | *Magazine:* Minimalista, tipografia massiva inspirada em capas de revistas de música física (ex: Rolling Stone). |

---

## 3. Elementos Brutalistas Estáveis

*   **Scanlines:** Filtro de linhas de varredura CRT (`bg-scanlines`) aplicado em overlays com 2% de opacidade sobre o fundo preto (`#000000`) para dar a sensação de um monitor técnico.
*   **Flicker Animação:** Micro-animação aplicada nos cabeçalhos em itálico que simula a cintilação de telas de fósforo verde/âmbar antigas.
*   **Double Borders:** Uso de bordas duplas (`border-double`) grossas de `4px` para separar o cabeçalho do conteúdo principal no painel de administração e na página de preferências.
