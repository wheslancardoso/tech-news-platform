# 05 — Newsletter Detail Screen // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar a tela de detalhe de uma newsletter com conteúdo completo e Terminal Debate interativo.
> **Pré-requisito**: Módulos 00, 01, 09 executados.

---

## Comportamento da Tela (Web Original)

A rota `/archive/[id]` mostra o conteúdo completo de uma newsletter:

1. **Header** com navegação e seletor de mundos
2. **Imagem de capa** (se houver)
3. **Título da edição** com número e data
4. **Intro editorial** com destaque
5. **Quick Takes** (⚡ GIRO TECH) — bullets rápidos
6. **Categorias e notícias** — cada categoria com seus itens
7. **Terminal Debate** — debate animado entre IAs com typewriter
8. **Footer**

---

## Mobile Adaptation

### Estrutura da Tela

```
┌──────────────────────────────┐
│ AppBar (Glass)               │
│ ← Back    EDIÇÃO #42         │
├──────────────────────────────┤
│ Cover Image (Full Width)     │
│ [Imagem da capa com overlay] │
├──────────────────────────────┤
│ Edition Metadata             │
│ #42 · MASTER · 01/06/2026    │
├──────────────────────────────┤
│ Title                        │
│ "Título Grande da Edição"    │
├──────────────────────────────┤
│ Intro                        │
│ "Texto editorial..."         │
├──────────────────────────────┤
│ Quick Takes Card             │
│ ⚡ GIRO TECH                 │
│ • Manchete 1                 │
│ • Manchete 2                 │
│ • Manchete 3                 │
├──────────────────────────────┤
│ ── Separator ──              │
├──────────────────────────────┤
│ Category: 🤖 IA              │
│ ┌──────────────────────────┐ │
│ │ [Imagem do item]         │ │
│ │ Headline                 │ │
│ │ Story text...            │ │
│ │ Ler fonte original →     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Headline 2               │ │
│ │ Story text...            │ │
│ └──────────────────────────┘ │
│                              │
│ Category: 💻 DEV             │
│ ...                          │
├──────────────────────────────┤
│ ── Terminal Debate ──        │
│ ┌──────────────────────────┐ │
│ │ 🤖 AI_ANALYST: "..."     │ │  ← Typewriter effect
│ │ 🛡️ SEC_OPS: "..."        │ │
│ │ 💻 DEV_LEAD: "..."       │ │
│ │                          │ │
│ │ [▶] [⏸] [⏮] [1x/2x]   │ │  ← Controls
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Admin Actions (se admin)     │
│ [✓ Aprovar] [✗ Rejeitar]     │
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

---

## Dados Necessários

### Provider

```dart
// features/newsletter_detail/application/newsletter_detail_provider.dart

final newsletterDetailProvider = FutureProvider.autoDispose.family<Newsletter, String>((ref, id) {
  return ref.read(newsletterRepositoryProvider).getById(id);
});
```

### Estrutura do content_json

```json
{
  "title": "O Futuro é Líquido",
  "intro": "Texto editorial de abertura...",
  "quickTakes": [
    "⚡ Apple anuncia novo chip M5",
    "🔥 OpenAI lança GPT-5 em beta",
    "👀 Google compra startup de robótica"
  ],
  "categories": [
    {
      "name": "🤖 IA & MACHINE LEARNING",
      "items": [
        {
          "headline": "GPT-5 promete raciocínio...",
          "story": "A OpenAI revelou hoje...",
          "link": "https://...",
          "imageUrl": "https://..."
        }
      ]
    }
  ],
  "image_prompt": "..."
}
```

### Estrutura do debate_log

```json
[
  {
    "persona": "ARIA",
    "role": "AI",
    "avatar": "🤖",
    "color": "#8B5CF6",
    "message": "A nova arquitetura de atenção..."
  },
  {
    "persona": "SENTINEL",
    "role": "SEC",
    "avatar": "🛡️",
    "color": "#F43F5E",
    "message": "Do ponto de vista de segurança..."
  }
]
```

---

## Componentes Detalhados

### 1. Cover Image

- Full-width, aspect ratio 16:9
- Overlay gradient: preto 60% na base → transparente no topo
- Border-radius: 0 (brutalista)
- Usar `CachedNetworkImage` com placeholder shimmer
- Se não houver imagem: mostrar container com gradiente primário + padrão scanlines

### 2. Edition Metadata

```dart
Row(
  children: [
    FNBadge(label: 'EDIÇÃO #${newsletter.editionNumber}', variant: BadgeVariant.primary),
    SizedBox(width: 8),
    FNBadge(label: newsletter.category ?? 'MASTER', variant: BadgeVariant.outline),
    Spacer(),
    Text(formatDate(newsletter.createdAt), style: techLabel),
  ],
)
```

### 3. Quick Takes

- Container: glass card, sem border-radius, borda 2px, fundo `#1c1b1b`
- Título: "⚡ GIRO TECH" em bold uppercase
- Lista: bullets com texto médio
- Estilo: monospace, linhas espaçadas

