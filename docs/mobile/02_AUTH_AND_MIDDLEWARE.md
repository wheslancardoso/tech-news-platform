# 02 — Auth & Middleware // Fresh News Mobile

> **Destinatário**: Membro 1 (Líder / Fundação)
> **Objetivo**: Implementar o fluxo de autenticação admin e route guards no Flutter.
> **Pré-requisito**: `00_FLUTTER_ARCHITECTURE.md` e `01_DATABASE_AND_MODELS.md` executados.

---

## Como Funciona a Auth no Projeto Web

O Fresh News **NÃO usa Supabase Auth** para o admin. O login é simplificado:

1. Usuário acessa `/login` e digita uma **senha fixa** definida via env `ADMIN_PASSWORD`.
2. Se a senha bater, um **cookie `admin_session`** é criado com valor `"true"` e validade de 7 dias.
3. O middleware do Next.js verifica esse cookie em todas as rotas `/admin/*`.
4. O logout simplesmente deleta o cookie.

### Lógica Original (TypeScript)

```typescript
// actions/auth.ts
export async function login(formData: FormData) {
  const password = formData.get('password') as string
  const adminPassword = process.env.ADMIN_PASSWORD

  if (password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    redirect('/admin/posts')
  }
  redirect('/login?error=invalid_password')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}
```

---

## Implementação Mobile (Flutter)

### Estratégia

No mobile, não temos cookies. Vamos usar **SharedPreferences** para persistir a sessão admin localmente.

A senha admin é verificada via uma **API Route** customizada que já existe no projeto:

```
POST /api/login
Body: { "password": "..." }
Response: { "success": true } ou { "success": false, "error": "invalid_password" }
```

### Auth State

```dart
// features/auth/domain/auth_state.dart

enum AuthStatus { unauthenticated, authenticated, loading }

class AuthState {
  final AuthStatus status;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.unauthenticated,
    this.errorMessage,
  });

  bool get isAdmin => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;

  AuthState copyWith({AuthStatus? status, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      errorMessage: errorMessage,
    );
  }
}
```

### Auth Notifier (Riverpod)

```dart
// features/auth/application/auth_notifier.dart

class AuthNotifier extends StateNotifier<AuthState> {
  final SharedPreferences _prefs;
  final Dio _dio;

  AuthNotifier(this._prefs, this._dio) : super(const AuthState()) {
    _loadSession();
  }

  static const _sessionKey = 'admin_session';
  static const _sessionExpiryKey = 'admin_session_expiry';

  /// Carrega sessão salva ao inicializar
  void _loadSession() {
    final session = _prefs.getBool(_sessionKey) ?? false;
    final expiryStr = _prefs.getString(_sessionExpiryKey);

    if (session && expiryStr != null) {
      final expiry = DateTime.parse(expiryStr);
      if (DateTime.now().isBefore(expiry)) {
        state = const AuthState(status: AuthStatus.authenticated);
        return;
      }
    }

    // Sessão expirada ou inexistente
    _prefs.remove(_sessionKey);
    _prefs.remove(_sessionExpiryKey);
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  /// Login via API
  Future<bool> login(String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);

    try {
      final response = await _dio.post(
        '/api/login',
        data: {'password': password},
      );

      if (response.data['success'] == true) {
        // Salvar sessão (7 dias)
        final expiry = DateTime.now().add(const Duration(days: 7));
        await _prefs.setBool(_sessionKey, true);
        await _prefs.setString(_sessionExpiryKey, expiry.toIso8601String());

        state = const AuthState(status: AuthStatus.authenticated);
        return true;
      } else {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Senha incorreta',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: 'Erro de conexão. Tente novamente.',
      );
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    await _prefs.remove(_sessionKey);
    await _prefs.remove(_sessionExpiryKey);
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

// Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  final dio = ref.read(dioProvider);
  return AuthNotifier(prefs, dio);
});
```

### Route Guard no GoRouter

