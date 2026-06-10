# 🚀 Guia de Início: Tech News Platform

Siga este guia para configurar o ambiente de desenvolvimento local e conectar todos os serviços necessários (Supabase, OpenAI/Gemini e Resend).

---

## 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
- **Node.js** (Versão 18 ou superior)
- **NPM** (Versão 9 ou superior)
- **Git**

---

## 🛠️ Configuração Inicial

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz do projeto (copie de `.env.example`, se disponível) e preencha as seguintes chaves:

### 🔗 Supabase (Banco de Dados & Auth)
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave pública para acesso client-side.
- `SUPABASE_SERVICE_ROLE_KEY`: **CRÍTICO**: Chave secreta para bypass de RLS no Admin (use apenas em `'use server'`).

### 🤖 Inteligência Artificial (Curadoria)
- `OPENAI_API_KEY`: Para geração de resumos e curadoria de posts.
- `GEMINI_API_KEY`: (Opcional/Alternativo) Conforme configurado no serviço de IA.

### 📧 Email (Resend)
- `RESEND_API_KEY`: API Key para disparo da newsletter.
- `EMAIL_FROM`: O endereço de domínio verificado que enviará as mensagens.

### 🔑 Segurança Admin
- `ADMIN_PASSWORD`: Senha fixa para acesso ao painel `/admin`.

---

## 🗄️ Banco de Dados (Supabase)

O projeto utiliza **Supabase Migrations**. Para configurar as tabelas corretamente:

1. Acesse o console do seu projeto no Supabase.
2. Vá em **SQL Editor**.
3. Copie e cole o conteúdo de `supabase/schema.sql` (ou rode as migrations em ordem).
4. Verifique se as tabelas `posts`, `newsletters` e `subscribers` foram criadas.

---

## 🏃 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento em `localhost:3000`. |
| `npm run build` | Cria o bundle de produção otimizado. |
| `npm run test` | Executa os testes unitários via Vitest. |
| `npm run lint` | Verifica erros de sintaxe e padrões de código. |

---

## 🧪 Testando o Fluxo de Ingestão

Para testar se a captura de notícias RSS e o processamento de IA estão funcionando:

1. Rode o servidor dev: `npm run dev`.
2. Acesse `/admin` (faça login com sua `ADMIN_PASSWORD`).
3. Vá em **Posts** e clique em **"Sincronizar RSS"**.
4. Verifique os logs do terminal para acompanhar o processamento dos links.

---

## ⚠️ Notas de Segurança

> [!CAUTION]
> Nunca comite seu arquivo `.env.local` no repositório.
> Certifique-se de que a `SUPABASE_SERVICE_ROLE_KEY` nunca seja usada em componentes de cliente (`'use client'`).
