# 09 — Design System // Fresh News Mobile

> **Destinatário**: Membro 1 (Líder / Fundação)
> **Objetivo**: Implementar o design system completo em Flutter com todos os tokens, componentes base e utilitários visuais.
> **Pré-requisito**: Módulo 00 executado.

---

## Design Tokens (Extraídos do CSS Web)

### Paleta de Cores

```dart
// core/theme/fn_colors.dart

class FNColors {
  // === Base (Dark Theme) ===
  static const background     = Color(0xFF0A0A0B);       // hsl(240, 10%, 3.9%)
  static const surface        = Color(0xFF111113);       // Um tom acima do bg
  static const card           = Color(0xFF141416);       // Card bg
  static const foreground     = Color(0xFFFAFAFA);       // Branco quase puro
  static const mutedForeground = Color(0xFFA1A1AA);      // Cinza zinc-400

  // === Primária (Default TECH) ===
  static const primaryViolet  = Color(0xFF8B5CF6);       // hsl(275, 80%, 55%)
  static const primaryGreen   = Color(0xFF22C55E);       // TECH world
  static const primaryYellow  = Color(0xFFEAB308);       // MUSIC world
  static const primaryAmber   = Color(0xFFF59E0B);       // GEAR world
  static const primaryPurple  = Color(0xFFA855F7);       // GAME world

  // === Glass (Glassmorphism) ===
  static Color glassBg        = Colors.white.withOpacity(0.03);
  static Color glassBorder    = Colors.white.withOpacity(0.08);
  static const double glassBlur = 24.0;

  // === Semânticas ===
  static const success        = Color(0xFF10B981);       // Emerald
  static const error          = Color(0xFFEF4444);       // Red
  static const warning        = Color(0xFFF59E0B);       // Amber
  static const info           = Color(0xFF3B82F6);       // Blue

  // === Categorias ===
  static const catIA          = Color(0xFFA78BFA);       // Lavender
  static const catDev         = Color(0xFF10B981);       // Emerald
  static const catSec         = Color(0xFFF43F5E);       // Rose
  static const catStartup     = Color(0xFFF59E0B);       // Amber
  static const catDefault     = Color(0xFF8B5CF6);       // Violet

  // === Hacker Mode (CRT) ===
  static const hackerGreen    = Color(0xFF3DF13D);       // Fósforo verde
  static const hackerBg       = Color(0xFF0A0A0A);       // Preto absoluto
}
```

### Tipografia

```dart
// core/theme/fn_typography.dart

import 'package:google_fonts/google_fonts.dart';

class FNTypography {
  // === Font Families ===
  static TextStyle get body => GoogleFonts.inter();
  static TextStyle get heading => GoogleFonts.outfit();
  static TextStyle get mono => GoogleFonts.jetBrainsMono();

  // === Text Styles ===
  
  // Headlines (Outfit)
  static TextStyle h1 = GoogleFonts.outfit(
    fontSize: 48,
    fontWeight: FontWeight.w900,
    letterSpacing: -2,
    height: 0.85,
  );
  static TextStyle h2 = GoogleFonts.outfit(
    fontSize: 36,
    fontWeight: FontWeight.w900,
    letterSpacing: -1.5,
    height: 0.9,
  );
  static TextStyle h3 = GoogleFonts.outfit(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    letterSpacing: -1,
  );

  // Body (Inter)
  static TextStyle bodyLarge = GoogleFonts.inter(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    height: 1.6,
  );
  static TextStyle bodyMedium = GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
  static TextStyle bodySmall = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.4,
  );

  // Labels (Tech Label — estilo brutalista)
  static TextStyle techLabel = GoogleFonts.inter(
    fontSize: 10,
    fontWeight: FontWeight.w900,
    letterSpacing: 3,
    height: 1,
  );
  static TextStyle techLabelSmall = GoogleFonts.inter(
    fontSize: 9,
    fontWeight: FontWeight.w900,
    letterSpacing: 4,
    height: 1,
  );

  // Monospace (JetBrains Mono)
  static TextStyle code = GoogleFonts.jetBrainsMono(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.6,
  );
}
```

### Espaçamento

```dart
// core/theme/fn_spacing.dart

class FNSpacing {
  static const double xs   = 4;
  static const double sm   = 8;
  static const double md   = 12;
  static const double base = 16;
  static const double lg   = 24;
  static const double xl   = 32;
  static const double xxl  = 48;
  static const double xxxl = 64;

  // Padding padrão de página
  static const pagePadding = EdgeInsets.symmetric(horizontal: 24);
  static const sectionPadding = EdgeInsets.symmetric(vertical: 48);
}
```

---

## ThemeData Principal

