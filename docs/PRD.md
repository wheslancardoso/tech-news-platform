# 📰 PRODUCT REQUIREMENT DOCUMENT (PRD) — FRESH NEWS

## 1. Visão Geral do Produto

A **Fresh News** é uma plataforma editorial premium e automatizada de curadoria de notícias de tecnologia. Ela foi idealizada para transformar o caos da sobrecarga de informação diária em uma experiência de leitura limpa, focada e de alta autoridade técnica, enviada diretamente para a caixa de entrada (E-mail) e dispositivo preferido (WhatsApp) do assinante.

A plataforma foge do design genérico de blogs de tecnologia e adota o conceito de **Digital Brutalism ("The Neo-Broadsheet")**, inspirado na tipografia e diagramação de jornais impressos físicos de alta credibilidade histórica, adaptado para telas digitais modernas com componentes reativos, cores vibrantes por categoria e animações fluidas.

---

## 2. Objetivos Estratégicos & Proposta de Valor

*   **Curadoria Inteligente**: Captura automática via RSS de dezenas de veículos técnicos renomados, consolidada e ranqueada por Inteligência Artificial (OpenAI GPT-4o/Gemini) com scores de relevância (0-100).
*   **Edição Mestra Única**: Todo o conteúdo do dia é sumarizado em uma única newsletter executiva diária (Edição Mestra), otimizando o fluxo de curadoria do editor administrativo.
*   **Personalização Centrada no Assinante**: Embora a edição seja gerada de forma global (Mestra), o motor de distribuição recorta e envia apenas as categorias de interesse que o assinante configurou na sua Central de Preferências.
*   **Distribuição Omnichannel Híbrida**: Envio nativo de emails em HTML responsivo premium via **Resend** e disparo reativo de mensagens personalizadas no **WhatsApp** via webhook integrando **n8n** e **Evolution API**.

---

## 3. Requisitos Funcionais

### RF-01: Ingestão de Conteúdo e Inteligência Artificial (Pipeline RSS)
*   **Captura Autônoma**: O sistema deve monitorar feeds RSS configurados e extrair o conteúdo bruto e metadados das notícias.
*   **Enriquecimento & Map-Reduce**: O motor de IA (`newsletter.ts`) deve agrupar notícias similares, descartar duplicatas, redigir resumos executivos extremamente focados, categorizar os posts e atribuir notas de relevância.
*   **Categorias Camaleão**: As notícias devem ser classificadas obrigatoriamente em um dos quatro nichos core, acionando o design visual dinâmico correspondente:
    *   **IA (Inteligência Artificial)**: Tema Cyber Cyan (`#00F0FF`).
    *   **Dev (Programação & Engenharia)**: Tema Emerald Green (`#00FF66`).
    *   **Sec (Cibersegurança)**: Tema Warning Red (`#FF3B30`).
    *   **Mercado (Business & Big Tech)**: Tema Crimson/Racing Red (`#D2143A`).

### RF-02: Painel Administrativo de Moderação
*   **Acesso Seguro**: Rota `/admin` protegida por autenticação cookie-based com segurança de sessão `HTTP-Only`.
*   **Curadoria Rápida**: Interface para o administrador aprovar (`approved`) ou rejeitar (`rejected`) os posts capturados nas últimas 24 horas.
*   **Ações de Servidor (Server Actions)**: Disparos manuais de ingestão (`triggerIngest`), aprovação em lote e moderação instantânea sem recarga de tela.

### RF-03: Editor e Compilador de Edições (Drafts)
*   **Geração de Rascunho**: Compilar posts aprovados no dia e acionar a IA para redigir o cabeçalho, introdução geral e sumário executivo da edição.
*   **Edição em Tempo Real**: Painel interativo para o editor realizar ajustes manuais no conteúdo da newsletter antes de publicá-la.
*   **Imutabilidade por JSONB**: Ao salvar o rascunho, um snapshot estruturado das notícias associadas deve ser gravado na coluna `content_json` da tabela `newsletters`, mantendo o histórico inalterado mesmo se o post original for removido ou editado posteriormente.

### RF-04: Central de Preferências do Assinante
*   **Landing Page Pública**: Formulário simples e direto na Home para novos leads se cadastrarem com E-mail e Telefone (WhatsApp).
*   **Personalização de Nichos**: Rota pública `/preferencias/[id]` onde o assinante marca/desmarca quais nichos (IA, Dev, Sec, Mercado) deseja receber.
*   **Opt-out Descomplicado**: Link de descadastramento de 1 clique (`/unsubscribe/[token]`) integrado no rodapé de todas as newsletters enviadas.

