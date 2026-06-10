# 07 — Subscribe Flow // Fresh News Mobile

> **Destinatário**: Membro 2 (Telas de Consumo)
> **Objetivo**: Implementar o fluxo completo de inscrição do assinante.
> **Pré-requisito**: Módulos 00, 01, 09 executados.

---

## Comportamento (Web Original)

O formulário de inscrição aparece em dois lugares:
1. Na **Home page** como seção `#subscribe`
2. Potencialmente como **tela separada** no mobile

### Lógica de Negócio (actions/subscribe.ts)

```typescript
// Validação com Zod:
const schema = z.object({
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  preferences: z.array(z.string()).optional().default([]),
})

// Fluxo:
// 1. Validar input
// 2. Verificar se email já existe no banco
//    - Se existe e status = 'active' → retorna "Já inscrito"
//    - Se existe e status = 'unsubscribed' → reativa com novos dados
//    - Se não existe → insere novo subscriber
// 3. Retorna { success: true, message: "..." }
```

### Categorias de Preferência Disponíveis

```typescript
const CATEGORIES = [
  '💻 DEV',
  '🤖 IA',
  '🛡️ Segurança',
  '🚀 Startups',
  '☁️ Cloud',
]
```

---

## Layout Mobile

```
┌──────────────────────────────┐
│ AppBar (Glass)               │
│ ← Back    INSCRIÇÃO          │
├──────────────────────────────┤
│ Hero                         │
│ "ASSINAR_PROTOCOLO"          │
│ Subtítulo editorial          │
├──────────────────────────────┤
│ Form Card (Glass)            │
│ ┌──────────────────────────┐ │
│ │ Email *                  │ │  ← TextFormField com validação
│ │ [seu@email.com]          │ │
│ ├──────────────────────────┤ │
│ │ Telefone (opcional)      │ │  ← Formato: +55 11 99999-9999
│ │ [+55...]                 │ │
│ ├──────────────────────────┤ │
│ │ Seus Interesses          │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ │ │  ← Multi-select chips
│ │ │💻DEV│ │🤖 IA│ │🛡️SEC│ │ │
│ │ └─────┘ └─────┘ └─────┘ │ │
│ │ ┌─────┐ ┌─────┐         │ │
│ │ │🚀STR│ │☁️CLD│         │ │
│ │ └─────┘ └─────┘         │ │
│ ├──────────────────────────┤ │
│ │                          │ │
│ │ [ATIVAR_TRANSMISSÃO]     │ │  ← Botão primário full-width
│ │                          │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Success/Error Feedback       │
│ ┌──────────────────────────┐ │
│ │ ✅ Inscrito com sucesso! │ │  ← AnimatedSwitcher
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

## Validação

```dart
// Validação client-side
String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'E-mail é obrigatório';
  final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!regex.hasMatch(value)) return 'E-mail inválido';
  return null;
}

String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return null; // Opcional
  final cleaned = value.replaceAll(RegExp(r'[^\d+]'), '');
  if (cleaned.length < 10) return 'Telefone muito curto';
  return null;
}
```

---

## State Management

```dart
// features/subscribe/application/subscribe_controller.dart

enum SubscribeStatus { idle, loading, success, error }

class SubscribeState {
  final SubscribeStatus status;
  final String? message;
  final Set<String> selectedPreferences;

  const SubscribeState({
    this.status = SubscribeStatus.idle,
    this.message,
    this.selectedPreferences = const {},
  });
}

class SubscribeNotifier extends StateNotifier<SubscribeState> {
  final SubscriberRepository _repository;

  SubscribeNotifier(this._repository) : super(const SubscribeState());

  void togglePreference(String category) {
    final current = Set<String>.from(state.selectedPreferences);
    if (current.contains(category)) {
      current.remove(category);
    } else {
      current.add(category);
    }
    state = SubscribeState(selectedPreferences: current);
  }

  Future<void> subscribe({required String email, String? phone}) async {
    state = SubscribeState(
      status: SubscribeStatus.loading,
      selectedPreferences: state.selectedPreferences,
    );

    try {
      final result = await _repository.subscribe(
        email: email,
        phone: phone,
        preferences: state.selectedPreferences.toList(),
      );

      state = SubscribeState(
        status: result.success ? SubscribeStatus.success : SubscribeStatus.error,
        message: result.message,
        selectedPreferences: state.selectedPreferences,
      );
    } catch (e) {
      state = SubscribeState(
        status: SubscribeStatus.error,
        message: 'Erro de conexão. Tente novamente.',
        selectedPreferences: state.selectedPreferences,
      );
    }
  }
}

final subscribeProvider = StateNotifierProvider<SubscribeNotifier, SubscribeState>((ref) {
  return SubscribeNotifier(ref.read(subscriberRepositoryProvider));
});
```

---

## Componentes de UI

### Preference Chips (Multi-Select)

```dart
class PreferenceChips extends ConsumerWidget {
  static const categories = ['💻 DEV', '🤖 IA', '🛡️ Segurança', '🚀 Startups', '☁️ Cloud'];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(subscribeProvider).selectedPreferences;

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: categories.map((cat) {
        final isSelected = selected.contains(cat);
        return GestureDetector(
          onTap: () => ref.read(subscribeProvider.notifier).togglePreference(cat),
          child: AnimatedContainer(
            duration: Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? Theme.of(context).colorScheme.primary.withOpacity(0.2) : Colors.white.withOpacity(0.03),
              border: Border.all(
                color: isSelected ? Theme.of(context).colorScheme.primary : Colors.white.withOpacity(0.1),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Text(
              cat,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
                color: isSelected ? Theme.of(context).colorScheme.primary : Colors.white.withOpacity(0.5),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
```

### Success Feedback

Ao ter sucesso, mostrar animação de checkmark com mensagem:

```dart
AnimatedSwitcher(
  duration: Duration(milliseconds: 500),
  child: state.status == SubscribeStatus.success
    ? Column(
        children: [
          Icon(LucideIcons.checkCircle, color: Colors.green, size: 48),
          SizedBox(height: 16),
          Text(state.message!, style: TextStyle(color: Colors.green, fontWeight: FontWeight.w900)),
        ],
      )
    : SizedBox.shrink(),
)
```

---

## Entregável Esperado

1. **subscribe_screen.dart** — Tela completa (pode ser usada standalone ou dentro da Home)
2. **subscribe_form.dart** — Formulário com validação
3. **preference_chips.dart** — Widget de multi-select de categorias
4. **subscribe_controller.dart** — Notifier Riverpod
