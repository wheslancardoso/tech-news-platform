# 📐 Sistema de Design: Tech News Platform

Este documento define a linguagem visual, comportamentos e tokens de estilo para o painel administrativo e interface de usuário da plataforma Tech News. O objetivo é garantir uma experiência **Premium**, **Moderna** e **Funcional**.

## 🎨 Paleta de Cores (Tokens CSS)

As cores devem ser implementadas como variáveis HSL no `:root` do `globals.css`.

### Cores Base
- **Background**: `hsl(210 20% 98%)` (Gelo Suave) - Evitar branco puro para reduzir fadiga visual.
- **Foreground**: `hsl(224 71% 4%)` (Azul Profundo quase Preto) para textos principais.
- **Surface**: `hsl(0 0% 100%)` (Branco Puro) para Cards e modais.

### Identidade Tech (News Blue)
- **Primary**: `hsl(221 83% 53%)` (Azul Vibrante) - Usado para botões de ação principal, links ativos e status importantes.
- **Primary Foreground**: `hsl(210 40% 98%)` (Texto claro sobre azul).

### Estados de Sistema
- **Success**: `hsl(142 76% 36%)` (Verde Esmeralda) - Aprovação de posts.
- **Warning**: `hsl(38 92% 50%)` (Âmbar) - Status pendente.
- **Destructive**: `hsl(0 84% 60%)` (Vermelho Coral) - Rejeição de posts.

---

## ✍️ Tipografia

| Estilo | Fonte | Tamanho | Peso | Uso |
|---|---|---|---|---|
| **Display** | Geist Sans / Inter | 32px | 800 (Bold) | Títulos de Dashboard |
| **Heading** | Geist Sans / Inter | 20px | 600 (Semi-bold) | Títulos de Cards |
| **Body** | Geist Sans / Inter | 14px | 400 (Regular) | Descrições e resumos |
| **Mono** | Geist Mono | 12px | 500 (Medium) | Timestamps, Versão, Snippets |

- **Line Height**: `1.5` para corpos de texto para garantir legibilidade.
- **Tracking**: `-0.02em` em títulos decorativos para um look mais "estiloso".

---

## 💎 Componentes Core (Specs)

### 1. Cards de Notícia (Moderation Card)
- **Borda**: `1px solid hsl(214 32% 91%)`.
- **Raio**: `12px` (Radius-lg).
- **Sombra**: `shadow-sm` (subtil).
- **Hover**: Elevação leve (`translate-y-[-2px]`) e sombra `shadow-md`.
- **Badge de Relevância**: Fundo translúcido com cor baseada no score (Score > 80% = Verde, > 50% = Amarelo).

### 2. Botões Administrativos
- **Primary**: Background Blue, cantos arredondados, leve brilho no hover.
- **Ghost Actions**: Apenas ícone + texto cinza que muda de cor ao passar o mouse (Vermelho no "X", Verde no "Aprovar").

### 3. Sidebar (Master Admin)
- **Background**: `hsl(222 47% 11%)` (Azul Noite Profundo).
- **Links**: `text-slate-400` com transição para `text-white` e background `slate-800` no hover.

---

## ✨ Micro-animações & Efeitos

> [!TIP]
> Use a classe `.animate-in` para carregar novos elementos suavemente.

1. **Fade In Up**: Elementos surgindo com 10px de offset de baixo para cima (duração 0.4s, ease-out).
2. **Glassmorphism**: 
   - `backdrop-filter: blur(12px)`.
   - Borda branca com 10% de opacidade.
   - Usado em: Cabeçalhos fixos e sobreposições.
3. **Skeleton Loading**: Pulsação suave em tons de cinza claro (`#f1f5f9` para `#e2e8f0`).

---

## 🛠️ Implementação nos Arquivos
- **Fase 1**: Atualizar `globals.css` com os novos tokens HSL.
- **Fase 2**: Criar wrapper `Layout` no Admin que aplica a fonte padrão e o background gelo.
- **Fase 3**: Utilizar `Lucide-React` para todos os ícones funcionais.
