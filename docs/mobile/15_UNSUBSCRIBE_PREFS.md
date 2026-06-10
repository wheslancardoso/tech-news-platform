# 15 — Unsubscribe & Preferences // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar as telas de cancelamento de inscrição e ajuste de preferências.
> **Pré-requisito**: Módulos 00, 01, 09 executados.

---

## Contexto — Controle do Usuário

Uma das premissas do app é dar ao usuário **mais controle e personalização**. A tela de preferências é central para isso, indo além do que era possível no WhatsApp.

---

## 1. Tela de Unsubscribe

### Comportamento Web Original

A rota `/unsubscribe?token=<uuid>` cancela a inscrição:

```typescript
// actions/unsubscribe.ts
export async function unsubscribeUser(token: string) {
  const supabase = createAdminClient()
  
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, email')
    .eq('unsubscribe_token', token)
    .single()

  if (!subscriber) {
    return { success: false, message: 'Link inválido ou expirado.' }
  }

  await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', subscriber.id)

  return { success: true, message: 'Inscrição cancelada.' }
}
```

### Layout Mobile

```
┌──────────────────────────────┐
│ (Centralizado verticalmente) │
│                              │
│ Background Glow (blur)       │
│                              │
│ ┌──────────────────────────┐ │
│ │ Glass Card (r: 56px)     │ │
│ │                          │ │
│ │    ✅ ou ❌ (ícone 80px)  │ │
│ │                          │ │
│ │ "INSCRIÇÃO_CANCELADA"    │ │
│ │ ou "ERRO_DE_PROTOCOLO"   │ │
│ │                          │ │
│ │ Mensagem explicativa     │ │
│ │                          │ │
│ │ [INSCREVER-SE_NOVAMENTE] │ │
│ │ ou [VOLTAR_AO_APP]       │ │
│ │                          │ │
│ │ Fresh News // 2026       │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Implementação

```dart
// features/unsubscribe/presentation/unsubscribe_screen.dart

class UnsubscribeScreen extends ConsumerStatefulWidget {
  final String? token;
  const UnsubscribeScreen({this.token});

  @override
  ConsumerState<UnsubscribeScreen> createState() => _UnsubscribeScreenState();
}

