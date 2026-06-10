# 01 — Database & Models // Fresh News Mobile

> **Destinatário**: Membro 1 (Líder / Fundação)
> **Objetivo**: Criar todos os models Dart (entidades), DTOs e repositórios que conectam com o Supabase existente.
> **Pré-requisito**: `00_FLUTTER_ARCHITECTURE.md` executado (projeto base criado).

---

## Schema do Banco de Dados (Supabase PostgreSQL)

### Tabela: `newsletters`

```sql
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition_number SERIAL,
  title TEXT NOT NULL,
  summary_intro TEXT,
  content_json JSONB,          -- Estrutura: { title, intro, quickTakes[], categories[{ name, items[{ headline, story, link, imageUrl? }] }], image_prompt }
  debate_log JSONB DEFAULT '[]',  -- Array de: { persona, role, avatar, color, message }
  html_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  image_url TEXT,
  image_prompt TEXT,
  category TEXT,
  world TEXT NOT NULL DEFAULT 'TECH',  -- 'TECH' | 'MUSIC' | 'GEAR' | 'GAME'
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

**RLS**: Público pode SELECT onde `status = 'published'`.

### Tabela: `subscribers`

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  preferences JSONB DEFAULT '[]',     -- Array de strings: ["💻 DEV", "🤖 IA", ...]
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token UUID DEFAULT uuid_generate_v4() NOT NULL,
  active_worlds TEXT[] NOT NULL DEFAULT '{TECH}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS**: Público pode INSERT.

### Tabela: `posts`

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  summary TEXT,
  source TEXT,
  score INTEGER DEFAULT 0,
  status post_status DEFAULT 'pending',  -- ENUM: 'pending' | 'approved' | 'rejected' | 'published'
  category TEXT NOT NULL DEFAULT 'TECH_HACKER',
  sub_category TEXT NOT NULL DEFAULT 'GERAL',
  theme_config JSONB DEFAULT '{}',       -- { dna, primary_color, accent_color, font_style, ui_effects[], image_prompt }
  whatsapp_summary TEXT,
  world TEXT NOT NULL DEFAULT 'TECH',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS**: Público pode SELECT onde `status = 'approved'`.

### Tabela: `user_clicks`

```sql
CREATE TABLE user_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela: `sources`

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rss_url TEXT UNIQUE NOT NULL,
  category_hint TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Models Dart (Entidades)

Todas as entidades devem ser **imutáveis** com construtores `const`, factories `fromJson` e método `toJson`.

### Newsletter

```dart
// shared/domain/newsletter.entity.dart

class Newsletter {
  final String id;
  final int editionNumber;
  final String title;
  final String? summaryIntro;
  final NewsletterContent? contentJson;
  final List<DebateMessage> debateLog;
  final String? htmlContent;
  final String status; // 'draft' | 'published'
  final String? imageUrl;
  final String? imagePrompt;
  final String? category;
  final String world; // 'TECH' | 'MUSIC' | 'GEAR' | 'GAME'
  final DateTime createdAt;
  final DateTime? publishedAt;

  const Newsletter({
    required this.id,
    required this.editionNumber,
    required this.title,
    this.summaryIntro,
    this.contentJson,
    this.debateLog = const [],
    this.htmlContent,
    this.status = 'draft',
    this.imageUrl,
    this.imagePrompt,
    this.category,
    this.world = 'TECH',
    required this.createdAt,
    this.publishedAt,
  });

  factory Newsletter.fromJson(Map<String, dynamic> json) {
    return Newsletter(
      id: json['id'] as String,
      editionNumber: json['edition_number'] as int,
      title: json['title'] as String,
      summaryIntro: json['summary_intro'] as String?,
      contentJson: json['content_json'] != null
          ? NewsletterContent.fromJson(json['content_json'] as Map<String, dynamic>)
          : null,
      debateLog: (json['debate_log'] as List<dynamic>?)
              ?.map((e) => DebateMessage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      htmlContent: json['html_content'] as String?,
      status: json['status'] as String? ?? 'draft',
      imageUrl: json['image_url'] as String?,
      imagePrompt: json['image_prompt'] as String?,
      category: json['category'] as String?,
      world: json['world'] as String? ?? 'TECH',
      createdAt: DateTime.parse(json['created_at'] as String),
      publishedAt: json['published_at'] != null
          ? DateTime.parse(json['published_at'] as String)
          : null,
    );
  }

  bool get isPublished => status == 'published';
  bool get isDraft => status == 'draft';
}
```

