# 12 — Tracking & ML Reativo // Fresh News Mobile

> **Destinatário**: Membro 3 (Admin & Integrações)
> **Objetivo**: Implementar o sistema de tracking de cliques e recomendação por ML reativo.
> **Pré-requisito**: Módulos 00, 01 executados.

---

## Contexto — Experiência Imersiva

O app Flutter é a **evolução do resumo WhatsApp**. Enquanto o WhatsApp entrega texto estático, o app oferece:

- **Tracking implícito**: cada interação do usuário (ler post, abrir edição, tempo de leitura) alimenta o motor de afinidades
- **Personalização em tempo real**: o feed se reorganiza automaticamente conforme o comportamento
- **Controle explícito**: o usuário pode ajustar manualmente suas preferências a qualquer momento

---

## Comportamento Web Original

### API de Tracking (`/api/track`)

```typescript
// app/api/track/route.ts
// Fluxo:
// 1. Recebe: ?sub=<subscriberId>&nl=<newsletterId>&cat=<category>&url=<targetUrl>
// 2. Insere registro em user_clicks
// 3. Recalcula preferências do assinante (ML reativo)
// 4. Redireciona para a URL original
```

### ML Reativo (Recálculo de Preferências)

```typescript
// Algoritmo:
// 1. Buscar os últimos 30 cliques do assinante
// 2. Contar frequência por categoria
// 3. Pegar o top 3
// 4. Atualizar campo `preferences` do subscriber

// Exemplo:
// Cliques: [IA, IA, DEV, IA, SEC, DEV, IA, CLOUD]
// Contagem: { IA: 4, DEV: 2, SEC: 1, CLOUD: 1 }
// Top 3: ['IA', 'DEV', 'SEC']
// → subscriber.preferences = ['IA', 'DEV', 'SEC']
```

---

## Implementação Mobile

No mobile, o tracking é **mais rico** que no web porque temos acesso a métricas adicionais.

### Eventos Rastreáveis

| Evento | Trigger | Dados Salvos |
|---|---|---|
| `newsletter_open` | Usuário abre detalhe de newsletter | newsletter_id, category |
| `post_open` | Usuário abre detalhe de post | post_id, category |
| `link_click` | Usuário clica em "Ler fonte original" | url, category |
| `debate_play` | Usuário dá play no Terminal Debate | newsletter_id |
| `share` | Usuário compartilha um conteúdo | post_id ou newsletter_id |
| `preference_change` | Usuário altera preferências manualmente | preferences[] |

### Tracking Repository (Já definido no módulo 01, expandir)

```dart
// shared/infrastructure/tracking_repository.dart

class TrackingRepository {
  final SupabaseClient _client;

  TrackingRepository(this._client);

  /// Registra qualquer tipo de interação
  Future<void> trackEvent({
    required String subscriberId,
    String? newsletterId,
    required String category,
  }) async {
    // 1. Inserir clique no banco
    await _client.from('user_clicks').insert({
      'subscriber_id': subscriberId,
      'newsletter_id': newsletterId,
      'category': category.replaceAll(RegExp(r'[^\w\s]'), '').trim(), // Limpar emojis
    });

    // 2. Recalcular preferências (ML reativo)
    await _recalculatePreferences(subscriberId);
  }

  /// ML Reativo — Recalcula top 3 categorias preferidas
  Future<void> _recalculatePreferences(String subscriberId) async {
    // Buscar últimos 30 cliques
    final clicks = await _client
        .from('user_clicks')
        .select('category')
        .eq('subscriber_id', subscriberId)
        .order('clicked_at', ascending: false)
        .limit(30);

    if (clicks.isEmpty) return;

    // Contar frequência
    final Map<String, int> counts = {};
    for (final click in clicks) {
      final cat = click['category'] as String;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    // Top 3
    final sorted = counts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final topPrefs = sorted.take(3).map((e) => e.key).toList();

    // Atualizar subscriber
    await _client
        .from('subscribers')
        .update({'preferences': topPrefs})
        .eq('id', subscriberId);
  }

  /// Buscar histórico de cliques para analytics
  Future<Map<String, int>> getCategoryStats(String subscriberId) async {
    final clicks = await _client
        .from('user_clicks')
        .select('category')
        .eq('subscriber_id', subscriberId);

    final Map<String, int> stats = {};
    for (final click in clicks) {
      final cat = click['category'] as String;
      stats[cat] = (stats[cat] ?? 0) + 1;
    }
    return stats;
  }
}
```

### Integração nos Widgets

```dart
// Em qualquer tela que abra conteúdo:

void _trackOpen(String category, {String? newsletterId}) {
  final subscriberId = ref.read(subscriberIdProvider);
  if (subscriberId == null) return; // Visitante anônimo, não rastreia

  ref.read(trackingRepositoryProvider).trackEvent(
    subscriberId: subscriberId,
    newsletterId: newsletterId,
    category: category,
  );
}

// Exemplos de chamada:
// Na NewsletterDetailScreen:
_trackOpen(newsletter.category ?? 'MASTER', newsletterId: newsletter.id);

// Na PostDetailScreen:
_trackOpen(post.category);

// No link "Ler fonte original":
_trackOpen(item.category, newsletterId: newsletterId);
launchUrl(Uri.parse(item.link));
```

### Widget de Estatísticas (Novo — Exclusivo Mobile)

O app pode mostrar ao usuário **suas próprias estatísticas de leitura**, algo que o WhatsApp nunca poderia:

```dart
// features/preferences/presentation/widgets/reading_stats.dart

class ReadingStats extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subscriberId = ref.watch(subscriberIdProvider);
    if (subscriberId == null) return SizedBox.shrink();

    return FutureBuilder<Map<String, int>>(
      future: ref.read(trackingRepositoryProvider).getCategoryStats(subscriberId),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return SizedBox.shrink();
        
        final stats = snapshot.data!;
        final total = stats.values.fold(0, (a, b) => a + b);

        return GlassCard(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('SEU PERFIL DE LEITURA', style: FNTypography.techLabel),
              SizedBox(height: 16),
              ...stats.entries.map((e) {
                final percentage = total > 0 ? (e.value / total * 100).round() : 0;
                return Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(e.key, style: FNTypography.bodySmall),
                          Text('$percentage%', style: FNTypography.techLabel.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                          )),
                        ],
                      ),
                      SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: percentage / 100,
                        backgroundColor: Colors.white.withOpacity(0.05),
                        valueColor: AlwaysStoppedAnimation(Theme.of(context).colorScheme.primary),
                        minHeight: 4,
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}
```

---

## Entregável Esperado

1. **tracking_repository.dart** expandido com todos os métodos
2. **reading_stats.dart** — Widget de estatísticas de leitura
3. **Integração** do tracking nas telas de detalhe (newsletter e post)
4. **Documentação** de quais eventos são rastreados e onde