### 4. Category Sections

Para cada categoria em `contentJson.categories`:

```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    // Cabeçalho com cor dinâmica
    Container(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: catColor, width: 2)),
      ),
      child: Text(category.name, style: categoryTitleStyle.copyWith(color: catColor)),
    ),
    SizedBox(height: 16),
    
    // Itens
    ...category.items.map((item) => NewsItemCard(item: item, catColor: catColor)),
  ],
)
```

**Cores de categoria (mesmo do email template):**

```dart
Color getCategoryColor(String name) {
  final upper = name.toUpperCase();
  if (upper.contains('IA') || upper.contains('INTELIGÊNCIA')) return Color(0xFFA78BFA); // Lavender
  if (upper.contains('DEV') || upper.contains('ENGENHARIA')) return Color(0xFF10B981); // Emerald
  if (upper.contains('SEC') || upper.contains('CIBER') || upper.contains('HACKER')) return Color(0xFFF43F5E); // Rose
  if (upper.contains('STARTUP') || upper.contains('BUSINESS') || upper.contains('MERCADO')) return Color(0xFFF59E0B); // Amber
  return Color(0xFF8B5CF6); // Violet default
}
```

### 5. NewsItemCard

```dart
// Cada notícia dentro de uma categoria
Container(
  margin: EdgeInsets.only(bottom: 24),
  padding: EdgeInsets.only(left: 16),
  decoration: BoxDecoration(
    border: Border(left: BorderSide(color: catColor, width: 2)),
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Imagem (se houver)
      if (item.imageUrl != null)
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: CachedNetworkImage(imageUrl: item.imageUrl!, height: 200, fit: BoxFit.cover),
        ),
      SizedBox(height: 12),
      // Headline
      GestureDetector(
        onTap: () => launchUrl(Uri.parse(item.link)),
        child: Text(item.headline, style: headlineStyle),
      ),
      SizedBox(height: 8),
      // Story
      Text(item.story, style: storyStyle),
      SizedBox(height: 12),
      // Link
      GestureDetector(
        onTap: () => launchUrl(Uri.parse(item.link)),
        child: Text('Ler fonte original →', style: linkStyle.copyWith(color: catColor)),
      ),
    ],
  ),
)
```

### 6. Terminal Debate (Componente Complexo)

Este é o componente mais complexo da tela. Simula um terminal de debate entre IAs.

#### Comportamento:

1. **Parado inicialmente** — mostra apenas o primeiro avatar e "▶ PLAY PARA INICIAR"
2. **Ao clicar Play**: mensagens aparecem uma por uma com **typewriter effect**
3. **Velocidade**: 1x (30ms/char), 2x (15ms/char), 3x (5ms/char)
4. **Controles**: Play/Pause, Reset, Speed toggle
5. **Scroll automático** para a mensagem mais recente
6. **Visual**: fundo preto terminal, texto monospace, cada persona com cor própria

