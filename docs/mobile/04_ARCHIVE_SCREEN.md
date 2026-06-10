# 04 — Archive Screen // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar a tela de arquivo com feed de afinidades e edições históricas.
> **Pré-requisito**: Módulos 00, 01, 09 executados.

---

## Comportamento da Tela (Web Original)

A página `/archive` tem 3 grandes blocos:

1. **Hero do Arquivo** — Título "Arquivo Histórico" com contador de edições
2. **Feed de Afinidades** — Posts individuais ordenados por afinidade do assinante
3. **Edições Arquivadas** — Grid de newsletters completas publicadas

### Conceito de "Afinidade"

Se o usuário for um **assinante identificado** (via `subscriberId`):
- Posts são reordenados com base nas preferências do assinante
- Categorias selecionadas vêm primeiro, desempate por score
- Mostra badge "AFINIDADE_ALTA" nos posts de categorias preferidas
- Permite ajustar preferências via link "AJUSTAR_INTERESSES"

Se NÃO for assinante:
- Mostra posts em ordem de score (padrão)
- Exibe CTA para assinar

---

## Mobile Adaptation

### Estrutura da Tela

```
┌──────────────────────────────┐
│ AppBar (Glass)               │  ← "Arquivo" + World Selector
├──────────────────────────────┤
│ Hero Card                    │
│ "ARQUIVO HISTÓRICO"          │
│ [TOTAL_LOGS: 42]             │
├──────────────────────────────┤
│ Affinity Alert Banner        │  ← Status do motor de afinidades
│ ┌────────────────────────┐   │
│ │ 🟢 MOTOR_ATIVO         │   │  ← ou 🔴 MOTOR_INATIVO
│ │ Feed personalizado      │   │
│ │ [AJUSTAR_INTERESSES]    │   │
│ └────────────────────────┘   │
├──────────────────────────────┤
│ Section: "Feed de Afinidades"│
│ ┌──────────────────────────┐ │
│ │ PostCard                 │ │
│ │ [CATEGORIA]  [SCORE: 85] │ │
│ │ [AFINIDADE_ALTA] (opt.)  │ │
│ │ Título do Post           │ │
│ │ Resumo...                │ │
│ │ FONTE: web  LER_POST →   │ │
│ └──────────────────────────┘ │
│ ...                          │
├──────────────────────────────┤
│ Divider                      │
├──────────────────────────────┤
│ Section: "Edições Arquivadas"│
│ NewsCard grid (1 col mobile) │
│ ...                          │
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

---

## Dados Necessários

### Providers

```dart
// features/archive/application/archive_providers.dart

/// ID do assinante (pode vir de SharedPrefs ou deep link)
final subscriberIdProvider = StateProvider<String?>((ref) => null);

/// Subscriber data (se logado)
final subscriberProvider = FutureProvider.autoDispose<Subscriber?>((ref) {
  final id = ref.watch(subscriberIdProvider);
  if (id == null) return null;
  return ref.read(subscriberRepositoryProvider).getById(id);
});

/// Posts aprovados do mundo ativo (com reordenação por afinidade)
final affinityPostsProvider = FutureProvider.autoDispose<List<Post>>((ref) async {
  final world = ref.watch(activeWorldProvider);
  final subscriber = await ref.watch(subscriberProvider.future);
  
  final posts = await ref.read(postRepositoryProvider).getApproved(
    world: world.name.toUpperCase(),
    limit: 10,
  );

  if (subscriber == null || subscriber.preferences.isEmpty) return posts;

  // Reordenar por afinidade
  return posts..sort((a, b) {
    final aPref = subscriber.preferences.contains(a.category) ? 1 : 0;
    final bPref = subscriber.preferences.contains(b.category) ? 1 : 0;
    if (aPref != bPref) return bPref - aPref;
    return b.score.compareTo(a.score);
  });
});

