# 06 — Post Detail Screen // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar a tela de detalhe de um post individual.
> **Pré-requisito**: Módulos 00, 01, 09 executados.

---

## Comportamento (Web Original)

A rota `/post/[id]` exibe o conteúdo completo de um post individual curado.

---

## Dados Necessários

```dart
final postDetailProvider = FutureProvider.autoDispose.family<Post, String>((ref, id) {
  return ref.read(postRepositoryProvider).getById(id);
});
```

### Post Entity (campos relevantes)

| Campo | Tipo | Uso na Tela |
|---|---|---|
| title | String | Título principal |
| content | String? | Conteúdo completo |
| summary | String? | Resumo (fallback se content vazio) |
| source | String? | Nome da fonte |
| url | String | Link original |
| score | int | Score de relevância |
| category | String | Categoria (ex: "IA", "TECH_HACKER") |
| subCategory | String | Sub-categoria |
| world | String | Mundo (TECH/MUSIC/GEAR/GAME) |
| themeConfig | Map? | Configuração visual (dna, cores, prompt) |
| whatsappSummary | String? | Resumo curto para compartilhamento |
| createdAt | DateTime | Data de criação |

---

## Layout Mobile

```
┌──────────────────────────────┐
│ AppBar (Glass)               │
│ ← Back          [Compartilhar]│
├──────────────────────────────┤
│ Metadata Badges              │
│ [CATEGORIA] [SCORE: 85]      │
│ [SUB_CATEGORIA] [MUNDO]      │
├──────────────────────────────┤
│ Title                        │
│ "Título Grande do Post"      │
│ (32sp bold italic uppercase) │
├──────────────────────────────┤
│ Source + Date                │
│ FONTE: TechCrunch · 01/06   │
├──────────────────────────────┤
│ ── Separator ──              │
├──────────────────────────────┤
│ Content                      │
│ Texto completo do post       │
│ (ou summary como fallback)   │
│ ...                          │
├──────────────────────────────┤
│ ── Separator ──              │
├──────────────────────────────┤
│ WhatsApp Summary (se houver) │
│ ┌──────────────────────────┐ │
│ │ 📱 RESUMO_WHATSAPP       │ │
│ │ Texto curto para share   │ │
│ │ [📋 Copiar] [📤 Share]   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Theme Config (se houver)     │
│ DNA: futuristic_tech         │
│ PROMPT: "..."                │
├──────────────────────────────┤
│ CTA Button                   │
│ [🔗 LER FONTE ORIGINAL]     │
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

---

## Componentes

### 1. Metadata Badges Row

Badges horizontal scrollable com informações do post:

```dart
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Row(
    children: [
      FNBadge(label: post.category, color: getCategoryColor(post.category)),
      SizedBox(width: 8),
      FNBadge(label: 'SCORE: ${post.score}', variant: BadgeVariant.outline),
      SizedBox(width: 8),
      FNBadge(label: post.subCategory, variant: BadgeVariant.outline),
      SizedBox(width: 8),
      FNBadge(label: post.world, variant: BadgeVariant.primary),
    ],
  ),
)
```

### 2. Content Section

- Texto completo formatado
- Usa `post.content` se disponível, senão `post.summary`
- Estilo: texto em 16sp, line-height 1.6, cor `muted-foreground`
- Se muito longo, não truncar — scroll natural

### 3. WhatsApp Summary Card

- Container glass com borda primária
- Ícone 📱 + "RESUMO_WHATSAPP"
- Texto resumido otimizado para share
- Dois botões:
  - **Copiar**: copia para clipboard com feedback "Copiado!"
  - **Compartilhar**: abre share sheet nativo com `Share.share(text)`

### 4. CTA — Fonte Original

- Botão full-width com ícone de link
- Ao clicar: `launchUrl(Uri.parse(post.url))` — abre no browser

### 5. Share Action (AppBar)

```dart
IconButton(
  icon: Icon(LucideIcons.share2),
  onPressed: () {
    final text = post.whatsappSummary ?? post.summary ?? post.title;
    Share.share('${post.title}\n\n$text\n\nLeia mais: ${post.url}');
  },
)
```

---

## Tracking

Ao abrir a tela, registrar o clique para alimentar o motor de afinidades:

```dart
@override
void initState() {
  super.initState();
  // Registrar tracking se houver subscriber logado
  final subscriberId = ref.read(subscriberIdProvider);
  if (subscriberId != null) {
    ref.read(trackingRepositoryProvider).trackClick(
      subscriberId: subscriberId,
      category: post.category,
    );
  }
}
```

---

## Entregável Esperado

1. **post_detail_screen.dart** — Tela completa
2. **post_detail_provider.dart** — Provider com FutureProvider.family
3. **whatsapp_summary_card.dart** — Card de resumo compartilhável