### RF-05: Motor de Distribuição Híbrida e Inteligente
*   **Segmentação no Envio**: O serviço de distribuição (`distribution.ts`) deve filtrar os posts da Edição Mestra ativa e agrupar a versão exata do email/mensagem para cada usuário com base nas suas preferências ativas.
*   **Envio de Email (Resend)**: Renderização e despacho de emails responsivos no padrão brutalista.
*   **Disparo WhatsApp (n8n Webhook)**: Envio automático das payloads personalizadas estruturadas para o n8n, responsável por orquestrar e fazer o push das mensagens para a Evolution API.

---

## 4. Requisitos Não-Funcionais

### RNF-01: Estética Visual — Digital Brutalism ("The Neo-Broadsheet")
*   **Paleta de Cores**: Fundo escuro puro (`#0D0D0D` / `#000000`), superfícies de cards em cinza brutalista escuro (`#141414`), texto em alto contraste (`#FFFFFF` / `#E5E5E5`).
*   **Geometria Rígida**: Raio de borda estritamente em **0px** (raio zero em botões, inputs, cards e painéis) para evocar a rigidez de jornais impressos.
*   **Bordas e Linhas de Grade**: Bordas pretas ou cinza sólidas grossas (mínimo de **2px**) dividindo layouts e colunas.
*   **Tipografia**: Uso da fonte **Space Grotesk** (900 para títulos de extrema força visual) e **Inter** para corpos de texto legíveis.
*   **Efeito Camaleão**: Utilização de glows, borders e sombras dinâmicas que alteram de cor dinamicamente conforme a categoria da notícia focada ou ativa.

### RNF-02: Segurança e Arquitetura de Banco (Supabase)
*   **RLS Ativo**: Row Level Security habilitado em 100% das tabelas expostas.
*   **Segurança de Definer e Views**: Qualquer View SQL que exponha dados do sistema deve utilizar a diretiva `WITH (security_invoker = true)` do PostgreSQL 15+, garantindo que as permissões do usuário que faz a consulta sejam estritamente respeitadas.
*   **Bypass Restrito**: Acesso à `SERVICE_ROLE_KEY` estritamente isolado do lado do cliente (Client Components), rodando exclusivamente em Server Actions protegidas no backend.

### RNF-03: Performance e Responsividade Mobile
*   **Padrão Mobile-First Responsivo**: Tradução fiel das telas de protótipo Stitch (Home, View do Artigo, Archive, Painel Admin, Central de Preferências) para código Next.js responsivo fluido.
*   **PWA Integrado**: Configuração de Service Workers e manifesto web para permitir instalação na tela inicial de smartphones como um aplicativo nativo leve.

---

## 5. Arquitetura do Banco de Dados (PostgreSQL)

O banco de dados hospeda o motor da plataforma. A tabela a seguir descreve a modelagem das entidades core:

```mermaid
erDiagram
    SUBSCRIBERS {
        uuid id PK
        text email UK
        text status "active, unsubscribed"
        uuid unsubscribe_token
        text phone_number "opcional"
        jsonb preferred_categories "['IA', 'Dev']"
        timestamp created_at
    }
    POSTS {
        uuid id PK
        text title
        text url UK
        text content
        text summary
        text source
        integer score
        text category "IA, Dev, Sec, Mercado"
        text status "pending, approved, rejected"
        timestamp created_at
    }
    NEWSLETTERS {
        uuid id PK
        serial edition_number
        text title
        text summary_intro
        jsonb content_json "snapshot imutável"
        text html_content
        text status "draft, published"
        timestamp created_at
        timestamp published_at
    }
    
    SUBSCRIBERS ||--o. NEWSLETTERS : receives
```

---

## 6. Plano de Fases e Backlog

### Fase 1: Sincronização do Banco e Migrations (Imediato)
*   Aplicar a migration `20260423164000_add_phone_to_subscribers.sql` no Supabase via MCP para habilitar suporte a números de WhatsApp e salvamento das preferências de categoria.

### Fase 2: Tradução do Protótipo Stitch para Next.js (Alta Prioridade)
*   Implementar a **Home Feed** com responsividade brutalista (Digital Brutalism) de alto impacto.
*   Implementar a **View de Artigo** camaleão na Web.
*   Criar a interface adaptada para celular do **Admin Dashboard** para aprovar/rejeitar notícias com gestos de deslizar ou botões reativos de 2px de borda sólida.

### Fase 3: Integração do Pipeline de Envio (n8n + WhatsApp)
*   Orquestrar webhook de envio no n8n.
*   Formatar o template de mensagens compactas do WhatsApp enriquecidas com Emojis e links curtos para a Central de Preferências.

### Fase 4: Otimização PWA e Analytics (Evolução)
*   Setup do plugin Next-PWA para habilitação offline das notícias já baixadas.
*   Instalação do painel de métricas no dashboard admin.
