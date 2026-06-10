# 00 — Arquitetura Flutter // Fresh News Mobile

> **Destinatário**: Membro 1 (Líder / Fundação)
> **Objetivo**: Criar a estrutura base do projeto Flutter que todos os outros módulos vão importar.

---

## Stack Tecnológico

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework | Flutter | 3.22+ |
| Linguagem | Dart | 3.4+ |
| Estado | Riverpod (flutter_riverpod + riverpod_annotation) | ^2.5 |
| Navegação | GoRouter | ^14.0 |
| Backend | Supabase (supabase_flutter) | ^2.7 |
| HTTP | Dio | ^5.7 |
| Storage Local | SharedPreferences | ^2.3 |
| Fontes | google_fonts | ^6.2 |
| Ícones | lucide_icons | ^0.400 |
| Imagens | cached_network_image | ^3.4 |
| Notificações | firebase_messaging + flutter_local_notifications | Últimas estáveis |
| Formatação de Data | intl | ^0.19 |
| Animações | flutter_animate | ^4.5 |
| Blur/Glass | dart:ui (BackdropFilter nativo) | — |

---

## Estrutura de Pastas (Feature-First + Clean Architecture)

```
lib/
├── main.dart                         ← Entry point + inicialização Supabase + Firebase
├── app/
│   ├── app.dart                      ← ProviderScope + MaterialApp.router
│   └── router.dart                   ← GoRouter com route guards (admin, auth)
│
├── core/
│   ├── theme/
│   │   ├── fn_theme.dart             ← ThemeData principal (dark-first)
│   │   ├── fn_colors.dart            ← Paleta de cores com suporte a mundos
│   │   ├── fn_typography.dart        ← TextStyles (Inter body, Outfit heading, monospace)
│   │   ├── fn_spacing.dart           ← Constantes de espaçamento (4, 8, 12, 16, 24, 32, 48)
│   │   └── hacker_mode_theme.dart    ← Tema CRT override completo
│   ├── constants/
│   │   ├── worlds.dart               ← Enum World { tech, music, gear, game } + configs
│   │   ├── categories.dart           ← Mapa de categorias por mundo
│   │   └── app_constants.dart        ← URLs, timeouts, limites
│   ├── network/
│   │   ├── supabase_client.dart      ← Provider singleton do Supabase
│   │   └── dio_client.dart           ← Dio com interceptors (auth header, retry, logging)
│   ├── providers/
│   │   ├── theme_provider.dart       ← StateNotifier para tema ativo (normal vs hacker)
│   │   └── world_provider.dart       ← StateNotifier para mundo ativo (persistido em SharedPrefs)
│   └── utils/
│       ├── formatters.dart           ← Formatação de data pt-BR, truncamento de texto
│       └── validators.dart           ← Validação de email, phone
│
├── features/
│   ├── home/                         ← Prompt 03_HOME_SCREEN.md
│   ├── archive/                      ← Prompt 04_ARCHIVE_SCREEN.md
│   ├── newsletter_detail/            ← Prompt 05_NEWSLETTER_DETAIL.md
│   ├── post_detail/                  ← Prompt 06_POST_DETAIL.md
│   ├── subscribe/                    ← Prompt 07_SUBSCRIBE_FLOW.md
│   ├── auth/                         ← Prompt 02_AUTH_AND_MIDDLEWARE.md
│   ├── admin/                        ← Prompt 11_ADMIN_PANEL.md
│   ├── world_selector/               ← Prompt 08_WORLD_SELECTOR.md
│   ├── unsubscribe/                  ← Prompt 15_UNSUBSCRIBE_PREFS.md
│   └── preferences/                  ← Prompt 15_UNSUBSCRIBE_PREFS.md
│
├── shared/
│   ├── domain/
│   │   ├── newsletter.entity.dart    ← Newsletter model (imutável, com fromJson/toJson)
│   │   ├── post.entity.dart          ← Post model
│   │   ├── subscriber.entity.dart    ← Subscriber model
│   │   ├── user_click.entity.dart    ← UserClick model
│   │   ├── debate_message.entity.dart ← Mensagem do debate entre IAs
│   │   └── world.enum.dart           ← Enum dos mundos
│   ├── infrastructure/
│   │   ├── newsletter_repository.dart   ← CRUD newsletters via Supabase
│   │   ├── post_repository.dart         ← CRUD posts via Supabase
│   │   ├── subscriber_repository.dart   ← CRUD subscribers via Supabase
│   │   └── tracking_repository.dart     ← Insert user_clicks + update preferences
│   └── widgets/
│       ├── fn_button.dart               ← Botão primário estilizado
│       ├── fn_card.dart                 ← Card padrão com bordas
│       ├── glass_card.dart              ← Card glassmorphism (blur + transparência)
│       ├── fn_input.dart                ← Input estilizado brutalista
│       ├── fn_badge.dart                ← Badge de status (draft/published)
│       ├── news_card.dart               ← Card de newsletter reutilizável
│       ├── glass_nav_bar.dart           ← BottomNavigationBar com glass effect
│       ├── fn_separator.dart            ← Divisor com espaçamento padrão
│       └── loading_skeleton.dart        ← Skeleton loading animado
│
└── l10n/                               ← Internacionalização pt-BR (opcional, v2)
```

---

## Regras de Arquitetura

### Camadas (de cima para baixo)

```
presentation/  → Widgets, Screens, Controllers (Riverpod)
application/   → Use Cases / Notifiers (orquestração)
domain/        → Entities, Repository Interfaces
infrastructure/ → Implementações concretas (Supabase, Dio, Storage)
```

