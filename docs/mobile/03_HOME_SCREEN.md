# 03 — Home Screen // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar a tela principal do app com Hero, formulário de inscrição e grid de newsletters.
> **Pré-requisito**: Módulos 00, 01 e 09 executados (arquitetura base + models + design system).

---

## Comportamento da Tela (Web Original)

A Home (`/`) é a landing page principal com 6 seções:

1. **Header fixo** com logo, navegação, seletor de mundos e botão "Assinar Zine"
2. **Hero Section** com título animado, subtítulo e CTA
3. **Quick Navigation** com tabs de categoria
4. **Grid de Newsletters** publicadas (filtradas por mundo ativo e categoria)
5. **Formulário de Inscrição** (`#subscribe`)
6. **Footer** com links e copyright

---

## Mobile Adaptation

No mobile, o layout é **vertical single-column**. O header fixo vira um **BottomNavigationBar** glassmorphism. A nav de mundos vira um **chip selector horizontal scrollable**.

### Estrutura da Tela

```
┌──────────────────────────────┐
│ SliverAppBar (Glass)         │  ← Logo "FN" + título + ações
├──────────────────────────────┤
│ Hero Section                 │  ← Título grande + badge + CTA
│ "Informação destilada..."    │
├──────────────────────────────┤
│ World Chips (Horizontal)     │  ← TECH | MUSIC | GEAR | GAME
├──────────────────────────────┤
│ Category Tabs (Scroll)       │  ← TODAS | IA | DEV | SEGURANÇA...
├──────────────────────────────┤
│ Newsletter Grid (Vertical)   │  ← Cards empilhados (1 coluna)
│ ┌──────────────────────────┐ │
│ │ NewsCard                 │ │
│ │ [Imagem]                 │ │
│ │ EDIÇÃO #42               │ │
│ │ Título da Newsletter     │ │
│ │ Intro resumida...        │ │
│ │ 01/06/2026               │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ NewsCard                 │ │
│ └──────────────────────────┘ │
│ ...                          │
├──────────────────────────────┤
│ Subscribe Section            │  ← Formulário de inscrição
│ Email + Phone + Categorias   │
│ [ASSINAR]                    │
├──────────────────────────────┤
│ Footer                       │  ← Logo + links + copyright
└──────────────────────────────┘
```

---

## Dados Necessários

### Provider: newsletters publicadas

```dart
// features/home/application/home_providers.dart

/// Newsletters publicadas do mundo ativo (reativo à troca de mundo)
final publishedNewslettersProvider = FutureProvider.autoDispose<List<Newsletter>>((ref) {
  final world = ref.watch(activeWorldProvider);
  return ref.read(newsletterRepositoryProvider).getPublished(world: world.name.toUpperCase());
});

/// Categorias disponíveis (filtradas)
final selectedCategoryProvider = StateProvider<String?>((ref) => null);

/// Newsletters filtradas por categoria
final filteredNewslettersProvider = Provider.autoDispose<AsyncValue<List<Newsletter>>>((ref) {
  final newsletters = ref.watch(publishedNewslettersProvider);
  final selectedCategory = ref.watch(selectedCategoryProvider);
  
  return newsletters.whenData((list) {
    if (selectedCategory == null) return list;
    return list.where((n) => n.category == selectedCategory).toList();
  });
});
```

### Query Supabase Equivalente

```sql
SELECT * FROM newsletters 
WHERE status = 'published' AND world = :activeWorld 
ORDER BY edition_number DESC 
LIMIT 12;
```

---

## Seções Detalhadas

### 1. SliverAppBar (Glass)

- Fundo: `Colors.transparent` com `BackdropFilter` blur 24px
- Borda inferior: 2px cor primária
- Leading: Logo "FN" (quadrado 40x40, fundo primário, texto branco bold)
- Title: "FRESH NEWS" em italic bold
- Actions: `WorldSelector` widget (do módulo 08)

### 2. Hero Section

