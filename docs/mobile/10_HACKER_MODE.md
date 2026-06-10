# 10 — Hacker Mode // Fresh News Mobile

> **Destinatário**: Membro 3 (Admin & Integrações)
> **Objetivo**: Implementar o tema CRT "Hacker Mode" com visual de terminal retro.
> **Pré-requisito**: Módulo 09 (Design System) executado.

---

## Comportamento Web Original

O web tem um botão `TerminalToggle` que ativa o "Hacker Mode":

- Toda a UI muda para um visual CRT verde fósforo (#3DF13D)
- Background preto absoluto
- Scanlines overlay animadas
- Efeito flicker sutil
- Tipografia 100% monospace
- Bordas e cards mudam para verde

### CSS do Hacker Mode (Web)

```css
body.hacker-mode {
  --background: 0 0% 2%;
  --foreground: 120 100% 60%;
  --primary: 120 100% 50%;

  font-family: 'Courier New', Courier, monospace !important;
}

body.hacker-mode * {
  border-radius: 0 !important;
  font-family: inherit !important;
  text-shadow: 0 0 8px hsl(120, 100%, 50%, 0.3);
}

body.hacker-mode .glass-card {
  background: rgba(0, 255, 0, 0.03);
  border-color: rgba(0, 255, 0, 0.15);
}

/* Scanlines overlay */
body.hacker-mode::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 9999;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { background-position: 0 0; }
  100% { background-position: 0 100vh; }
}
```

---

## Implementação Flutter

### Hacker Theme Data

```dart
// core/theme/hacker_mode_theme.dart

class HackerTheme {
  static const _green = Color(0xFF3DF13D);  // Fósforo verde
  static const _darkGreen = Color(0xFF00AA00);
  static const _bg = Color(0xFF050505);      // Preto quase absoluto
  static const _dimGreen = Color(0xFF0D3D0D);

  static ThemeData theme() {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: _bg,
      colorScheme: ColorScheme.dark(
        primary: _green,
        secondary: _darkGreen,
        surface: _bg,
        onPrimary: Colors.black,
        onSurface: _green,
        error: Color(0xFFFF3333),
      ),
      textTheme: TextTheme(
        displayLarge: _monoStyle(48, FontWeight.w900),
        displayMedium: _monoStyle(36, FontWeight.w900),
        displaySmall: _monoStyle(28, FontWeight.w800),
        bodyLarge: _monoStyle(18, FontWeight.w500),
        bodyMedium: _monoStyle(16, FontWeight.w400),
        bodySmall: _monoStyle(14, FontWeight.w400, color: _green.withOpacity(0.6)),
        labelSmall: _monoStyle(10, FontWeight.w900, letterSpacing: 3),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: _monoStyle(20, FontWeight.w900),
      ),
      cardTheme: CardThemeData(
        color: _green.withOpacity(0.03),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
          side: BorderSide(color: _green.withOpacity(0.15)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: _green.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: _green.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: _green, width: 2),
        ),
        hintStyle: _monoStyle(14, FontWeight.w400, color: _green.withOpacity(0.3)),
      ),
      dividerTheme: DividerThemeData(
        color: _green.withOpacity(0.15),
        thickness: 1,
      ),
    );
  }

  static TextStyle _monoStyle(double size, FontWeight weight, {Color? color, double letterSpacing = 0}) {
    return GoogleFonts.jetBrainsMono(
      fontSize: size,
      fontWeight: weight,
      color: color ?? _green,
      letterSpacing: letterSpacing,
      shadows: [
        Shadow(color: _green.withOpacity(0.3), blurRadius: 8),
      ],
    );
  }
}
```

### Scanlines Overlay Widget

```dart
// shared/widgets/scanlines_overlay.dart

class ScanlinesOverlay extends StatelessWidget {
  final double opacity;

  const ScanlinesOverlay({this.opacity = 0.08});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        // Animação de scroll vertical das scanlines (8s loop)
        child: CustomPaint(
          painter: _ScanlinesPainter(opacity: opacity),
          size: Size.infinite,
        ),
      ),
    );
  }
}

class _ScanlinesPainter extends CustomPainter {
  final double opacity;
  _ScanlinesPainter({required this.opacity});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withOpacity(opacity);
    
    for (double y = 0; y < size.height; y += 3) {
      canvas.drawRect(
        Rect.fromLTWH(0, y, size.width, 1),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

### Flicker Effect

Efeito sutil de cintilação CRT:

```dart
// shared/widgets/crt_flicker.dart

class CRTFlicker extends StatefulWidget {
  final Widget child;
  const CRTFlicker({required this.child});

  @override
  State<CRTFlicker> createState() => _CRTFlickerState();
}

class _CRTFlickerState extends State<CRTFlicker> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 100),
    )..repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, child) => Opacity(
        opacity: 0.97 + (_controller.value * 0.03), // Oscila entre 0.97 e 1.0
        child: child,
      ),
      child: widget.child,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### Toggle Provider