### NewsletterContent (Sub-model do content_json)

```dart
// shared/domain/newsletter_content.entity.dart

class NewsletterContent {
  final String title;
  final String intro;
  final List<String> quickTakes;
  final List<NewsCategory> categories;
  final String? imagePrompt;

  const NewsletterContent({
    required this.title,
    required this.intro,
    this.quickTakes = const [],
    this.categories = const [],
    this.imagePrompt,
  });

  factory NewsletterContent.fromJson(Map<String, dynamic> json) {
    return NewsletterContent(
      title: json['title'] as String? ?? '',
      intro: json['intro'] as String? ?? '',
      quickTakes: (json['quickTakes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      categories: (json['categories'] as List<dynamic>?)
              ?.map((e) => NewsCategory.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      imagePrompt: json['image_prompt'] as String?,
    );
  }
}

class NewsCategory {
  final String name;
  final List<NewsItem> items;

  const NewsCategory({required this.name, this.items = const []});

  factory NewsCategory.fromJson(Map<String, dynamic> json) {
    return NewsCategory(
      name: json['name'] as String,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => NewsItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class NewsItem {
  final String headline;
  final String story;
  final String link;
  final String? imageUrl;

  const NewsItem({
    required this.headline,
    required this.story,
    required this.link,
    this.imageUrl,
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) {
    return NewsItem(
      headline: json['headline'] as String? ?? json['title'] as String? ?? '',
      story: json['story'] as String? ?? json['summary'] as String? ?? '',
      link: json['link'] as String? ?? '#',
      imageUrl: json['imageUrl'] as String?,
    );
  }
}
```

### DebateMessage

```dart
// shared/domain/debate_message.entity.dart

class DebateMessage {
  final String persona;
  final String role;    // 'AI' | 'SEC' | 'DEV' | 'CLOUD' (TECH) ou variantes por mundo
  final String avatar;  // Emoji: '🤖', '🛡️', '💻', '☁️'
  final String color;   // Hex: '#8B5CF6', '#F43F5E', '#10B981', '#06B6D4'
  final String message;

  const DebateMessage({
    required this.persona,
    required this.role,
    required this.avatar,
    required this.color,
    required this.message,
  });

  factory DebateMessage.fromJson(Map<String, dynamic> json) {
    return DebateMessage(
      persona: json['persona'] as String,
      role: json['role'] as String,
      avatar: json['avatar'] as String,
      color: json['color'] as String,
      message: json['message'] as String,
    );
  }
}
```

### Post

```dart
// shared/domain/post.entity.dart

class Post {
  final String id;
  final String title;
  final String url;
  final String? content;
  final String? summary;
  final String? source;
  final int score;
  final String status; // 'pending' | 'approved' | 'rejected' | 'published'
  final String category;
  final String subCategory;
  final Map<String, dynamic>? themeConfig;
  final String? whatsappSummary;
  final String world;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  const Post({
    required this.id,
    required this.title,
    required this.url,
    this.content,
    this.summary,
    this.source,
    this.score = 0,
    this.status = 'pending',
    this.category = 'TECH_HACKER',
    this.subCategory = 'GERAL',
    this.themeConfig,
    this.whatsappSummary,
    this.world = 'TECH',
    this.metadata,
    required this.createdAt,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] as String,
      title: json['title'] as String,
      url: json['url'] as String,
      content: json['content'] as String?,
      summary: json['summary'] as String?,
      source: json['source'] as String?,
      score: json['score'] as int? ?? 0,
      status: json['status'] as String? ?? 'pending',
      category: json['category'] as String? ?? 'TECH_HACKER',
      subCategory: json['sub_category'] as String? ?? 'GERAL',
      themeConfig: json['theme_config'] as Map<String, dynamic>?,
      whatsappSummary: json['whatsapp_summary'] as String?,
      world: json['world'] as String? ?? 'TECH',
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
```

### Subscriber

```dart
// shared/domain/subscriber.entity.dart

class Subscriber {
  final String id;
  final String email;
  final String? phone;
  final List<String> preferences;
  final String status; // 'active' | 'unsubscribed'
  final String unsubscribeToken;
  final List<String> activeWorlds;
  final DateTime createdAt;

  const Subscriber({
    required this.id,
    required this.email,
    this.phone,
    this.preferences = const [],
    this.status = 'active',
    required this.unsubscribeToken,
    this.activeWorlds = const ['TECH'],
    required this.createdAt,
  });

  factory Subscriber.fromJson(Map<String, dynamic> json) {
    return Subscriber(
      id: json['id'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      preferences: (json['preferences'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      status: json['status'] as String? ?? 'active',
      unsubscribeToken: json['unsubscribe_token'] as String,
      activeWorlds: (json['active_worlds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          ['TECH'],
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  bool get isActive => status == 'active';
}
```