```dart
// core/theme/fn_theme.dart

class FNTheme {
  static ThemeData darkTheme({Color? primaryColor}) {
    final primary = primaryColor ?? FNColors.primaryViolet;

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: FNColors.background,
      colorScheme: ColorScheme.dark(
        primary: primary,
        secondary: primary.withOpacity(0.7),
        surface: FNColors.surface,
        onPrimary: Colors.white,
        onSurface: FNColors.foreground,
        error: FNColors.error,
      ),
      textTheme: TextTheme(
        displayLarge: FNTypography.h1.copyWith(color: FNColors.foreground),
        displayMedium: FNTypography.h2.copyWith(color: FNColors.foreground),
        displaySmall: FNTypography.h3.copyWith(color: FNColors.foreground),
        bodyLarge: FNTypography.bodyLarge.copyWith(color: FNColors.foreground),
        bodyMedium: FNTypography.bodyMedium.copyWith(color: FNColors.foreground),
        bodySmall: FNTypography.bodySmall.copyWith(color: FNColors.mutedForeground),
        labelSmall: FNTypography.techLabel.copyWith(color: FNColors.mutedForeground),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: FNTypography.h3.copyWith(
          color: FNColors.foreground,
          fontStyle: FontStyle.italic,
        ),
      ),
      cardTheme: CardThemeData(
        color: FNColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero, // Brutalista
          side: BorderSide(color: FNColors.glassBorder),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: FNColors.glassBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primary.withOpacity(0.5), width: 2),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        hintStyle: FNTypography.bodyMedium.copyWith(
          color: FNColors.mutedForeground.withOpacity(0.3),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: FNColors.glassBorder,
        thickness: 1,
      ),
    );
  }
}
```

---

## Widgets Base

### 1. GlassCard

O componente mais usado. Simula glassmorphism com backdrop blur.

```dart
// shared/widgets/glass_card.dart

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final Color? borderColor;
  final double? blur;

  const GlassCard({
    required this.child,
    this.padding,
    this.borderRadius = 0, // Brutalista por padrão
    this.borderColor,
    this.blur,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(
          sigmaX: blur ?? FNColors.glassBlur,
          sigmaY: blur ?? FNColors.glassBlur,
        ),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: FNColors.glassBg,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: borderColor ?? FNColors.glassBorder,
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
```

### 2. FNButton

```dart
// shared/widgets/fn_button.dart

enum FNButtonVariant { primary, outline, ghost, destructive }

class FNButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final FNButtonVariant variant;
  final bool isLoading;
  final bool fullWidth;
  final Color? color;

  const FNButton({
    required this.label,
    this.onPressed,
    this.icon,
    this.variant = FNButtonVariant.primary,
    this.isLoading = false,
    this.fullWidth = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final primary = color ?? Theme.of(context).colorScheme.primary;

    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: 56,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: variant == FNButtonVariant.primary ? primary : Colors.transparent,
          foregroundColor: variant == FNButtonVariant.primary ? Colors.white : primary,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.zero, // Brutalista
            side: variant == FNButtonVariant.outline
                ? BorderSide(color: primary.withOpacity(0.3), width: 2)
                : BorderSide.none,
          ),
          padding: EdgeInsets.symmetric(horizontal: 32),
        ),
        child: isLoading
            ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Row(
                mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[Icon(icon, size: 16), SizedBox(width: 8)],
                  Text(
                    label,
                    style: FNTypography.techLabel.copyWith(
                      color: variant == FNButtonVariant.primary ? Colors.white : primary,
                      letterSpacing: 4,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
```

### 3. FNBadge

```dart
// shared/widgets/fn_badge.dart

enum BadgeVariant { primary, outline, success, destructive }

class FNBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final Color? color;

  const FNBadge({required this.label, this.variant = BadgeVariant.outline, this.color});

  @override
  Widget build(BuildContext context) {
    final primary = color ?? Theme.of(context).colorScheme.primary;

    Color bgColor, textColor, borderColor;
    switch (variant) {
      case BadgeVariant.primary:
        bgColor = primary; textColor = Colors.white; borderColor = primary;
      case BadgeVariant.outline:
        bgColor = Colors.transparent; textColor = FNColors.mutedForeground; borderColor = FNColors.glassBorder;
      case BadgeVariant.success:
        bgColor = FNColors.success.withOpacity(0.1); textColor = FNColors.success; borderColor = FNColors.success.withOpacity(0.3);
      case BadgeVariant.destructive:
        bgColor = FNColors.error.withOpacity(0.1); textColor = FNColors.error; borderColor = FNColors.error.withOpacity(0.3);
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        border: Border.all(color: borderColor),
        // Sem border radius (brutalista)
      ),
      child: Text(
        label.toUpperCase(),
        style: FNTypography.techLabelSmall.copyWith(color: textColor),
      ),
    );
  }
}
```

### 4. NewsCard (Shared)

Card reutilizável para exibir newsletters em grids.

