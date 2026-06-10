# 08 — World Selector // Fresh News Mobile

> **Destinatário**: Membro 1 (Líder / Fundação)
> **Objetivo**: Implementar o seletor de mundos do Multiverso com persistência local.
> **Pré-requisito**: Módulo 00 executado.

---

## Conceito do Multiverso

O Fresh News opera em **4 mundos** que alteram completamente a experiência: cores, conteúdo, categorias e personalidade editorial.

### Mundos e Configurações

| Mundo | Ícone | Cor Primária (HSL) | Hex | Subtítulo |
|---|---|---|---|---|
| TECH | 💻 | hsl(142, 71%, 45%) | #22c55e | CÓDIGO & IA |
| MUSIC | 🎵 | hsl(48, 96%, 53%) | #eab308 | BEATS & NOISE |
| GEAR | ⚙️ | hsl(38, 92%, 50%) | #f59e0b | RPM & GADGETS |
| GAME | 🎮 | hsl(270, 95%, 60%) | #a855f7 | ARCADE & PIXEL |

### Categorias por Mundo (do newsletter.ts)

```dart
const worldCategories = {
  'TECH': ['💻 DEV', '🤖 IA', '🛡️ SEGURANÇA', '🚀 STARTUPS', '☁️ CLOUD'],
  'MUSIC': ['🎤 ARTISTAS', '🎧 PRODUÇÃO', '🎵 INDIE', '🏆 CHARTS', '📀 LANÇAMENTOS'],
  'GEAR': ['🚗 AUTOMOTIVO', '📱 GADGETS', '⌚ WEARABLES', '🔧 DIY', '💡 INOVAÇÃO'],
  'GAME': ['🎮 PC', '🕹️ CONSOLE', '📱 MOBILE', '🏆 ESPORTS', '🎲 INDIE'],
};
```

---

## Comportamento Web Original

No web, o mundo é armazenado em um **cookie `active_world`** com validade de 1 ano:

```typescript
// actions/world.ts
export async function setActiveWorld(formData: FormData) {
  const world = formData.get('world') as string
  const cookieStore = await cookies()
  cookieStore.set('active_world', world, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  redirect('/')
}
```

---

## Implementação Mobile

### Persistência via SharedPreferences

```dart
// core/providers/world_provider.dart

enum World { tech, music, gear, game }

extension WorldExt on World {
  String get label => name.toUpperCase();
  String get icon {
    switch (this) {
      case World.tech: return '💻';
      case World.music: return '🎵';
      case World.gear: return '⚙️';
      case World.game: return '🎮';
    }
  }
  String get subtitle {
    switch (this) {
      case World.tech: return 'CÓDIGO & IA';
      case World.music: return 'BEATS & NOISE';
      case World.gear: return 'RPM & GADGETS';
      case World.game: return 'ARCADE & PIXEL';
    }
  }
  Color get primaryColor {
    switch (this) {
      case World.tech: return Color(0xFF22c55e);
      case World.music: return Color(0xFFeab308);
      case World.gear: return Color(0xFFf59e0b);
      case World.game: return Color(0xFFa855f7);
    }
  }
  List<String> get categories {
    switch (this) {
      case World.tech: return ['💻 DEV', '🤖 IA', '🛡️ SEGURANÇA', '🚀 STARTUPS', '☁️ CLOUD'];
      case World.music: return ['🎤 ARTISTAS', '🎧 PRODUÇÃO', '🎵 INDIE', '🏆 CHARTS', '📀 LANÇAMENTOS'];
      case World.gear: return ['🚗 AUTOMOTIVO', '📱 GADGETS', '⌚ WEARABLES', '🔧 DIY', '💡 INOVAÇÃO'];
      case World.game: return ['🎮 PC', '🕹️ CONSOLE', '📱 MOBILE', '🏆 ESPORTS', '🎲 INDIE'];
    }
  }
}

class WorldNotifier extends StateNotifier<World> {
  static const _key = 'active_world';
  final SharedPreferences _prefs;

  WorldNotifier(this._prefs) : super(World.tech) {
    _load();
  }

  void _load() {
    final saved = _prefs.getString(_key);
    if (saved != null) {
      state = World.values.firstWhere(
        (w) => w.name.toUpperCase() == saved,
        orElse: () => World.tech,
      );
    }
  }

  Future<void> setWorld(World world) async {
    state = world;
    await _prefs.setString(_key, world.name.toUpperCase());
  }
}

final activeWorldProvider = StateNotifierProvider<WorldNotifier, World>((ref) {
  return WorldNotifier(ref.read(sharedPreferencesProvider));
});
```

### Widget: WorldSelector

```dart
// features/world_selector/presentation/world_selector_widget.dart

class WorldSelector extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeWorld = ref.watch(activeWorldProvider);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: World.values.map((world) {
          final isActive = world == activeWorld;
          return Padding(
            padding: EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => ref.read(activeWorldProvider.notifier).setWorld(world),
              child: AnimatedContainer(
                duration: Duration(milliseconds: 300),
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: isActive ? world.primaryColor.withOpacity(0.15) : Colors.white.withOpacity(0.03),
                  border: Border.all(
                    color: isActive ? world.primaryColor : Colors.white.withOpacity(0.08),
                    width: isActive ? 2 : 1,
                  ),
                  // Sem border radius (brutalista)
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(world.icon, style: TextStyle(fontSize: 16)),
                    SizedBox(width: 8),
                    Text(
                      world.label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        color: isActive ? world.primaryColor : Colors.white.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
```

### Efeito Global da Troca de Mundo

Quando o mundo muda, **todos os providers reativos** que dependem de `activeWorldProvider` são invalidados automaticamente pelo Riverpod e refazem suas queries.

Isso inclui:
- `publishedNewslettersProvider` (Home)
- `affinityPostsProvider` (Archive)
- `archivedNewslettersProvider` (Archive)

A **cor primária do tema** também deve reagir à troca de mundo:

```dart
// Em app.dart ou fn_theme.dart
final dynamicThemeProvider = Provider<ThemeData>((ref) {
  final world = ref.watch(activeWorldProvider);
  final hackerMode = ref.watch(hackerModeProvider);
  
  if (hackerMode) return FNTheme.hackerTheme();
  
  return FNTheme.darkTheme(primaryColor: world.primaryColor);
});
```

---

## Entregável Esperado

1. **World enum** com extension completa em `core/constants/worlds.dart`
2. **WorldNotifier** com persistência SharedPrefs
3. **WorldSelector widget** com design brutalista
4. **Integração** com o tema dinâmico (fn_theme.dart deve aceitar `primaryColor` como parâmetro)