### UserClick

```dart
// shared/domain/user_click.entity.dart

class UserClick {
  final String id;
  final String subscriberId;
  final String? newsletterId;
  final String category;
  final DateTime clickedAt;

  const UserClick({
    required this.id,
    required this.subscriberId,
    this.newsletterId,
    required this.category,
    required this.clickedAt,
  });

  factory UserClick.fromJson(Map<String, dynamic> json) {
    return UserClick(
      id: json['id'] as String,
      subscriberId: json['subscriber_id'] as String,
      newsletterId: json['newsletter_id'] as String?,
      category: json['category'] as String,
      clickedAt: DateTime.parse(json['clicked_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'subscriber_id': subscriberId,
    'newsletter_id': newsletterId,
    'category': category,
  };
}
```

---

## Repositórios (Infrastructure)

Todos os repositórios devem usar o `Supabase.instance.client` e expor providers Riverpod.

### NewsletterRepository

```dart
// shared/infrastructure/newsletter_repository.dart

class NewsletterRepository {
  final SupabaseClient _client;

  NewsletterRepository(this._client);

  /// Busca newsletters publicadas do mundo ativo, ordenadas por edição desc
  Future<List<Newsletter>> getPublished({
    required String world,
    String? category,
    int limit = 12,
  }) async {
    var query = _client
        .from('newsletters')
        .select()
        .eq('status', 'published')
        .eq('world', world)
        .order('edition_number', ascending: false)
        .limit(limit);

    if (category != null) {
      query = query.eq('category', category);
    }

    final data = await query;
    return data.map((json) => Newsletter.fromJson(json)).toList();
  }

  /// Busca todas as newsletters (admin - inclui drafts)
  Future<List<Newsletter>> getDrafts() async {
    final data = await _client
        .from('newsletters')
        .select()
        .eq('status', 'draft')
        .order('created_at', ascending: false);
    return data.map((json) => Newsletter.fromJson(json)).toList();
  }

  /// Busca uma newsletter por ID
  Future<Newsletter> getById(String id) async {
    final data = await _client
        .from('newsletters')
        .select()
        .eq('id', id)
        .single();
    return Newsletter.fromJson(data);
  }

  /// Busca categorias disponíveis para um mundo
  Future<List<String>> getAvailableCategories(String world) async {
    final data = await _client
        .from('newsletters')
        .select('category')
        .eq('world', world)
        .not('category', 'is', null);
    final categories = data
        .map((e) => e['category'] as String?)
        .whereType<String>()
        .toSet()
        .toList();
    return categories;
  }

  /// Atualiza status de uma newsletter (admin)
  Future<void> updateStatus(String id, String status) async {
    await _client
        .from('newsletters')
        .update({'status': status, if (status == 'published') 'published_at': DateTime.now().toIso8601String()})
        .eq('id', id);
  }

  /// Deleta uma newsletter e reindxa as posteriores (admin)
  Future<void> delete(String id, int editionNumber) async {
    await _client.from('newsletters').delete().eq('id', id);

    // Reindexar edições posteriores
    final newer = await _client
        .from('newsletters')
        .select('id, edition_number')
        .gt('edition_number', editionNumber)
        .order('edition_number', ascending: true);

    for (final n in newer) {
      await _client
          .from('newsletters')
          .update({'edition_number': n['edition_number'] - 1})
          .eq('id', n['id']);
    }
  }
}

// Provider Riverpod
final newsletterRepositoryProvider = Provider<NewsletterRepository>((ref) {
  return NewsletterRepository(Supabase.instance.client);
});
```

### SubscriberRepository

