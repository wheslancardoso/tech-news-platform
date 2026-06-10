# 13 — Notifications // Fresh News Mobile

> **Destinatário**: Membro 3 (Admin & Integrações)
> **Objetivo**: Implementar push notifications via Firebase Cloud Messaging (FCM) para Android.
> **Pré-requisito**: Módulos 00, 01 executados. Projeto Firebase configurado.

---

## Contexto — Substituição do WhatsApp

No web, a distribuição é feita via:
- **Email** (Resend)
- **WhatsApp** (n8n webhook)

No mobile, as push notifications **substituem ambos**, trazendo uma experiência mais integrada: o usuário recebe a notificação, toca e vai direto para a edição no app.

---

## Fluxo Proposto

```
1. Newsletter publicada no admin (web ou mobile)
   ↓
2. Backend dispara webhook/edge function
   ↓
3. Firebase Cloud Messaging envia push
   ↓
4. App recebe a notificação (foreground/background/terminated)
   ↓
5. Ao tocar: abre app direto na NewsletterDetailScreen
```

---

## Setup Firebase (Android)

### 1. Criar projeto no Firebase Console

- Adicionar app Android com package name do Flutter app
- Baixar `google-services.json` e colocar em `android/app/`
- Seguir instruções do `firebase_messaging` para configurar `build.gradle`

### 2. Dependências

```yaml
dependencies:
  firebase_core: ^3.5.0
  firebase_messaging: ^15.1.0
  flutter_local_notifications: ^17.2.0
```

### 3. Inicialização

```dart
// main.dart

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Firebase.initializeApp();
  await Supabase.initialize(url: '...', anonKey: '...');
  
  // Configurar FCM
  await NotificationService.initialize();
  
  runApp(const ProviderScope(child: FreshNewsApp()));
}
```

---

## Notification Service

```dart
// core/services/notification_service.dart

class NotificationService {
  static final _messaging = FirebaseMessaging.instance;
  static final _localNotifications = FlutterLocalNotificationsPlugin();

  /// Inicializar tudo
  static Future<void> initialize() async {
    // 1. Solicitar permissão
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('[FCM] Permissão negada pelo usuário');
      return;
    }

    // 2. Obter token FCM
    final token = await _messaging.getToken();
    debugPrint('[FCM] Token: $token');
    
    // 3. Salvar token no Supabase (vincular ao subscriber)
    if (token != null) {
      await _saveTokenToSupabase(token);
    }

    // 4. Escutar atualizações de token
    _messaging.onTokenRefresh.listen(_saveTokenToSupabase);

    // 5. Configurar notificações locais (foreground)
    await _localNotifications.initialize(
      InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // 6. Handlers de mensagem
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
    
    // 7. Verificar se app foi aberto por notificação (terminated)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageOpenedApp(initialMessage);
    }
  }

  /// Salvar FCM token no Supabase vinculado ao subscriber
  static Future<void> _saveTokenToSupabase(String token) async {
    final prefs = await SharedPreferences.getInstance();
    final subscriberId = prefs.getString('subscriber_id');
    
    if (subscriberId != null) {
      await Supabase.instance.client
          .from('subscribers')
          .update({'fcm_token': token})
          .eq('id', subscriberId);
    }
    
    // Salvar localmente para vincular depois
    await prefs.setString('fcm_token', token);
  }

  /// Mensagem recebida com app em foreground
  static void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('[FCM] Foreground: ${message.notification?.title}');
    
    // Mostrar notificação local
    _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'Fresh News',
      message.notification?.body ?? 'Nova edição disponível!',
      NotificationDetails(
        android: AndroidNotificationDetails(
          'fresh_news_channel',
          'Fresh News',
          channelDescription: 'Notificações de novas edições',
          importance: Importance.high,
          priority: Priority.high,
          color: Color(0xFF8B5CF6), // Primary violet
          icon: '@mipmap/ic_launcher',
        ),
      ),
      payload: message.data['newsletter_id'],
    );
  }

  /// Mensagem aberta (background ou terminated)
  static void _handleMessageOpenedApp(RemoteMessage message) {
    final newsletterId = message.data['newsletter_id'];
    if (newsletterId != null) {
      // Navegar para o detalhe da newsletter
      // Usar um GlobalKey<NavigatorState> ou event bus para navegar
      _navigateToNewsletter(newsletterId);
    }
  }

  /// Notificação local tocada
  static void _onNotificationTap(NotificationResponse response) {
    final newsletterId = response.payload;
    if (newsletterId != null) {
      _navigateToNewsletter(newsletterId);
    }
  }

  /// Navegação global (precisa de acesso ao router)
  static void _navigateToNewsletter(String id) {
    // Implementar usando GlobalKey ou Riverpod container global
    // router.push('/archive/$id');
    debugPrint('[FCM] Navigate to newsletter: $id');
  }
}
```