```dart
// shared/widgets/news_card.dart

class NewsCard extends StatelessWidget {
  final String id;
  final int edition;
  final String title;
  final DateTime date;
  final String? intro;
  final String status;
  final bool isAdmin;
  final String? imageUrl;

  const NewsCard({
    required this.id,
    required this.edition,
    required this.title,
    required this.date,
    this.intro,
    this.status = 'published',
    this.isAdmin = false,
    this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/archive/$id'),
      child: GlassCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagem de capa
            if (imageUrl != null)
              ClipRRect(
                child: CachedNetworkImage(
                  imageUrl: imageUrl!,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Shimmer(...),
                  errorWidget: (_, __, ___) => Container(
                    height: 180,
                    color: FNColors.surface,
                    child: Center(child: Icon(LucideIcons.image, color: FNColors.mutedForeground)),
                  ),
                ),
              )
            else
              Container(
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary.withOpacity(0.2),
                      FNColors.surface,
                    ],
                  ),
                ),
                child: Center(
                  child: Text('FN', style: FNTypography.h2.copyWith(color: FNColors.mutedForeground.withOpacity(0.1))),
                ),
              ),

            Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badge + Data
                  Row(
                    children: [
                      FNBadge(label: 'EDIÇÃO #$edition', variant: BadgeVariant.primary),
                      Spacer(),
                      Text(
                        DateFormat('dd/MM/yyyy').format(date),
                        style: FNTypography.techLabelSmall.copyWith(color: FNColors.mutedForeground.withOpacity(0.4)),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),

                  // Título
                  Text(
                    title,
                    style: FNTypography.h3.copyWith(
                      fontSize: 20,
                      fontStyle: FontStyle.italic,
                      color: FNColors.foreground,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  // Intro
                  if (intro != null) ...[
                    SizedBox(height: 8),
                    Text(
                      intro!,
                      style: FNTypography.bodySmall.copyWith(color: FNColors.mutedForeground),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // Status (admin)
                  if (isAdmin) ...[
                    SizedBox(height: 12),
                    FNBadge(
                      label: status,
                      variant: status == 'published' ? BadgeVariant.success : BadgeVariant.outline,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 5. FNInput

```dart
// shared/widgets/fn_input.dart

class FNInput extends StatelessWidget {
  final TextEditingController? controller;
  final String? hint;
  final bool obscureText;
  final TextAlign textAlign;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;

  const FNInput({
    this.controller,
    this.hint,
    this.obscureText = false,
    this.textAlign = TextAlign.start,
    this.validator,
    this.keyboardType,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      textAlign: textAlign,
      validator: validator,
      keyboardType: keyboardType,
      style: FNTypography.bodyMedium.copyWith(color: FNColors.foreground),
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 18) : null,
      ),
    );
  }
}
```

### 6. Glass Navigation Bar

```dart
// shared/widgets/glass_nav_bar.dart

class GlassNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const GlassNavBar({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            border: Border(top: BorderSide(color: FNColors.glassBorder)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(icon: LucideIcons.home, label: 'Home', isActive: currentIndex == 0, onTap: () => onTap(0)),
              _NavItem(icon: LucideIcons.archive, label: 'Arquivo', isActive: currentIndex == 1, onTap: () => onTap(1)),
              _NavItem(icon: LucideIcons.info, label: 'Sobre', isActive: currentIndex == 2, onTap: () => onTap(2)),
              _NavItem(icon: LucideIcons.settings, label: 'Admin', isActive: currentIndex == 3, onTap: () => onTap(3)),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## Animações Base

Usar o pacote `flutter_animate` para micro-animações consistentes:

```dart
// Utilitários de animação
extension FNAnimations on Widget {
  Widget fadeInUp({int delay = 0}) => animate()
      .fadeIn(delay: Duration(milliseconds: delay), duration: Duration(milliseconds: 500))
      .slideY(begin: 0.1, end: 0, delay: Duration(milliseconds: delay));

  Widget fadeInLeft({int delay = 0}) => animate()
      .fadeIn(delay: Duration(milliseconds: delay), duration: Duration(milliseconds: 400))
      .slideX(begin: -0.1, end: 0, delay: Duration(milliseconds: delay));
}
```

---

## Entregável Esperado

1. **fn_colors.dart** — Paleta completa
2. **fn_typography.dart** — Text styles com Google Fonts
3. **fn_spacing.dart** — Constantes de espaçamento
4. **fn_theme.dart** — ThemeData factory
5. **glass_card.dart** — Componente glassmorphism
6. **fn_button.dart** — Botão com variantes
7. **fn_badge.dart** — Badge com variantes
8. **fn_input.dart** — Input estilizado
9. **news_card.dart** — Card de newsletter
10. **glass_nav_bar.dart** — Bottom navigation glassmorphism