```dart
// app/router.dart

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    routes: [
      // Rotas públicas
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/archive', builder: (_, __) => const ArchiveScreen()),
      GoRoute(path: '/archive/:id', builder: (_, state) => NewsletterDetailScreen(id: state.pathParameters['id']!)),
      GoRoute(path: '/post/:id', builder: (_, state) => PostDetailScreen(id: state.pathParameters['id']!)),
      GoRoute(path: '/about', builder: (_, __) => const AboutScreen()),
      GoRoute(path: '/subscribe', builder: (_, __) => const SubscribeScreen()),
      GoRoute(path: '/unsubscribe', builder: (_, state) => UnsubscribeScreen(token: state.uri.queryParameters['token'])),
      GoRoute(path: '/preferences/:id', builder: (_, state) => PreferencesScreen(subscriberId: state.pathParameters['id']!)),

      // Login
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
        redirect: (_, __) {
          if (auth.isAdmin) return '/admin/posts';
          return null;
        },
      ),

      // Rotas protegidas (Admin)
      ShellRoute(
        builder: (_, __, child) => AdminShell(child: child),
        routes: [
          GoRoute(path: '/admin/posts', builder: (_, __) => const AdminPostsScreen()),
          GoRoute(path: '/admin/newsletters', builder: (_, __) => const AdminNewslettersScreen()),
        ],
        redirect: (_, __) {
          if (!auth.isAdmin) return '/login';
          return null;
        },
      ),
    ],
  );
});
```

---

## Tela de Login

### Design Visual (baseado na web)

A tela de login é minimalista e centralizada:

- **Fundo**: Background escuro com glow blur de cor primária
- **Container**: Glass card com `borderRadius: 56px` (3.5rem)
- **Ícone**: Lock centralizado dentro de um glass card 64x64
- **Título**: "ÁREA RESTRITA" em bold italic uppercase
- **Subtítulo**: "Apenas para editores autorizados." em label minúsculo
- **Input**: Campo de senha centralizado, fundo glass, `borderRadius: 32px`
- **Erro**: Texto vermelho "Acesso Negado: Senha Incorreta" abaixo do input
- **Botão**: Primário full-width, rounded, "ACESSAR_PAINEL"
- **Footer**: "Binary BroadSheet // Security Layer"

### Implementação Sugerida

```dart
// features/auth/presentation/login_screen.dart

class LoginScreen extends ConsumerStatefulWidget { /* ... */ }

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    
    final success = await ref
        .read(authProvider.notifier)
        .login(_passwordController.text);

    setState(() => _isLoading = false);

    if (success && mounted) {
      context.go('/admin/posts');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: GlassCard(
            borderRadius: 56,
            padding: const EdgeInsets.all(48),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Ícone Lock
                GlassCard(
                  borderRadius: 16,
                  padding: const EdgeInsets.all(16),
                  child: Icon(LucideIcons.lock, size: 32, color: Theme.of(context).colorScheme.primary),
                ),
                const SizedBox(height: 32),

                // Título
                Text(
                  'ÁREA RESTRITA',
                  style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'APENAS PARA EDITORES AUTORIZADOS.',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    letterSpacing: 3,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
                  ),
                ),
                const SizedBox(height: 48),

                // Input de senha
                FNInput(
                  controller: _passwordController,
                  obscureText: true,
                  textAlign: TextAlign.center,
                  hint: 'Senha de acesso',
                ),

                // Erro
                if (authState.errorMessage != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'ACESSO NEGADO: ${authState.errorMessage!.toUpperCase()}',
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                    ),
                  ),
                ],

                const SizedBox(height: 32),

                // Botão
                FNButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  isLoading: _isLoading,
                  label: 'ACESSAR_PAINEL',
                  fullWidth: true,
                ),
                
                const SizedBox(height: 48),
                Text(
                  'Binary BroadSheet // Security Layer',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    letterSpacing: 5,
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.15),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## Entregável Esperado

1. **auth_state.dart** com AuthStatus enum e AuthState
2. **auth_notifier.dart** com login/logout via API + SharedPreferences
3. **login_screen.dart** com design glassmorphism completo
4. **router.dart** atualizado com redirect guards nas rotas admin
5. **Provider** de SharedPreferences inicializado no main.dart

> **ATENÇÃO**: A variável de ambiente `NEXT_PUBLIC_APP_URL` do web será mapeada para uma constante `baseApiUrl` no mobile que aponta para o servidor Next.js rodando (ou em produção). Configure como constante em `core/constants/app_constants.dart`.
