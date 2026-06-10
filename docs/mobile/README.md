# 📱 Fresh News Mobile — Painel Central & Fluxo de Desenvolvimento

Este diretório centraliza o planejamento e a execução do aplicativo móvel **Fresh News**, desenvolvido em **Flutter** para Android e iOS. 

O desenvolvimento é feito de forma colaborativa entre o grupo de **3 integrantes**, onde cada um é responsável por especificar as telas e funcionalidades via prompts estruturados em arquivos markdown (`step_X.md`).

---

## 👥 Fluxo de Trabalho do Grupo

```
┌────────────────────────────────┐
│   Membro do Grupo              │
│   Preenche o prompt e          │
│   requisitos em step_X.md      │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│   Operador (Lan)               │
│   Inicia a IA e diz:           │
│   "Execute a tarefa de step_X" │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│   Antigravity (IA)             │
│   Lê step_X.md, gera o código,  │
│   roda e valida a etapa        │
└────────────────────────────────┘
```

1. **Definição de Responsabilidade**: Um integrante do grupo assume um passo (ex: `step_2_auth.md`).
2. **Edição do Passo**: O integrante edita o arquivo de passo correspondente, preenchendo a seção **`[PROMPT PARA A IA]`** com o prompt detalhado e descrevendo os requisitos específicos ou de design na seção de requisitos.
3. **Solicitação de Execução**: O operador (Lan) abre o terminal com a IA Antigravity e pede para ela executar a tarefa descrita no arquivo.
4. **Execução e Atualização**: A IA lê a especificação, implementa os arquivos no projeto Flutter, testa e atualiza o status do passo neste painel e no arquivo de tarefas (`task.md`).

---

## 🚦 Status dos Passos (Steps)

| Passo | Módulo / Funcionalidade | Responsável | Status | Data de Conclusão |
| :--- | :--- | :--- | :--- | :--- |
| **[Step 1](file:///home/lan/tech-news-platform/docs/mobile/step_1_setup.md)** | Setup Inicial, Supabase & DI | *A definir* | 🔴 Pendente | — |
| **[Step 2](file:///home/lan/tech-news-platform/docs/mobile/step_2_auth.md)** | Autenticação, Cadastro & Preferências | *A definir* | 🔴 Pendente | — |
| **[Step 3](file:///home/lan/tech-news-platform/docs/mobile/step_3_feed.md)** | Feed Principal (TECH/MUSIC) & Chameleon Theme | *A definir* | 🔴 Pendente | — |
| **[Step 4](file:///home/lan/tech-news-platform/docs/mobile/step_4_reader.md)** | Leitor Brutalista & Debate de IAs | *A definir* | 🔴 Pendente | — |
| **[Step 5](file:///home/lan/tech-news-platform/docs/mobile/step_5_notifications.md)** | Push Notifications & Polimento Final | *A definir* | 🔴 Pendente | — |

---

## 🎨 Diretrizes Arquiteturais & Design System Mobile

Para garantir que o código gerado seja consistente, limpo e siga o mesmo padrão de qualidade em todos os passos, a IA seguirá estritamente as regras de arquitetura abaixo:

### 1. Organização de Pastas (Feature-First)
Todo o código dentro de `/mobile/lib/` será organizado por funcionalidades (*features*):
```
mobile/lib/
  ├── features/
  │     ├── auth/          # Login, cadastro, termos e perfil do assinante
  │     ├── feed/          # Listagem de posts, switch de mundos (TECH/MUSIC)
  │     └── reader/        # Leitor imersivo com painel do debate de IAs
  ├── shared/
  │     ├── theme/         # Chameleon Theme (Cores HSL brutais, Scanlines, Fontes)
  │     ├── widgets/       # Botões brutalistas retos, bordas pretas grossas, etc.
  │     └── services/      # Inicializador do Supabase e interfaces de repositórios
  └── main.dart            # Ponto de entrada e configuração do App
```

### 2. Gerenciamento de Estado & DI
* **Provider**: Utilizado para gerenciar estados locais e globais (ex: tema ativo, feed de notícias, estado de login).
* **GetIt**: Usado para Injeção de Dependência rápida e desacoplada (clientes de API, repositórios).

### 3. Design System (Brutalismo Camaleão)
O aplicativo deve trazer a mesma identidade visual da versão Web para o celular:
* **Tipografia**: Uso da fonte **Space Grotesk** (via Google Fonts ou assets).
* **Bordas & Sombras**: Bordas sólidas e pretas grossas (`border: Border.all(color: Colors.black, width: 2.5)`), sem cantos arredondados suavizados (cantos retos ou com raios mínimos de 4px), e sombras duras deslocadas (`boxShadow` com offset sem blur).
* **Chameleon Color System**: O app deve ler a configuração `theme_config` vinda do post (ou da subcategoria) e pintar a barra de destaque e os botões de acordo com o HSL retornado:
  - `TECH`: Neon Green (`#22C55E` ou similar)
  - `HIP_HOP`: Gold (`#EAB308`)
  - `ROCK_INDIE`: Red (`#DC2626`)
  - `ELECTRONICA`: Purple (`#A855F7`)

---

## 📡 Integração com Supabase

O aplicativo móvel irá consumir as seguintes tabelas do banco de dados remoto do Supabase:
* **`subscribers`**: Para verificar preferências de leitura (`preferences`), mundos ativos (`active_worlds`) e autenticar o leitor.
* **`posts`**: Para listar o feed de notícias, respeitando o filtro de `world` (`TECH` ou `MUSIC`), `status = 'published'` e ordenado por `score` ou data.
* **`newsletters`**: Para puxar o debate das IAs (`debate_log`) e o resumo unificado da edição do multiverso.
