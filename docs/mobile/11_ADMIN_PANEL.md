# 11 — Admin Panel // Fresh News Mobile

> **Destinatário**: Membro 3 (Admin & Integrações)
> **Objetivo**: Implementar o painel admin mobile com curadoria, editor de newsletters e upload de imagens.
> **Pré-requisito**: Módulos 00, 01, 02, 09 executados.

---

## Comportamento Web Original

O admin tem dois sub-módulos:

### 1. Inbox de Curadoria (`/admin/posts`)
- Exibe métricas (Tráfego, Conversão, Tempo de Sessão — hardcoded)
- Lista newsletters em status `draft`
- Cada newsletter tem botões: **Aprovar e Publicar** / **Rejeitar Edição**

### 2. Edições Pendentes (`/admin/newsletters`)
- Lista drafts
- Formulário para **Gerar Nova Edição** (seleciona mundo + dispara API)
- Alerta sobre status da integração Resend
- Cada draft usa o `NewsletterCard` admin complexo com:
  - Upload de imagem de capa (WebP comprimido)
  - Prompt de imagem IA (editável + gerar com IA + copiar)
  - Toggle para expandir notícias individuais
  - Edição inline de título, resumo, prompt por item
  - Upload de imagem por item individual

---

## Mobile Adaptation

### Layout Principal (Shell Admin)

```
┌──────────────────────────────┐
│ AppBar (Glass)               │
│ FN    Admin Console    [≡]   │
├──────────────────────────────┤
│ Tab Bar                      │
│ [📥 Curadoria] [📧 Edições] │
├──────────────────────────────┤
│                              │
│ (conteúdo da tab ativa)      │
│                              │
├──────────────────────────────┤
│ Bottom Nav (admin)           │
│ [← Home] [📥 Posts] [📧 NL] │
└──────────────────────────────┘
```

### Tab 1: Curadoria (AdminPostsScreen)

```
┌──────────────────────────────┐
│ Header: "Inbox de Curadoria" │
├──────────────────────────────┤
│ Metrics Row                  │
│ ┌────┐ ┌────┐ ┌────┐        │
│ │42.8K│ │8.2%│ │04:12│       │
│ │Trfg │ │Conv│ │Sessão│      │
│ └────┘ └────┘ └────┘        │
├──────────────────────────────┤
│ Draft List                   │
│ ┌──────────────────────────┐ │
│ │ NewsletterCard (simples) │ │
│ │ EDIÇÃO #42 · 01/06       │ │
│ │ Título...                │ │
│ │ [✓ APROVAR] [✗ REJEITAR] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Tab 2: Edições (AdminNewslettersScreen)

```
┌──────────────────────────────┐
│ Header: "Edições Pendentes"  │
│ [World ▼] [⚡ Gerar Nova]   │
├──────────────────────────────┤
│ Alert Card                   │
│ "Fase 5 (Resend) em integr." │
├──────────────────────────────┤
│ Draft List                   │
│ ┌──────────────────────────┐ │
│ │ NewsletterCardAdmin      │ │
│ │ (card expandível mega)   │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

## Providers Admin

```dart
// features/admin/application/admin_providers.dart

/// Drafts (newsletters em rascunho)
final adminDraftsProvider = FutureProvider.autoDispose<List<Newsletter>>((ref) {
  return ref.read(newsletterRepositoryProvider).getDrafts();
});

/// Gerar nova edição via API
final generateDraftProvider = FutureProvider.autoDispose.family<void, String>((ref, world) async {
  final dio = ref.read(dioProvider);
  await dio.post('/api/generate', data: {'world': world});
  ref.invalidate(adminDraftsProvider); // Recarrega a lista
});
```

---

## Componente: NewsletterCardAdmin (Completo)

Este é o componente mais complexo do admin. No web tem 473 linhas.

### Funcionalidades:

1. **Header**: Badge edição + data + botão "Salvar Alterações"
2. **Título**: Texto grande do newsletter
3. **Imagem de Capa**:
   - Prompt editável (textarea)
   - Botão "Gerar com IA" (chama `generateImagePromptAction`)
   - Botão "Copiar Prompt"
   - Input de URL da imagem
   - Botão upload (seleciona imagem do dispositivo)
   - Preview da imagem
4. **Toggle "Curar Imagens Individualmente"**: expande lista de itens
5. **Lista de Itens** (quando expandido):
   - Por categoria → por item
   - Cada item editável: título, resumo, prompt de imagem, resumo WhatsApp, upload de imagem