/// Newsletters publicadas do mundo ativo
final archivedNewslettersProvider = FutureProvider.autoDispose<List<Newsletter>>((ref) {
  final world = ref.watch(activeWorldProvider);
  return ref.read(newsletterRepositoryProvider).getPublished(
    world: world.name.toUpperCase(),
    limit: 100,
  );
});
```

---

## Componentes Detalhados

### 1. Hero Card

- Container: glass card, sem border-radius (brutalista), borda dupla 4px `border-white/10`
- Background: scanlines overlay com opacity 5%
- Layout: Column
  - Badge: ícone pulse + "INTELLIGENCE_LOG"
  - Título: "ARQUIVO HISTÓRICO" em 40sp bold italic
  - A palavra "HISTÓRICO" em cor primária
  - Subtítulo: "Explorando o log de transmissões técnicas"
- Direita: glass card com "TOTAL_LOGS" + contador grande

### 2. Affinity Alert Banner

Dois estados visuais:

**Motor ATIVO (assinante identificado):**
- Borda: `Colors.green[500]` com opacity 0.4
- Fundo: `Colors.green[950]` com opacity 0.1
- Dot verde pulsante + "MOTOR_DE_AFINIDADES_ATIVO"
- Título: "Zine Personalizado // Feed de Afinidades"
- Descrição: mostra email do subscriber
- Tags de filtros (chips das preferências)
- Botão: "AJUSTAR_INTERESSES" → navega para `/preferences/:id`

**Motor INATIVO (visitante):**
- Borda: branca 10%
- Fundo: branco 1%
- Dot neutro + "MOTOR_DE_AFINIDADES_INATIVO"
- CTA: "ASSINAR_PORTAL" → navega para `/subscribe`

### 3. PostCard (Feed de Afinidades)

Componente novo, específico para posts individuais:

```dart
class PostCard extends StatelessWidget {
  final Post post;
  final bool isPreferred; // se a categoria é preferida do subscriber

  // Layout:
  // - Container: borda verde se isPreferred, branca se não
  // - Scanlines overlay
  // - Badge de categoria com cor dinâmica:
  //   - TECH_HACKER / SEGURANÇA → vermelho
  //   - SYNTH_AESTHETICS → roxo  
  //   - GEARHEAD → amarelo
  //   - IA → verde esmeralda
  //   - Default → ciano
  // - Badge "AFINIDADE_ALTA" se isPreferred (verde)
  // - Score: "SCORE: 85"
  // - Título em 20sp bold italic, muda para primary no hover
  // - Resumo truncado em 4 linhas
  // - Footer: "FONTE: web" + "LER_POST →"
  // - Ao clicar: navega para /post/:id
}
```

**Cores de categoria:**

```dart
Color getCategoryColor(String category) {
  switch (category) {
    case 'TECH_HACKER':
    case 'SEGURANÇA':
      return const Color(0xFFF87171); // red-400
    case 'SYNTH_AESTHETICS':
      return const Color(0xFFA78BFA); // purple-400
    case 'GEARHEAD':
      return const Color(0xFFFBBF24); // yellow-400
    case 'IA':
      return const Color(0xFF34D399); // emerald-400
    default:
      return const Color(0xFF22D3EE); // cyan-400
  }
}
```

### 4. Seção "Edições Arquivadas"

- Usa os mesmos `NewsCard` da Home
- Grid de 1 coluna no mobile, 2 no tablet
- Cada card mostra: imagem, edição, título, data, intro
- Clicar navega para `/archive/:id`

---

## Animações

| Elemento | Animação |
|---|---|
| PostCards | FadeInLeft staggered (100ms delay) |
| NewsCards | FadeInUp staggered (100ms delay) |
| Alert banner | SlideInDown (300ms) |
| Badge "AFINIDADE_ALTA" | Glow pulse (2s loop) |

---

## Entregável Esperado

1. **archive_screen.dart** — Scaffold com CustomScrollView
2. **archive_hero.dart** — Hero card
3. **affinity_alert.dart** — Banner de status do motor
4. **post_card.dart** — Card de post individual (reutilizável)
5. **edition_grid.dart** — Grid de newsletters arquivadas
6. **archive_providers.dart** — Todos os providers