### Regras Invioláveis

1. **Widgets NUNCA acessam Supabase diretamente.** Sempre via repositório + provider.
2. **Entidades são imutáveis** (usar `@freezed` ou classes com `final` + `copyWith`).
3. **Repositórios expõem interfaces.** A implementação concreta é injetada via Riverpod.
4. **Um provider = uma responsabilidade.** Não criar "god providers".
5. **Nomenclatura**: `camelCase` para variáveis, `PascalCase` para classes, `snake_case` para arquivos Dart.

---

## Inicialização (main.dart)

```dart
// Pseudocódigo — o membro deve implementar:
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Inicializar Supabase
  await Supabase.initialize(
    url: 'SUA_SUPABASE_URL',
    anonKey: 'SUA_ANON_KEY',
  );
  
  // 2. Inicializar Firebase (se usar push notifications)
  // await Firebase.initializeApp();
  
  // 3. Carregar preferências locais (SharedPreferences)
  // await SharedPreferencesService.init();
  
  runApp(
    const ProviderScope(
      child: FreshNewsApp(),
    ),
  );
}
```

---

## Navegação (GoRouter)

### Rotas

| Path | Screen | Guard |
|---|---|---|
| `/` | HomeScreen | Nenhum |
| `/archive` | ArchiveScreen | Nenhum |
| `/archive/:id` | NewsletterDetailScreen | Nenhum |
| `/post/:id` | PostDetailScreen | Nenhum |
| `/about` | AboutScreen | Nenhum |
| `/login` | LoginScreen | Redireciona para /admin se já logado |
| `/subscribe` | SubscribeScreen | Nenhum |
| `/unsubscribe` | UnsubscribeScreen | Nenhum |
| `/preferences/:id` | PreferencesScreen | Nenhum |
| `/admin` | AdminShell | AdminGuard (verifica admin_session) |
| `/admin/posts` | AdminPostsScreen | AdminGuard |
| `/admin/newsletters` | AdminNewslettersScreen | AdminGuard |

### AdminGuard

```dart
// Redireciona para /login se não houver sessão admin salva localmente
redirect: (context, state) {
  final isAdmin = ref.read(authProvider).isAdmin;
  if (!isAdmin) return '/login';
  return null;
}
```

---

## Gerência de Estado (Riverpod)

### Providers Globais (core)

```dart
// Mundo ativo (persistido em SharedPreferences)
final activeWorldProvider = StateNotifierProvider<WorldNotifier, World>((ref) {
  return WorldNotifier(); // Carrega de SharedPrefs no init
});

// Tema ativo (normal vs hacker CRT)
final themeProvider = StateNotifierProvider<ThemeNotifier, FNThemeMode>((ref) {
  return ThemeNotifier(); // Carrega de SharedPrefs no init
});

// Sessão admin
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
```

### Providers por Feature (exemplos)

```dart
// Lista de newsletters publicadas do mundo ativo
final publishedNewslettersProvider = FutureProvider.autoDispose<List<Newsletter>>((ref) {
  final world = ref.watch(activeWorldProvider);
  return ref.read(newsletterRepositoryProvider).getPublished(world: world);
});

// Detalhe de uma newsletter
final newsletterDetailProvider = FutureProvider.autoDispose.family<Newsletter, String>((ref, id) {
  return ref.read(newsletterRepositoryProvider).getById(id);
});
```

---

## Responsividade

O app deve ser **mobile-first**, mas deve funcionar bem em tablets.

### Breakpoints

| Dispositivo | Largura | Layout |
|---|---|---|
| Phone | < 600dp | 1 coluna, bottom nav |
| Tablet Portrait | 600-900dp | 2 colunas, side nav |
| Tablet Landscape | > 900dp | 3 colunas, side nav |

### Implementação

```dart
// Usar LayoutBuilder ou MediaQuery
Widget build(BuildContext context) {
  final width = MediaQuery.of(context).size.width;
  final crossAxisCount = width < 600 ? 1 : width < 900 ? 2 : 3;
  // ...
}
```

---

## Dependências do pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.7.0
  flutter_riverpod: ^2.5.0
  go_router: ^14.0.0
  dio: ^5.7.0
  shared_preferences: ^2.3.0
  google_fonts: ^6.2.0
  lucide_icons: ^0.400.0
  cached_network_image: ^3.4.0
  intl: ^0.19.0
  flutter_animate: ^4.5.0
  shimmer: ^3.0.0
  url_launcher: ^6.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.0
  riverpod_generator: ^2.4.0
  riverpod_annotation: ^2.3.0
```

---

## Entregável Esperado

Ao finalizar este prompt, o membro deve entregar:

1. **Projeto Flutter criado** com `flutter create fresh_news_mobile`
2. **pubspec.yaml** completo com todas as dependências
3. **main.dart** com inicialização
4. **app.dart** com MaterialApp.router + ProviderScope
5. **router.dart** com todas as rotas (screens podem ser placeholders)
6. **core/theme/** com fn_theme.dart, fn_colors.dart, fn_typography.dart
7. **core/providers/** com world_provider.dart e theme_provider.dart
8. **core/network/supabase_client.dart** com provider singleton
9. **Todas as pastas** da estrutura criadas (mesmo que vazias)

> **ATENÇÃO**: NÃO implemente as telas. Apenas a estrutura, providers globais, tema e navegação. As telas serão implementadas pelos outros membros.