class _UnsubscribeScreenState extends ConsumerState<UnsubscribeScreen> {
  bool? _success;
  String _message = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _processUnsubscribe();
  }

  Future<void> _processUnsubscribe() async {
    if (widget.token == null) {
      setState(() {
        _success = false;
        _message = 'Link inválido.';
        _loading = false;
      });
      return;
    }

    final result = await ref.read(subscriberRepositoryProvider).unsubscribe(widget.token!);
    setState(() {
      _success = result.success;
      _message = result.message;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: FNColors.background,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final isSuccess = _success ?? false;
    final glowColor = isSuccess 
        ? Theme.of(context).colorScheme.primary.withOpacity(0.2)
        : FNColors.error.withOpacity(0.1);

    return Scaffold(
      backgroundColor: FNColors.background,
      body: Stack(
        children: [
          // Background glow
          Center(
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: glowColor,
              ),
            ),
          ).animate().fadeIn(duration: Duration(seconds: 1)),

          // Content
          Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: GlassCard(
                borderRadius: 56,
                padding: EdgeInsets.all(48),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Ícone
                    GlassCard(
                      borderRadius: 16,
                      padding: EdgeInsets.all(20),
                      child: Icon(
                        isSuccess ? LucideIcons.checkCircle : LucideIcons.xCircle,
                        size: 40,
                        color: isSuccess ? FNColors.success : FNColors.error,
                      ),
                    ),
                    SizedBox(height: 40),

                    // Título
                    Text(
                      isSuccess ? 'INSCRIÇÃO_CANCELADA' : 'ERRO_DE_PROTOCOLO',
                      style: FNTypography.h3.copyWith(fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 24),

                    // Mensagem
                    Text(
                      isSuccess 
                          ? 'Que pena ver você partir! Seu e-mail foi removido da nossa lista de envio.'
                          : _message,
                      style: FNTypography.bodyMedium.copyWith(
                        color: FNColors.mutedForeground.withOpacity(0.8),
                        fontStyle: FontStyle.italic,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 48),

                    // CTA
                    FNButton(
                      label: isSuccess ? 'INSCREVER-SE_NOVAMENTE' : 'VOLTAR_AO_APP',
                      onPressed: () => context.go('/'),
                      fullWidth: true,
                    ),
                    SizedBox(height: 48),

                    // Footer
                    Text(
                      'Fresh News // Protocol // 2026',
                      style: FNTypography.techLabelSmall.copyWith(
                        color: FNColors.mutedForeground.withOpacity(0.15),
                        fontStyle: FontStyle.italic,
                        letterSpacing: 5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 2. Tela de Preferências (Controle Total)

### Comportamento Web Original

A rota `/preferencias/[id]` permite ao assinante:
- Ver suas preferências atuais
- Selecionar/deselecionar categorias de interesse
- Salvar via `savePreferencesAction`

### Layout Mobile (Expandido para Experiência Imersiva)

No mobile, esta tela é **muito mais completa** que no web, oferecendo controle total:

```
┌──────────────────────────────┐
│ AppBar: "Suas Preferências"  │
├──────────────────────────────┤
│ Profile Card                 │
│ ┌──────────────────────────┐ │
│ │ 📧 usuario@email.com     │ │
│ │ Status: ATIVO             │ │
│ │ Desde: 01/01/2026        │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Section: "Interesses"        │
│ Selecione as categorias:     │
│ ┌─────┐ ┌─────┐ ┌─────┐     │
│ │💻DEV│ │🤖 IA│ │🛡️SEC│     │  ← Toggle chips
│ └─────┘ └─────┘ └─────┘     │
│ ┌─────┐ ┌─────┐             │
│ │🚀STR│ │☁️CLD│             │
│ └─────┘ └─────┘             │
├──────────────────────────────┤
│ Section: "Mundos Ativos"     │
│ ┌─────┐ ┌─────┐             │
│ │💻TCH│ │🎵MUS│             │  ← Toggle chips (multi)
│ └─────┘ └─────┘             │
│ ┌─────┐ ┌─────┐             │
│ │⚙️GER│ │🎮GAM│             │
│ └─────┘ └─────┘             │
├──────────────────────────────┤
│ Section: "Perfil de Leitura" │
│ ┌──────────────────────────┐ │
│ │ ReadingStats widget       │ │  ← Do módulo 12
│ │ IA ████████████ 45%      │ │
│ │ DEV █████████ 30%        │ │
│ │ SEC ████ 15%             │ │
│ │ Cloud ██ 10%             │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Section: "Notificações"      │
│ [🔔] Push Notifications [ON]│  ← Toggle
│ Configurar horários...       │
├──────────────────────────────┤
│ Danger Zone                  │
│ [🔴 Cancelar Inscrição]     │  ← Confirmação antes
├──────────────────────────────┤
│ [SALVAR_PREFERÊNCIAS]        │  ← Botão primário
└──────────────────────────────┘
```

### Provider

```dart
// features/preferences/application/preferences_provider.dart

class PreferencesState {
  final Subscriber? subscriber;
  final Set<String> selectedPreferences;
  final Set<String> selectedWorlds;
  final bool isLoading;
  final bool isSaving;
  final String? message;

  const PreferencesState({
    this.subscriber,
    this.selectedPreferences = const {},
    this.selectedWorlds = const {},
    this.isLoading = true,
    this.isSaving = false,
    this.message,
  });
}

class PreferencesNotifier extends StateNotifier<PreferencesState> {
  final SubscriberRepository _repository;
  final String _subscriberId;

  PreferencesNotifier(this._repository, this._subscriberId) : super(const PreferencesState()) {
    _load();
  }

  Future<void> _load() async {
    final subscriber = await _repository.getById(_subscriberId);
    if (subscriber != null) {
      state = PreferencesState(
        subscriber: subscriber,
        selectedPreferences: subscriber.preferences.toSet(),
        selectedWorlds: subscriber.activeWorlds.toSet(),
        isLoading: false,
      );
    }
  }

  void togglePreference(String category) {
    final current = Set<String>.from(state.selectedPreferences);
    current.contains(category) ? current.remove(category) : current.add(category);
    state = PreferencesState(
      subscriber: state.subscriber,
      selectedPreferences: current,
      selectedWorlds: state.selectedWorlds,
      isLoading: false,
    );
  }

  void toggleWorld(String world) {
    final current = Set<String>.from(state.selectedWorlds);
    current.contains(world) ? current.remove(world) : current.add(world);
    // Pelo menos 1 mundo deve estar ativo
    if (current.isEmpty) return;
    state = PreferencesState(
      subscriber: state.subscriber,
      selectedPreferences: state.selectedPreferences,
      selectedWorlds: current,
      isLoading: false,
    );
  }

  Future<void> save() async {
    state = PreferencesState(
      subscriber: state.subscriber,
      selectedPreferences: state.selectedPreferences,
      selectedWorlds: state.selectedWorlds,
      isSaving: true,
    );

    await _repository.updatePreferences(
      _subscriberId,
      state.selectedPreferences.toList(),
    );

    state = PreferencesState(
      subscriber: state.subscriber,
      selectedPreferences: state.selectedPreferences,
      selectedWorlds: state.selectedWorlds,
      isSaving: false,
      message: 'Preferências salvas com sucesso! 🎯',
    );
  }
}

final preferencesProvider = StateNotifierProvider.autoDispose
    .family<PreferencesNotifier, PreferencesState, String>((ref, subscriberId) {
  return PreferencesNotifier(ref.read(subscriberRepositoryProvider), subscriberId);
});
```

### Profile Card

```dart
class ProfileCard extends StatelessWidget {
  final Subscriber subscriber;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar gerado a partir do email
              CircleAvatar(
                radius: 24,
                backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                child: Text(
                  subscriber.email[0].toUpperCase(),
                  style: FNTypography.h3.copyWith(color: Theme.of(context).colorScheme.primary),
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(subscriber.email, style: FNTypography.bodyMedium),
                    SizedBox(height: 4),
                    Row(
                      children: [
                        FNBadge(
                          label: subscriber.isActive ? 'ATIVO' : 'INATIVO',
                          variant: subscriber.isActive ? BadgeVariant.success : BadgeVariant.destructive,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Desde ${DateFormat('dd/MM/yyyy').format(subscriber.createdAt)}',
                          style: FNTypography.techLabelSmall.copyWith(color: FNColors.mutedForeground),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

### Danger Zone (Cancelar Inscrição)

```dart
class DangerZone extends ConsumerWidget {
  final String subscriberId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GlassCard(
      borderColor: FNColors.error.withOpacity(0.2),
      padding: EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ZONA_DE_PERIGO', style: FNTypography.techLabel.copyWith(color: FNColors.error)),
          SizedBox(height: 16),
          Text(
            'Ao cancelar sua inscrição, você deixará de receber notificações e o motor de afinidades será desativado.',
            style: FNTypography.bodySmall.copyWith(color: FNColors.mutedForeground),
          ),
          SizedBox(height: 16),
          FNButton(
            label: 'CANCELAR_INSCRIÇÃO',
            icon: LucideIcons.alertTriangle,
            color: FNColors.error,
            variant: FNButtonVariant.outline,
            fullWidth: true,
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  backgroundColor: FNColors.surface,
                  title: Text('Tem certeza?', style: FNTypography.h3),
                  content: Text('Esta ação não pode ser desfeita facilmente.'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context, false), child: Text('Cancelar')),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: Text('Sim, cancelar', style: TextStyle(color: FNColors.error)),
                    ),
                  ],
                ),
              );
              
              if (confirm == true) {
                // Buscar o token do subscriber e chamar unsubscribe
                // Depois navegar para tela de unsubscribe com sucesso
                context.go('/');
              }
            },
          ),
        ],
      ),
    );
  }
}
```

---

## Entregável Esperado

1. **unsubscribe_screen.dart** — Tela de cancelamento
2. **preferences_screen.dart** — Tela de preferências completa
3. **profile_card.dart** — Card de perfil do assinante
4. **danger_zone.dart** — Seção de cancelamento
5. **preferences_provider.dart** — Notifier com load/save
6. **Integração** com ReadingStats do módulo 12