```dart
// core/providers/theme_provider.dart

class HackerModeNotifier extends StateNotifier<bool> {
  final SharedPreferences _prefs;
  static const _key = 'hacker_mode';

  HackerModeNotifier(this._prefs) : super(false) {
    state = _prefs.getBool(_key) ?? false;
  }

  Future<void> toggle() async {
    state = !state;
    await _prefs.setBool(_key, state);
  }
}

final hackerModeProvider = StateNotifierProvider<HackerModeNotifier, bool>((ref) {
  return HackerModeNotifier(ref.read(sharedPreferencesProvider));
});
```

### Toggle Widget

```dart
// shared/widgets/hacker_toggle.dart

class HackerToggle extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isHacker = ref.watch(hackerModeProvider);

    return GestureDetector(
      onTap: () => ref.read(hackerModeProvider.notifier).toggle(),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 300),
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isHacker ? Color(0xFF3DF13D).withOpacity(0.15) : Colors.white.withOpacity(0.03),
          border: Border.all(
            color: isHacker ? Color(0xFF3DF13D) : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              LucideIcons.terminal,
              size: 14,
              color: isHacker ? Color(0xFF3DF13D) : Colors.white.withOpacity(0.4),
            ),
            SizedBox(width: 6),
            Text(
              isHacker ? 'CRT_ON' : 'CRT_OFF',
              style: FNTypography.techLabelSmall.copyWith(
                color: isHacker ? Color(0xFF3DF13D) : Colors.white.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Integração com App Theme

No `app.dart`, o tema principal reage ao hacker mode:

```dart
final appThemeProvider = Provider<ThemeData>((ref) {
  final isHacker = ref.watch(hackerModeProvider);
  
  if (isHacker) return HackerTheme.theme();
  
  final world = ref.watch(activeWorldProvider);
  return FNTheme.darkTheme(primaryColor: world.primaryColor);
});

// Em app.dart
MaterialApp.router(
  theme: ref.watch(appThemeProvider),
  // ...
)
```

Quando o hacker mode está ativo, o `ScanlinesOverlay` e `CRTFlicker` são adicionados como overlays no Scaffold principal:

```dart
Stack(
  children: [
    child, // Conteúdo da tela
    if (isHacker) ...[
      ScanlinesOverlay(),
      CRTFlicker(child: SizedBox.shrink()), // Flicker global sutil
    ],
  ],
)
```

---

## Entregável Esperado

1. **hacker_mode_theme.dart** — ThemeData completo CRT
2. **scanlines_overlay.dart** — Widget de scanlines animadas
3. **crt_flicker.dart** — Widget de cintilação
4. **hacker_toggle.dart** — Botão toggle CRT_ON/CRT_OFF
5. **Integração** com `appThemeProvider` para troca reativa