### Implementação Sugerida

```dart
class NewsletterCardAdmin extends ConsumerStatefulWidget {
  final Newsletter draft;
  // ...
}

class _NewsletterCardAdminState extends ConsumerState<NewsletterCardAdmin> {
  late TextEditingController _imagePromptController;
  late TextEditingController _imageUrlController;
  late Map<String, dynamic> _contentJson;
  bool _showItems = false;
  bool _isSaving = false;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _imagePromptController = TextEditingController(text: widget.draft.imagePrompt ?? '');
    _imageUrlController = TextEditingController(text: widget.draft.imageUrl ?? '');
    _contentJson = widget.draft.contentJson?.toJson() ?? {};
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);
    // Chamar API ou Server Action para salvar
    // PUT /api/newsletters/:id com { image_url, image_prompt, content_json }
    setState(() => _isSaving = false);
  }

  Future<void> _handleUpload() async {
    // 1. Abrir image picker
    // 2. Comprimir para WebP (usar pacote flutter_image_compress)
    // 3. Upload para Supabase Storage via repository
    // 4. Atualizar URL
  }

  Future<void> _handleGeneratePrompt() async {
    // Chamar API: POST /api/generate com contexto da edição
    // Resposta: { success: true, prompt: "..." }
    // Atualizar _imagePromptController
  }
}
```

### Upload de Imagem Mobile

```dart
// Usar image_picker + flutter_image_compress

Future<void> _pickAndUploadImage() async {
  final picker = ImagePicker();
  final image = await picker.pickImage(source: ImageSource.gallery, maxWidth: 1000);
  if (image == null) return;

  setState(() => _isUploading = true);

  // Comprimir
  final bytes = await image.readAsBytes();
  final compressed = await FlutterImageCompress.compressWithList(
    bytes,
    quality: 60,
    format: CompressFormat.webp,
  );

  // Upload para Supabase Storage
  final fileName = 'edition-${widget.draft.editionNumber}-${DateTime.now().millisecondsSinceEpoch}.webp';
  final supabase = Supabase.instance.client;
  
  await supabase.storage.from('newsletter-covers').uploadBinary(
    fileName,
    compressed,
    fileOptions: FileOptions(contentType: 'image/webp'),
  );

  final publicUrl = supabase.storage.from('newsletter-covers').getPublicUrl(fileName);
  
  setState(() {
    _imageUrlController.text = publicUrl;
    _isUploading = false;
  });
}
```

---

## Ações Admin

### Publicar Newsletter

```dart
Future<void> publishNewsletter(String id) async {
  // 1. Atualizar status para 'published' no banco
  await ref.read(newsletterRepositoryProvider).updateStatus(id, 'published');
  
  // 2. Chamar API de distribuição (opcional, depende do backend)
  // await ref.read(dioProvider).post('/api/distribute', data: {'newsletterId': id});
  
  // 3. Invalidar providers
  ref.invalidate(adminDraftsProvider);
  
  // 4. Feedback
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Newsletter publicada com sucesso!')),
  );
}
```

### Rejeitar Newsletter

```dart
Future<void> rejectNewsletter(String id) async {
  // Deletar a newsletter + reindexar
  await ref.read(newsletterRepositoryProvider).delete(id, editionNumber);
  ref.invalidate(adminDraftsProvider);
}
```

### Gerar Nova Edição

```dart
Future<void> generateDraft(String world) async {
  // Mostrar loading overlay
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (_) => Center(child: CircularProgressIndicator()),
  );

  try {
    final dio = ref.read(dioProvider);
    await dio.post('/api/generate', queryParameters: {'world': world});
    ref.invalidate(adminDraftsProvider);
    Navigator.pop(context); // Fechar loading
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Nova edição gerada com sucesso!')),
    );
  } catch (e) {
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Erro ao gerar: $e'), backgroundColor: Colors.red),
    );
  }
}
```

---

## Dependências Extras

```yaml
dependencies:
  image_picker: ^1.1.0
  flutter_image_compress: ^2.3.0
```

---

## Entregável Esperado

1. **admin_shell.dart** — Layout com tab bar (Curadoria / Edições)
2. **admin_posts_screen.dart** — Tab de curadoria com métricas + lista
3. **admin_newsletters_screen.dart** — Tab de edições com geração
4. **newsletter_card_admin.dart** — Card expandível mega com upload + edição
5. **admin_providers.dart** — Providers admin