---

## Schema: Adicionar campo `fcm_token` na tabela subscribers

```sql
-- Migration sugerida (executar no Supabase):
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS fcm_token TEXT;
```

---

## Payload da Push Notification

Quando uma newsletter é publicada, o backend deve enviar para o FCM:

```json
{
  "notification": {
    "title": "FRESH NEWS // EDIÇÃO #42",
    "body": "O Futuro é Líquido — Sua nova edição está disponível."
  },
  "data": {
    "newsletter_id": "uuid-da-newsletter",
    "edition_number": "42",
    "world": "TECH",
    "type": "new_edition"
  },
  "topic": "fresh_news_all"
}
```

### Tópicos FCM Sugeridos

| Tópico | Quem recebe | Quando |
|---|---|---|
| `fresh_news_all` | Todos | Nova edição publicada |
| `fresh_news_TECH` | Assinantes do mundo TECH | Edição TECH publicada |
| `fresh_news_MUSIC` | Assinantes do mundo MUSIC | Edição MUSIC publicada |
| `fresh_news_GEAR` | Assinantes do mundo GEAR | Edição GEAR publicada |
| `fresh_news_GAME` | Assinantes do mundo GAME | Edição GAME publicada |

### Inscrição em Tópicos

```dart
// Ao fazer subscribe ou alterar mundos:
Future<void> subscribeToWorldTopics(List<String> worlds) async {
  // Desinscrever de todos primeiro
  for (final world in ['TECH', 'MUSIC', 'GEAR', 'GAME']) {
    await FirebaseMessaging.instance.unsubscribeFromTopic('fresh_news_$world');
  }
  
  // Inscrever nos selecionados
  await FirebaseMessaging.instance.subscribeToTopic('fresh_news_all');
  for (final world in worlds) {
    await FirebaseMessaging.instance.subscribeToTopic('fresh_news_$world');
  }
}
```

---

## Configuração de Preferências de Notificação (Exclusivo Mobile)

O app deve ter uma tela de configurações de notificação:

```
┌──────────────────────────────┐
│ Configurações de Notificação │
├──────────────────────────────┤
│ [🔔] Novas Edições     [ON] │
│ [💻] Mundo TECH         [ON] │
│ [🎵] Mundo MUSIC       [OFF]│
│ [⚙️] Mundo GEAR        [OFF]│
│ [🎮] Mundo GAME        [ON] │
├──────────────────────────────┤
│ [🔇] Modo Silencioso   [OFF]│
│ Horário: 08:00 - 22:00      │
└──────────────────────────────┘
```

---

## Nota sobre Complexidade

> Este módulo envolve configuração no Firebase Console + backend (Edge Function ou cron job para disparar pushes). A implementação **client-side** (Flutter) é relativamente simples. A parte complexa é o **trigger server-side** que dispara as pushes quando uma newsletter é publicada.
>
> **Sugestão prática**: Começar com push manual (admin publica → admin clica botão "Enviar Push") antes de automatizar com Edge Functions.

---

## Entregável Esperado

1. **notification_service.dart** — Serviço completo de FCM
2. **Integração** no main.dart
3. **Navegação** por deep link ao tocar na notificação
4. **Tela de configurações** de notificação
5. **Documentação** de como configurar o Firebase Console
