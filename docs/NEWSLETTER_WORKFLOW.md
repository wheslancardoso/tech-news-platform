# 🚀 Fluxo de Trabalho da Newsletter (RSS → Inbox)

Este documento detalha o "Pipeline de Notícias" da Tech News Platform, desde o rastreamento automático de fontes até o envio final para os inscritos.

---

## 1. Captura & Ingestão (O Rastreador)
Localização: `lib/services/newsletter.ts` e `actions/ingest.ts`

O sistema monitora uma lista curada de fontes RSS (Ver `lib/config/sources.ts`).

### Processo:
1. **Fetch**: O serviço busca os links mais recentes de cada feed.
2. **Deduplicação**: Verifica no Supabase (tabela `posts`, coluna `url`) se o link já existe para evitar repetições.
3. **Extração**: Limpa o HTML do conteúdo original para extrair o texto puro da notícia.

---

## 2. Processamento por IA (O Curador Digital)
Localização: `lib/services/ai.ts` (ou similar integrado no ingest)

Para cada nova notícia capturada, o sistema utiliza uma LLM (OpenAI/Gemini) para:

- **Resumo Executivo**: Gera um sumário de 2-3 frases focado em "por que isso importa para um tech lead".
- **Categorização**: Atribui uma categoria fixa (ex: AI, Security, Frontend, Cloud).
- **Relevância (Score)**: Gera uma nota de 0 a 100 baseada no impacto tecnológico e novidade da notícia.
- **Tradução**: Se a fonte for estrangeira, traduz o conteúdo para Português Brasileiro (pt-BR).

**Resultado**: O post é salvo na tabela `posts` com o status `pending`.

---

## 3. Curadoria Humana (O Editor)
Localização: `/admin/posts`

O editor acessa o painel e visualiza a lista de posts filtrada por `relevance_score` descendente.

### Ações Disponíveis:
- **Aprovar (`status: approved`)**: Marca o post como pronto para entrar na próxima newsletter.
- **Rejeitar (`status: rejected`)**: Oculta o post permanentemente.
- **Editar**: Ajusta o resumo ou título gerado pela IA se necessário.

---

## 4. Geração do Draft (Edição Diária)
Localização: `/admin/newsletters/create`

Uma vez que existam posts aprovados suficientes (mínimo recomendado: 5), o editor dispara a geração da edição.

1. **Agrupamento**: O sistema agrupa os posts por categoria.
2. **Intro & Fechamento**: A IA escreve uma breve introdução contextualizando o dia tecnológico.
3. **Template**: O conteúdo é injetado no componente React Email `emails/daily-template.tsx`.
4. **Draft**: Uma entrada é criada na tabela `newsletters` com `status: draft`.

---

## 5. Revisão & Envio (A Entrega)
Localização: `/admin/newsletters/[id]`

O editor revisa a versão final (Preview) e clica em **"Enviar Newsletter"**.

### Fluxo Final:
1. **Renderização**: O componente React Email é convertido em HTML estático.
2. **Envio em Lote**: O sistema busca todos os emails na tabela `subscribers`.
3. **Provedor (Ex: Resend/Mailgun)**: Dispara o HTML processado para a lista de envio.
4. **Finalização**: A newsletter é marcada como `sent` e arquivada para consulta pública no site.

---

## 📊 Estrutura de Tabelas Relacionada

### `posts`
- `id`: uuid
- `title`: string
- `summary`: text (IA generated)
- `category`: string
- `relevance_score`: integer
- `status`: enum (pending, approved, rejected)
- `url`: string (unique)

### `newsletters`
- `id`: uuid
- `edition_number`: serial
- `title`: string
- `summary_intro`: text
- `content_json`: jsonb (copia dos posts incluídos)
- `html_content`: text (renderizado)
- `sent_at`: timestamp
