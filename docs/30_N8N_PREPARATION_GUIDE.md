# 🔌 Guia de Preparação e Integração com o n8n

Este guia detalha como configurar e plugar o workflow de automação no **n8n** para alimentar o multiverso do portal **Fresh News** (abrangendo os canais `TECH`, `MUSIC`, `GEAR` e `GAME`).

---

## 1. Conexão com o Supabase (Ingestão & Deduplicação)

O workflow do n8n interage diretamente com o banco de dados Supabase do portal.

### Credenciais do Banco
As credenciais de conexão do Supabase remoto estão configuradas no seu arquivo `.env.local` e devem ser usadas no nó do Supabase do n8n:
* **Host**: `db.vgsjpuxymtkkiaissrky.supabase.co`
* **Database**: `postgres`
* **User**: `postgres` (ou o usuário administrativo que você configurou)
* **Port**: `5432`

---

## 2. Fontes de Dados RSS Ativas (Mapeamento)

Já preparamos e inserimos no banco de dados (`sources`) as fontes RSS iniciais para todos os 4 mundos. O n8n deve ler estas fontes executando:

```sql
SELECT * FROM sources WHERE is_active = true;
```

As fontes cadastradas cobrem a seguinte taxonomia de testes:

| Mundo | Nome da Fonte | URL do Feed RSS | Dica de Categoria (`category_hint`) |
| :--- | :--- | :--- | :--- |
| **`TECH`** | TechCrunch | `https://techcrunch.com/feed/` | `TECH_HACKER` |
| **`TECH`** | The Hacker News | `https://thehackernews.com/feeds/posts/default` | `SECURITY` |
| **`MUSIC`** | Pitchfork (Reviews) | `https://pitchfork.com/rss/reviews/albums/` | `ROCK_INDIE` |
| **`MUSIC`** | Okayplayer | `https://www.okayplayer.com/feeds/feed.rss` | `MUSICA_URBANA` |
| **`GEAR`** | Hackaday | `https://hackaday.com/blog/feed/` | `RAW_HARDWARE` |
| **`GEAR`** | Everyday Carry | `https://everydaycarry.com/feed` | `EDC` |
| **`GEAR`** | Motorsport F1 | `https://www.motorsport.com/rss/f1/news/` | `GEARHEAD` |
| **`GAME`** | Kotaku | `https://kotaku.com/rss` | `GAME` |
| **`GAME`** | Eurogamer | `https://www.eurogamer.net/feed/news` | `GAME` |

---

## 3. Classificação Agêntica & Taxonomia de Subcategorias

Ao processar cada post raspado com a API Firecrawl, o n8n deve classificá-lo nos seguintes níveis:

```
[Post Ingerido] ──► [Determine World] ──► [IA Triagem/Classificador] ──► [IA Especialista correspondente]
```

### 3.1 Função de Direcionamento de Mundo
O n8n pode usar uma função em JavaScript para classificar o mundo (`world`) com base na dica de categoria (`category_hint`):

```javascript
function determineWorld(categoryHint) {
  const musicHints = [
    'MUSICA_URBANA', 'MUSICA_ELETRONICA', 'VANGUARDA_CRITICA', 
    'CULTURA_BR', 'ROCK_INDIE', 'RAP_HIPHOP', 'MUSIC'
  ];
  const gearHints = [
    'F1_MOTORSPORT', 'RAW_HARDWARE', 'GEARHEAD', 'GEAR'
  ];
  const gameHints = [
    'INDIE_GAME', 'ESPORTS', 'HARDWARE_CONSOLE', 'GAME'
  ];
  
  const hint = (categoryHint || '').toUpperCase();
  if (musicHints.includes(hint)) return 'MUSIC';
  if (gearHints.includes(hint)) return 'GEAR';
  if (gameHints.includes(hint)) return 'GAME';
  return 'TECH'; // Default
}
```

### 3.2 Subcategorias por Mundo

A IA de Triagem do n8n deve mapear as notícias para as seguintes subcategorias válidas:

1. **`TECH`**:
   * `IA`: Inteligência Artificial, LLMs, Machine Learning.
   * `SEC`: Vulnerabilidades, cibersegurança, exploits, hacking.
   * `DEV`: Engenharia de software, linguagens, frameworks, web dev.
   * `CLOUD`: Infraestrutura, cloud computing, SRE, DevOps, serverless.
   * `GERAL`: Notícias gerais.

