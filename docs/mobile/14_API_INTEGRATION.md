# 14 — API Integration // Fresh News Mobile

> **Destinatário**: Membro 3 (Admin & Integrações)
> **Objetivo**: Implementar o cliente HTTP, interceptors, cache e integração com a API REST do backend Next.js.
> **Pré-requisito**: Módulo 00 executado.

---

## Contexto

O app Flutter comunica com o backend de duas formas:

1. **Supabase Client** (direto) — para leitura de dados públicos (newsletters, posts, subscribers)
2. **API REST** (via Dio) — para ações que requerem lógica server-side (login, geração IA, distribuição)

---

## API Routes Disponíveis no Backend

| Rota | Método | Autenticação | Descrição |
|---|---|---|---|
| `/api/login` | POST | Nenhuma | Login admin `{ password }` → `{ success }` |
| `/api/cron` | GET | Nenhuma* | Trigger ingestão RSS `?force=true` |
| `/api/generate` | POST | Admin* | Gerar newsletter `{ world? }` |
| `/api/track` | GET | Nenhuma | Registrar clique `?sub=&nl=&cat=&url=` |
| `/api/cli` | GET | Nenhuma | Renderização terminal (não usado no mobile) |

> *Nota: No web, a proteção é via middleware/cookie. No mobile, essas rotas devem ser chamadas somente pelo admin logado.

---

## Configuração do Dio

```dart
// core/network/dio_client.dart

class DioClient {
  static Dio create({required String baseUrl}) {
    final dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 15),
      receiveTimeout: Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Interceptors
    dio.interceptors.addAll([
      _LoggingInterceptor(),
      _RetryInterceptor(dio),
      _ErrorInterceptor(),
    ]);

    return dio;
  }
}

// Provider
final dioProvider = Provider<Dio>((ref) {
  return DioClient.create(baseUrl: AppConstants.apiBaseUrl);
});
```

### App Constants

```dart
// core/constants/app_constants.dart

class AppConstants {
  // URL base da API (apontar para o servidor Next.js)
  // Em desenvolvimento: http://10.0.2.2:3000 (emulador Android)
  // Em produção: https://seu-dominio.com
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  // Supabase
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Cache
  static const Duration cacheMaxAge = Duration(minutes: 5);
  static const int cacheMaxEntries = 50;
}
```

---

## Interceptors

### Logging

```dart
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    debugPrint('[API] → ${options.method} ${options.path}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    debugPrint('[API] ← ${response.statusCode} ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    debugPrint('[API] ✗ ${err.response?.statusCode} ${err.requestOptions.path}: ${err.message}');
    handler.next(err);
  }
}
```

### Retry (com backoff exponencial)

```dart
class _RetryInterceptor extends Interceptor {
  final Dio _dio;
  static const _maxRetries = 2;

  _RetryInterceptor(this._dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retryCount = err.requestOptions.extra['retryCount'] ?? 0;

    if (_shouldRetry(err) && retryCount < _maxRetries) {
      final delay = Duration(seconds: (retryCount + 1) * 2); // 2s, 4s
      await Future.delayed(delay);

      final options = err.requestOptions;
      options.extra['retryCount'] = retryCount + 1;

      try {
        final response = await _dio.fetch(options);
        handler.resolve(response);
      } catch (e) {
        handler.next(err);
      }
    } else {
      handler.next(err);
    }
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        (err.response?.statusCode != null && err.response!.statusCode! >= 500);
  }
}
```

### Error Handler

```dart
class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final message = switch (err.type) {
      DioExceptionType.connectionTimeout => 'Conexão expirada. Verifique sua internet.',
      DioExceptionType.receiveTimeout => 'O servidor demorou para responder.',
      DioExceptionType.connectionError => 'Sem conexão com a internet.',
      _ => err.response?.data?['error'] ?? 'Erro inesperado.',
    };

    handler.next(DioException(
      requestOptions: err.requestOptions,
      error: message,
      type: err.type,
      response: err.response,
    ));
  }
}
```

---

## Cache Layer (Simples)

Para dados que mudam pouco (lista de newsletters publicadas), usar cache em memória:

```dart
// core/network/cache_manager.dart

class SimpleCacheManager {
  final Map<String, _CacheEntry> _cache = {};
  final Duration maxAge;

  SimpleCacheManager({this.maxAge = const Duration(minutes: 5)});

  T? get<T>(String key) {
    final entry = _cache[key];
    if (entry == null) return null;
    if (DateTime.now().isAfter(entry.expiry)) {
      _cache.remove(key);
      return null;
    }
    return entry.data as T;
  }

  void set(String key, dynamic data) {
    _cache[key] = _CacheEntry(
      data: data,
      expiry: DateTime.now().add(maxAge),
    );
  }

  void invalidate(String key) => _cache.remove(key);
  void clear() => _cache.clear();
}

class _CacheEntry {
  final dynamic data;
  final DateTime expiry;
  _CacheEntry({required this.data, required this.expiry});
}

// Provider
final cacheManagerProvider = Provider<SimpleCacheManager>((ref) {
  return SimpleCacheManager();
});
```

### Uso nos Repositórios

```dart
Future<List<Newsletter>> getPublished({required String world}) async {
  final cacheKey = 'newsletters_published_$world';
  final cached = _cache.get<List<Newsletter>>(cacheKey);
  if (cached != null) return cached;

  final data = await _client
      .from('newsletters')
      .select()
      .eq('status', 'published')
      .eq('world', world)
      .order('edition_number', ascending: false);

  final result = data.map((json) => Newsletter.fromJson(json)).toList();
  _cache.set(cacheKey, result);
  return result;
}
```

---

## Connectivity Check

```dart
// core/network/connectivity.dart

// Usar pacote connectivity_plus

final connectivityProvider = StreamProvider<ConnectivityResult>((ref) {
  return Connectivity().onConnectivityChanged.map((list) => list.first);
});

// No widget:
final connectivity = ref.watch(connectivityProvider);
if (connectivity.value == ConnectivityResult.none) {
  return OfflineBanner(); // Mostrar banner "Sem conexão"
}
```

Adicionar dependência:
```yaml
dependencies:
  connectivity_plus: ^6.0.0
```

---

## Offline Banner Widget

```dart
class OfflineBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: FNColors.error.withOpacity(0.1),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(LucideIcons.wifiOff, size: 14, color: FNColors.error),
          SizedBox(width: 8),
          Text(
            'SEM CONEXÃO',
            style: FNTypography.techLabel.copyWith(color: FNColors.error),
          ),
        ],
      ),
    );
  }
}
```

---

## Entregável Esperado

1. **dio_client.dart** — Dio configurado com interceptors
2. **app_constants.dart** — URLs e configurações
3. **cache_manager.dart** — Cache simples em memória
4. **connectivity.dart** — Provider de conectividade
5. **offline_banner.dart** — Widget de offline