#### Implementação:

```dart
class TerminalDebate extends StatefulWidget {
  final List<DebateMessage> messages;
  // ...
}

class _TerminalDebateState extends State<TerminalDebate> {
  int _currentMessageIndex = 0;
  int _currentCharIndex = 0;
  bool _isPlaying = false;
  int _speed = 1; // 1x, 2x, 3x
  Timer? _timer;
  final _scrollController = ScrollController();

  void _play() {
    _isPlaying = true;
    final delays = {1: 30, 2: 15, 3: 5};
    _timer = Timer.periodic(
      Duration(milliseconds: delays[_speed]!),
      (_) => _advanceChar(),
    );
  }

  void _advanceChar() {
    if (_currentMessageIndex >= widget.messages.length) {
      _pause();
      return;
    }
    
    final currentMsg = widget.messages[_currentMessageIndex];
    if (_currentCharIndex < currentMsg.message.length) {
      setState(() => _currentCharIndex++);
    } else {
      // Próxima mensagem
      setState(() {
        _currentMessageIndex++;
        _currentCharIndex = 0;
      });
      _scrollToBottom();
    }
  }

  void _pause() { _timer?.cancel(); _isPlaying = false; setState(() {}); }
  void _reset() { _pause(); setState(() { _currentMessageIndex = 0; _currentCharIndex = 0; }); }
  void _toggleSpeed() { setState(() { _speed = _speed >= 3 ? 1 : _speed + 1; }); if (_isPlaying) { _pause(); _play(); } }
}
```

#### Visual do Terminal:

```
┌────────────────────────────────────┐
│ ● ● ●  FRESH_NEWS // AI_DEBATE    │  ← Header com dots simulando janela
├────────────────────────────────────┤
│                                    │
│ 🤖 ARIA [AI_ANALYST]               │  ← Avatar + Nome + Role (cor #8B5CF6)
│ > A nova arquitetura de atenção    │  ← Typewriter em monospace
│   permitirá que modelos locais...  │
│                                    │
│ 🛡️ SENTINEL [SEC_OPS]              │  ← (cor #F43F5E)
│ > Do ponto de vista de segu|       │  ← Cursor piscando
│                                    │
├────────────────────────────────────┤
│  [▶/⏸]  [⏮ Reset]  [2x Speed]    │  ← Controles
└────────────────────────────────────┘
```

- Fundo: `Color(0xFF0a0a0a)` (preto quase absoluto)
- Borda: 2px `Color(0xFF333333)`
- Header: dots vermelho/amarelo/verde + título monospace
- Mensagens: padding left com indicator `>`
- Cursor: caractere `|` piscando a cada 500ms
- Controles: row de botões estilizados

---

## Ações Admin (Condicional)

Se `isAdmin == true` (do `authProvider`):

```dart
if (isAdmin && newsletter.isDraft) ...[
  Row(
    children: [
      Expanded(
        child: FNButton(
          label: 'APROVAR E PUBLICAR',
          icon: LucideIcons.check,
          color: Colors.green,
          onPressed: () => _publishNewsletter(),
        ),
      ),
      SizedBox(width: 16),
      Expanded(
        child: FNButton(
          label: 'REJEITAR EDIÇÃO',
          icon: LucideIcons.x,
          color: Colors.red,
          onPressed: () => _rejectNewsletter(),
        ),
      ),
    ],
  ),
],
```

---

## Entregável Esperado

1. **newsletter_detail_screen.dart** — Tela principal com todos os blocos
2. **terminal_debate.dart** — Widget completo com typewriter + controles
3. **news_item_card.dart** — Card de item individual de notícia
4. **quick_takes.dart** — Widget do Giro Tech
5. **category_section.dart** — Widget de seção de categoria
6. **newsletter_detail_provider.dart** — Provider da tela