2. **`MUSIC`**:
   * `HIP_HOP`: Cultura urbana, rap, beats, amostragem de som (sampling).
   * `ROCK_INDIE`: Rock alternativo, indie, guitarras, fanzine DIY.
   * `ELECTRONICA`: Eletrônica, techno, DJs, sintetizadores modulares.
   * `CULTURA_BR`: Música e tendências da cultura nacional brasileira.
   * `GERAL`: Notícias musicais genéricas.

3. **`GEAR`**:
   * `RAW_HARDWARE`: Soldagem de circuitos, Arduino/Raspberry Pi, hardware hacker.
   * `GEARHEAD`: Engenharia mecânica, Fórmula 1, automobilismo, motores.
   * `EDC`: Everyday Carry, ferramentas utilitárias, ligas de titânio, relógios.
   * `GERAL`: Design industrial de produto e engenharia geral.

4. **`GAME`**:
   * `INDIE_GAME`: Desenvolvimento de jogos independentes, Godot/Unity, pixel art.
   * `RETRO_PLAYER`: Emulação, consoles clássicos 8-bit/16-bit, nostalgia gamer.
   * `ESPORTS_COACH`: Cenário competitivo de esports, meta-game, balanceamento de regras.
   * `TECH_CONSOLE`: Ray tracing, GPUs de última geração, benchmarks gráficos, silício.
   * `GERAL`: Lançamentos e notícias do mercado de jogos.

---

## 4. Estrutura de Inserção no Supabase (`public.posts`)

Para cada post processado e gerado pela IA especialista, insira-o na tabela `posts` com o mapeamento de campos a seguir:

| Campo Postgres | Valor gerado pela automação | Tipo | Exemplo |
| :--- | :--- | :--- | :--- |
| `title` | Título brutalista limpo gerado pela IA | `text` | `"O Limite do Silício: Ray Tracing em Consoles Retrô"` |
| `url` | Link original do feed RSS | `text` (Unique) | `https://eurogamer.net/example-article` |
| `content` | Conteúdo completo limpo extraído pelo Firecrawl | `text` | Full Markdown do artigo |
| `summary` | Comentário profundo e analítico da IA especialista | `text` | Resumo analítico de 400-1200 caracteres |
| `score` | Relevância calculada pela IA de 0 a 100 | `integer` | `85` |
| `category` | Categoria de origem da fonte | `text` | `"GAME"` (ou `category_hint`) |
| `sub_category` | Subcategoria específica do nicho correspondente | `text` | `"TECH_CONSOLE"` |
| `world` | Sigla do mundo correspondente | `text` | `"GAME"` |
| `theme_config` | Configuração JSONB de cores e efeitos visuais | `jsonb` | `{"dna": "GAME_VERTICAL", "primary_color": "#0B080F", "accent_color": "#6366F1", "font_style": "Outfit", "ui_effects": ["terminal_glow", "grainy_texture"]}` |
| `whatsapp_summary` | Versão minimalista de mensagem com emoji | `text` | Teaser para disparo no WhatsApp |
| `status` | Status inicial do post para moderação | `text` | `"pending"` |

---

## 5. Gatilhos de Geração Manual via API do Portal

Se o n8n ou um script precisar forçar a geração de um rascunho de newsletter diretamente pelo portal Web, você pode fazer uma chamada HTTP POST para a rota de API:

* **Endpoint**: `/api/generate`
* **Método**: `POST`
* **Query Params / JSON Body**:
  ```json
  {
    "world": "TECH" | "MUSIC" | "GEAR" | "GAME"
  }
  ```

### Resposta de Sucesso:
```json
{
  "success": true,
  "message": "Edição para o mundo GAME gerada com sucesso!",
  "data": { ... }
}
```

---

## 6. Próximos Passos no n8n

1. Crie um novo workflow no n8n.
2. Configure o nó do **Supabase** para ler as fontes.
3. Configure o nó do **HTTP Request** ou **RSS Read** para puxar posts recentes.
4. Adicione lógica de triagem usando nós da **OpenAI** carregando os prompts mapeados no arquivo `lib/services/newsletter.ts` para cada mundo.
5. Salve os posts gerados de volta no Supabase como `status = 'pending'`.