```dart
// shared/infrastructure/subscriber_repository.dart

class SubscriberRepository {
  final SupabaseClient _client;

  SubscriberRepository(this._client);

  /// Inscreve um novo assinante ou reativa um existente
  Future<({bool success, String message})> subscribe({
    required String email,
    String? phone,
    List<String> preferences = const [],
  }) async {
    // 1. Verificar se já existe
    final existing = await _client
        .from('subscribers')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

    if (existing != null) {
      if (existing['status'] == 'active') {
        return (success: true, message: 'Você já está inscrito na nossa lista! 🚀');
      }
      // Reativar
      await _client
          .from('subscribers')
          .update({'status': 'active', 'preferences': preferences, 'phone': phone})
          .eq('id', existing['id']);
      return (success: true, message: 'Sua inscrição foi reativada com sucesso! 🎉');
    }

    // 2. Inserir novo
    await _client.from('subscribers').insert({
      'email': email,
      'preferences': preferences,
      'phone': phone,
    });

    return (success: true, message: 'Inscrição realizada com sucesso! 🎉');
  }

  /// Cancela inscrição via token
  Future<({bool success, String message})> unsubscribe(String token) async {
    final subscriber = await _client
        .from('subscribers')
        .select('id')
        .eq('unsubscribe_token', token)
        .maybeSingle();

    if (subscriber == null) {
      return (success: false, message: 'Link de cancelamento inválido ou expirado.');
    }

    await _client
        .from('subscribers')
        .update({'status': 'unsubscribed'})
        .eq('id', subscriber['id']);

    return (success: true, message: 'Inscrição cancelada com sucesso.');
  }

  /// Busca assinante por ID
  Future<Subscriber?> getById(String id) async {
    final data = await _client
        .from('subscribers')
        .select()
        .eq('id', id)
        .maybeSingle();
    return data != null ? Subscriber.fromJson(data) : null;
  }

  /// Atualiza preferências
  Future<void> updatePreferences(String id, List<String> preferences) async {
    await _client
        .from('subscribers')
        .update({'preferences': preferences})
        .eq('id', id);
  }
}

final subscriberRepositoryProvider = Provider<SubscriberRepository>((ref) {
  return SubscriberRepository(Supabase.instance.client);
});
```

### PostRepository

```dart
// shared/infrastructure/post_repository.dart

class PostRepository {
  final SupabaseClient _client;

  PostRepository(this._client);

  /// Busca posts aprovados do mundo ativo, ordenados por score desc
  Future<List<Post>> getApproved({required String world, int limit = 10}) async {
    final data = await _client
        .from('posts')
        .select()
        .eq('status', 'approved')
        .eq('world', world)
        .order('score', ascending: false)
        .limit(limit);
    return data.map((json) => Post.fromJson(json)).toList();
  }

  /// Busca um post por ID
  Future<Post> getById(String id) async {
    final data = await _client
        .from('posts')
        .select()
        .eq('id', id)
        .single();
    return Post.fromJson(data);
  }

  /// Atualiza status (admin)
  Future<void> updateStatus(String id, String status) async {
    await _client.from('posts').update({'status': status}).eq('id', id);
  }
}

final postRepositoryProvider = Provider<PostRepository>((ref) {
  return PostRepository(Supabase.instance.client);
});
```

### TrackingRepository

```dart
// shared/infrastructure/tracking_repository.dart

class TrackingRepository {
  final SupabaseClient _client;

  TrackingRepository(this._client);

  /// Registra um clique e atualiza as preferências via ML reativo
  Future<void> trackClick({
    required String subscriberId,
    String? newsletterId,
    required String category,
  }) async {
    // 1. Inserir clique
    await _client.from('user_clicks').insert({
      'subscriber_id': subscriberId,
      'newsletter_id': newsletterId,
      'category': category.trim(),
    });

    // 2. Recalcular preferências (ML reativo)
    await _recalculatePreferences(subscriberId);
  }

  Future<void> _recalculatePreferences(String subscriberId) async {
    final clicks = await _client
        .from('user_clicks')
        .select('category')
        .eq('subscriber_id', subscriberId)
        .order('clicked_at', ascending: false)
        .limit(30);

    if (clicks.isEmpty) return;

    // Contar frequência
    final counts = <String, int>{};
    for (final click in clicks) {
      final cat = click['category'] as String;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }

    // Top 3 categorias
    final sorted = counts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final topPrefs = sorted.take(3).map((e) => e.key).toList();

    await _client
        .from('subscribers')
        .update({'preferences': topPrefs})
        .eq('id', subscriberId);
  }
}

final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  return TrackingRepository(Supabase.instance.client);
});
```

---

## Entregável Esperado

1. **Todos os arquivos de entidades** em `shared/domain/`
2. **Todos os repositórios** em `shared/infrastructure/`
3. **Providers Riverpod** para cada repositório
4. **Testes unitários** para `fromJson` de cada entidade (usar dados mock baseados no schema acima)

> **ATENÇÃO**: Não esqueça de mapear `snake_case` do banco para `camelCase` do Dart em todos os `fromJson`.
