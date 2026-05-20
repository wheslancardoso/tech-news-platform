# 🏛️ Arquitetura do Dashboard Admin: Tech News Platform

Este documento descreve a infraestrutura técnica, os mecanismos de segurança e o fluxo de dados para a área de administração.

## 🔐 Segurança e Autenticação

A autenticação é simplificada para administradores via senha fixa (definida em variável de ambiente).

### Mecanismo de Sessão
- **Cookie-Based**: O login bem-sucedido gera um cookie HTTP-only chamado `admin_session`.
- **Validação**: Todas as rotas sob `/admin` devem verificar a existência deste cookie.

### Implementação de Proteção (Higher Order Component/Helper)
Utilizaremos um helper de servidor `checkAdmin()` em cada layout da pasta `/admin`:
```ts
// lib/auth-utils.ts
export async function checkAdmin() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')
  if (!isAdmin) redirect('/login')
}
```

---

## 🗺️ Estrutura de Rotas (App Router)

| Rota | Descrição | Componentes-Chave |
|---|---|---|
| `/login` | Página pública para acesso administrativo. | LoginForm, Button |
| **`/admin`** | **Dashboard**: Resumo de estatísticas (posts pendentes, inscritos). | StatsGrid, ChartCard |
| `/admin/posts` | **Curadoria**: Lista de notícias vindas do RSS para aprovação/rejeição. | PostCard, ModerationFilters |
| `/admin/newsletters` | **Drafts**: Edição técnica de newsletters geradas por IA antes do envio. | Editor, NewsletterPreview |

---

## ⚡ Fluxo de Dados e Server Actions

As ações administrativas são realizadas via **Server Actions** (`use server`) para evitar a necessidade de APIs REST complexas.

### 1. Curadoria (`actions/admin.ts`)
- `approvePost(id)`: Muda o status do post para `approved`. Revalida o caminho `/admin/posts`.
- `rejectPost(id)`: Muda o status do post para `rejected`.
- `triggerIngest()`: Dispara manualmente o script de captura de RSS para buscar novas notícias.

### 2. Edição de Newsletters (`actions/generate.ts`)
- `generateDraft()`: Pega posts aprovados das últimas 24h e envia para a LLM gerar o conteúdo da newsletter.
- `updateNewsletter(id, content)`: Salva edições manuais feitas pelo editor.

---

## 📂 Organização de Arquivos (Padrão)

```
app/
├── admin/
│   ├── layout.tsx       # Aplica a Sidebar e checkAdmin()
│   ├── page.tsx         # Dashboard (Stats)
│   ├── posts/           # Página de Curadoria
│   └── newsletters/     # Página de Edição de Drafts
components/
└── admin/
    ├── admin-nav.tsx    # Sidebar reutilizável
    ├── post-card.tsx    # Card com botões Aprovar/Rejeitar
    └── stats-grid.tsx   # Grid de métricas do dashboard
```

---

## ⚙️ Conexão Supabase (Admin Client)

Para ações que exigem bypass de políticas RLS (Row Level Security), utilizaremos um cliente Supabase específico nas Server Actions, inicializado com a `SUPABASE_SERVICE_ROLE_KEY`.

> [!CAUTION]
> A `SERVICE_ROLE_KEY` nunca deve ser exposta no lado do cliente (Client Components). Todas as operações que a utilizem devem estar estritamente dentro de arquivos marked com `'use server'`.