```
Layout:
- Padding horizontal 24px, vertical 48px
- Badge superior: ícone pulse + "STATUS // ONLINE // TRANSMITINDO"
- Título: "INFORMAÇÃO DESTILADA. SEM RUÍDO." em 36sp bold italic uppercase
  - A palavra "RUÍDO" em cor primária com shadow glow
- Subtítulo: Texto editorial em 16sp, itálico, com borda esquerda primária 4px
- Botão CTA: "ACESSAR_EDIÇÕES" → navega para /archive
```

### 3. World Chips

Widget horizontal scrollable com chips para cada mundo:

| Mundo | Ícone | Cor quando ativo |
|---|---|---|
| TECH | 💻 | Verde #22c55e |
| MUSIC | 🎵 | Amarelo #eab308 |
| GEAR | ⚙️ | Âmbar #f59e0b |
| GAME | 🎮 | Roxo #a855f7 |

Ao trocar de mundo, a query de newsletters é refeita automaticamente (reactive via Riverpod).

### 4. Category Tabs

- Tab "TODAS" (default, mostra tudo)
- Tabs dinâmicas baseadas nas categorias existentes
- Estilo: chips retangulares sem border-radius (brutalista), borda 2px
- Ativo: fundo primário, texto branco
- Inativo: fundo transparente, borda branca 10%

### 5. Newsletter Grid

Cada card usa o componente `NewsCard` (shared widget definido no módulo 09).

**Dados do NewsCard:**

```dart
NewsCard(
  id: newsletter.id,              // Para navegação ao /archive/:id
  edition: newsletter.editionNumber,
  title: newsletter.title,
  date: newsletter.createdAt,
  intro: newsletter.summaryIntro,
  status: newsletter.status,       // 'draft' | 'published'
  isAdmin: false,                  // Na home é sempre false
  imageUrl: newsletter.imageUrl,
)
```

**Comportamento ao clicar**: `context.push('/archive/${newsletter.id}')`

### 6. Subscribe Section

Este é o formulário de inscrição. **Detalhes completos no módulo `07_SUBSCRIBE_FLOW.md`.**

Resumo visual:
- Container glass com borda dupla (4px double)
- Título: "ASSINAR_PROTOCOLO"
- Campo Email (obrigatório)
- Campo Telefone (opcional, formato: +55...)
- Grid de chips de preferência (multi-select):
  - "💻 DEV", "🤖 IA", "🛡️ Segurança", "🚀 Startups", "☁️ Cloud"
- Botão "ATIVAR_TRANSMISSÃO"
- Mensagem de sucesso/erro abaixo

### 7. Footer

- Logo "FN" + "Fresh News // 2026"
- Links: Manifesto, Arquivo
- Copyright: "© 2026 Binary BroadSheet // Premium Intelligence"

---

## Animações

| Elemento | Animação |
|---|---|
| Badge "STATUS // ONLINE" | Dot pulsante (1s loop) |
| Título hero | FadeInUp (0.5s) |
| Cards da grid | FadeInUp staggered (100ms delay entre cada) |
| World chips | Scale up on tap (0.95 → 1.0) |
| Subscribe success | SlideInUp + checkmark animado |

---

## Skeleton Loading

Enquanto os dados carregam, mostrar:
- Hero: estático (já disponível)
- Grid: 3 skeleton cards com shimmer effect (usar pacote `shimmer`)
- Cada skeleton card: retângulo 100% largura, 200px altura, border radius

---

## Entregável Esperado

1. **home_screen.dart** — Scaffold com CustomScrollView + Slivers
2. **hero_section.dart** — Widget do Hero
3. **category_filter.dart** — Widget de tabs de categoria
4. **newsletter_grid.dart** — Grid de NewsCards
5. **home_providers.dart** — Providers Riverpod da home
6. **subscribe_section.dart** — Preview simples (implementação completa no módulo 07)

> **ATENÇÃO**: Use `ref.watch(activeWorldProvider)` para reagir automaticamente à troca de mundo. Quando o mundo muda, a query de newsletters deve ser refeita.
