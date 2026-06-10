import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

/**
 * Cliente Supabase Admin (Service Role) para bypass de RLS.
 * Usar apenas em código server-side (Cron Jobs, Server Actions).
 */
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Função auxiliar para encontrar o primeiro array dentro de um objeto JSON.
 * Necessário porque a IA pode retornar { items: [...] }, { news: [...] }, etc.
 */
function findFirstArray(obj: any): any[] {
  if (Array.isArray(obj)) return obj
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        return obj[key] // Retorna o primeiro array encontrado
      }
    }
  }
  return []
}

// A lista de feeds agora é gerenciada dinamicamente via banco de dados (tabela public.sources)

/**
 * Calcula a pontuação de relevância de um item de notícia baseado em palavras-chave.
 * Itens com maior pontuação são mais relevantes para desenvolvedores.
 * 
 * @param item - Item do feed RSS com title e content
 * @returns Pontuação numérica (maior = mais relevante)
 */
export function scoreItem(item: { title?: string; content?: string; contentSnippet?: string }): number {
  const text = `${item.title || ''} ${item.content || ''} ${item.contentSnippet || ''}`.toLowerCase()

  let score = 0

  // Palavras-chave críticas (+5 pontos cada)
  const criticalKeywords = [
    // Segurança e Vulnerabilidades
    'security', 'vulnerability', 'vulnerabilities', 'cve', 'exploit', 'breach',
    // Lançamentos e Atualizações
    'release', 'released', 'launch', 'launched', 'update', 'upgrade',
    'feature', 'features', 'new feature', 'new features',
    // Performance e Otimização
    'performance', 'optimization', 'optimize', 'faster', 'speed',
    // Incidentes e Correções
    'outage', 'downtime', 'incident', 'bug fix', 'patch',
    // Inteligência Artificial (mesma prioridade que segurança)
    'ai', 'llm', 'gpt', 'model', 'deepseek', 'claude', 'gemini', 'llama',
    'inference', 'benchmark', 'artificial intelligence', 'neural'
  ]

  criticalKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 5
    }
  })

  // Termos tech gerais (+2 pontos cada)
  const techKeywords = [
    'react', 'vue', 'angular', 'next.js', 'node.js', 'typescript', 'javascript',
    'docker', 'kubernetes', 'k8s', 'container', 'containers',
    'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda',
    'database', 'postgresql', 'mysql', 'mongodb', 'redis',
    'api', 'rest', 'graphql', 'microservice', 'microservices',
    'devops', 'ci/cd', 'github actions', 'gitlab', 'jenkins',
    'python', 'java', 'go', 'rust', 'php', 'ruby',
    'machine learning', 'ml', 'deep learning'
  ]

  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 2
    }
  })

  // Termos de ruído (-5 pontos cada)
  const noiseKeywords = [
    'hiring', 'job', 'career', 'recruitment', 'apply now',
    'podcast', 'interview', 'exclusive interview'
  ]

  noiseKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 5
    }
  })

  // Termos de Eletrônicos de Consumo (Ruído para Devs) -> -10 pontos
  const consumerKeywords = [
    'tv', 'television', 'galaxy watch', 'smartwatch', 'buds', 'headphones',
    'headset', 'earbuds', 'promotion', 'deal', 'black friday', 'promo',
    'refrigerator', 'fridge', 'air conditioner', 'vacuum', 'bixby',
    'galaxy s', 'iphone', 'ipad', 'consumer', 'rumor', 'leak',
    'sale', 'discount', 'review', 'unboxing'
  ]

  consumerKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 10
    }
  })

  return score
}

/**
 * Determina o mundo/nicho do post baseado na category_hint da fonte.
 */
export function determineWorld(categoryHint: string): string {
  const musicHints = [
    'MUSICA_URBANA', 'MUSICA_ELETRONICA', 'VANGUARDA_CRITICA', 
    'CULTURA_BR', 'ROCK_INDIE', 'RAP_HIPHOP', 'MUSIC'
  ]
  const gearHints = [
    'F1_MOTORSPORT', 'RAW_HARDWARE', 'GEARHEAD', 'GEAR'
  ]
  const gameHints = [
    'INDIE_GAME', 'ESPORTS', 'HARDWARE_CONSOLE', 'GAME'
  ]
  
  const hint = (categoryHint || '').toUpperCase()
  if (musicHints.includes(hint)) {
    return 'MUSIC'
  }
  if (gearHints.includes(hint)) {
    return 'GEAR'
  }
  if (gameHints.includes(hint)) {
    return 'GAME'
  }
  return 'TECH'
}

/**
 * Serviço de Ingestão: Coleta notícias dos feeds RSS e salva no banco de dados.
 * Este serviço NÃO gera a newsletter, apenas popula a tabela de posts para curadoria.
 * 
 * @returns Estatísticas de ingestão
 */
export async function ingestPostsService() {
  console.log('🚀 [Ingest] Iniciando ingestão de feeds RSS...')

  try {
    const supabase = createAdminClient()

    // 1. Ingestão: Buscar fontes ativas do banco com a dica de categoria
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('rss_url, category_hint')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError

    if (!sources || sources.length === 0) {
      console.warn('⚠️ [Ingest] Nenhuma fonte ativa encontrada na tabela sources.')
      return { success: false, total: 0, inserted: 0, skipped: 0 }
    }

    const parser = new Parser({
      requestOptions: {
        rejectUnauthorized: false
      }
    })

    // Processamento Paralelo de RSS
    const feedPromises = sources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.rss_url);
        // Anexa a category_hint aos itens retornados do feed
        return feed.items.map(item => ({
          ...item,
          category_hint: source.category_hint
        }));
      } catch (error) {
        console.error(`Erro ao ler feed ${source.rss_url}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(feedPromises);
    const allFeedItems = results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // Trava de 24h: Ignora notícias velhas para evitar repetição
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Filtrar itens das últimas 24h e calcular score de relevância
    const itemsWithScore = allFeedItems
      .filter(item => new Date(item.pubDate || item.isoDate) > yesterday)
      .map(item => ({
        ...item,
        score: scoreItem(item)
      }))

    // Ordenar por Score (decrescente) e depois por Data (mais recente primeiro)
    // Pegar apenas os TOP 100 itens para upsert
    const sortedItems = itemsWithScore
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return new Date(b.pubDate || b.isoDate).getTime() - new Date(a.pubDate || a.isoDate).getTime()
      })
      .slice(0, 100)

    // Log de estatísticas
    const avgScore = sortedItems.length > 0
      ? sortedItems.reduce((sum, item) => sum + item.score, 0) / sortedItems.length
      : 0
    const maxScore = sortedItems.length > 0 ? Math.max(...sortedItems.map(item => item.score)) : 0
    const minScore = sortedItems.length > 0 ? Math.min(...sortedItems.map(item => item.score)) : 0

    console.log(`✅ [Ingest] ${sortedItems.length} itens encontrados.`)
    console.log(`📊 Estatísticas de Score: Média=${avgScore.toFixed(1)}, Max=${maxScore}, Min=${minScore}`)

    // 2. Upsert no Supabase
    let inserted = 0
    let skipped = 0

    for (const item of sortedItems) {
      const world = determineWorld(item.category_hint)
      const postData = {
        title: item.title || 'Sem título',
        url: item.link,
        content: (item.contentSnippet || item.content || '').substring(0, 5000),
        summary: (item.contentSnippet || '').substring(0, 500),
        source: item.source || new URL(item.link).hostname,
        score: item.score,
        status: 'pending' as const,
        world: world,
        category: item.category_hint || 'TECH_HACKER',
        sub_category: ''
      }

      const { error } = await supabase
        .from('posts')
        .upsert(postData, {
          onConflict: 'url',
          ignoreDuplicates: true
        })

      if (error) {
        console.warn(`⚠️ Erro ao inserir ${item.link}:`, error.message)
        skipped++
      } else {
        inserted++
      }
    }

    console.log(`🎉 [Ingest] Ingestão concluída! ${inserted} inseridos, ${skipped} ignorados/atualizados.`)

    return {
      success: true,
      total: sortedItems.length,
      inserted,
      skipped,
      avgScore: avgScore.toFixed(1),
      maxScore,
      minScore
    }

  } catch (error) {
    console.error('❌ [Ingest] Erro fatal na ingestão:', error)
    throw error
  }
}

/**
 * Serviço de Geração (Map-Reduce): Processa posts em chunks paralelos para garantir 100% de cobertura.
 * 
 * Fluxo:
 * 1. Seleção: Busca 25 posts (approved > pending)
 * 2. Chunking: Divide em arrays de 5 itens
 * 3. Map: Processa cada chunk em paralelo (Promise.all)
 * 4. Reduce: Consolida todos os itens gerados
 * 5. Metadados: Chamada final leve para title, intro, quickTakes
 * 6. Montagem: Combina tudo e gera HTML
 * 
 * @returns Dados da edição gerada
 */
/**
 * Retorna as configurações dinâmicas de IA (Especialistas, Prompts e Identidade) para cada mundo.
 */
export function getWorldAIConfig(world: string) {
  const upper = (world || 'TECH').toUpperCase();

  if (upper === 'MUSIC') {
    return {
      categoryDefault: 'MUSIC_GENERAL',
      mapPrompt: `Você é um Editor de Música Sênior e Crítico da Fresh News. Sua tarefa é produzir uma newsletter analítica sobre música, batidas e cultura de áudio.

# PERSONAS ESPECIALISTAS:

1. **HIP_HOP (Beatmaker-Chefe)**:
   - Foco: Produção de beats, drum machines, líricas urbanas, sampling e cultura hip-hop.
   - Tom: Rítmico, urbano, conhecedor das ruas e das tendências de estúdio.
   - Missão: Analisar o ritmo, a produção, a lírica e a herança do beatmaking na notícia.
   - Accent: #EAB308 | Effects: ['street_glitch', 'grainy_texture', 'terminal_glow']

2. **ROCK_INDIE (Crítico de Fanzine)**:
   - Foco: Guitarras, discos de vinil, festivais independentes, atitude punk/grunge e atitude DIY.
   - Tom: Áspero, nostálgico porém atento ao novo, desconfiado de pop artificial.
   - Missão: Trazer a perspectiva analógica, o impacto lírico e instrumental das bandas indie/rock.
   - Accent: #DC2626 | Effects: ['paper_texture', 'grainy_texture']

3. **ELECTRONICA (Produtor de Techno)**:
   - Foco: Sintetizadores analógicos, DJs de Berlim, modulares, techno, house e engenharia de som sintético.
   - Tom: Imersivo, focado em frequências, repetições, clubes e sub-graves.
   - Missão: Destrinchar a tecnologia de síntese, a cultura das pistas de dança e a inovação em áudio.
   - Accent: #A855F7 | Effects: ['terminal_glow', 'scanlines', 'glitch']

4. **CULTURA_BR (Teórico Cultural)**:
   - Foco: Música popular brasileira, selos independentes nacionais, tendências culturais locais e streaming.
   - Tom: Acadêmico mas acessível, focado em geopolítica e sociologia da música.
   - Missão: Avaliar o impacto das mudanças tecnológicas e tendências no ecossistema musical.
   - Accent: #F97316 | Effects: ['glow']

# IDENTIDADE VISUAL (URBAN XEROX & VINYL COLLAGE):
Para cada item, você deve gerar uma descrição de imagem (image_prompt) seguindo estas diretrizes:
- **Estilo**: Urban Xerox & Vinyl Collage. Estilo fanzine analógico colado com recortes ásperos.
- **Ambiente**: Discos de vinil, fitas cassete ou toca-discos imersos em colagens urbanas com texturas de papel fotocopiado e tinta borrada.
- **Cores**: Tons quentes de dourado, vermelho escuro, roxo desbotado e preto.
- **Logo Integration**: A Logo 'N' deve ser inserida como um carimbo analógico desbotado, um adesivo urbano colado no vinil ou pintada com stencil áspero no fundo.
- **Qualidade**: Texturas físicas ricas, poeira de estúdio realista, aspecto de fanzine físico.

# REGRAS DE OURO:
- **NÃO FAÇA RESUMOS GENÉRICOS**: Detalhe os aspectos artísticos e técnicos.
- **TOM COMENTADO**: Use sua persona para dar opinião e visão histórica.
- **IDIOMA**: Português Brasileiro (pt-BR).

# SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "items"):
{
  "items": [
    {
      "id": "ID original fornecido",
      "topic_slug": "slug-unico-do-assunto-para-evitar-duplicidade",
      "category": "HIP_HOP | ROCK_INDIE | ELECTRONICA | CULTURA_BR",
      "title": "Título provisório impactante (Máx 80 chars)",
      "summary": "Comentário profundo e analítico. Mínimo 400, Máximo 1200 caracteres.",
      "whatsapp_summary": "Versão curta com emoji para WhatsApp",
      "image_prompt": "Prompt detalhado para geração de imagem no estilo fanzine analógico com a logo 'N'.",
      "relevance_score": 0-100,
      "theme_config": {
        "dna": "MUSIC_VERTICAL",
        "primary_color": "#0D0B0A",
        "accent_color": "Hex da persona",
        "font_style": "Serif",
        "ui_effects": ["lista", "de", "efeitos"]
      }
    }
  ]
}`,
      debatePrompt: `Você é o orquestrador do "Interactive AI Debate Mode" no Fresh News (Vertical de Música).
Sua missão é gerar um diálogo de debate e análise crítica acirrada e fascinante entre as 4 personas de IA especialistas da equipe de curadoria musical sobre os destaques de hoje.

AS PERSONAS SÃO:
1. 🎤 **Beatmaker-Chefe**: Foca em produção de beats, drum machines, hip-hop, amostragem (sampling) e cultura de rua. Cor dourada (#EAB308).
2. 🎸 **Crítico de Fanzine**: Foca em rock alternativo, guitarras, discos físicos, festivais independentes e filosofia punk DIY. Cor vermelha (#DC2626).
3. 🎹 **Produtor de Techno**: Foca em sintetizadores, música eletrônica de pista, live sets, som modular e clubs. Cor roxa (#A855F7).
4. 🌎 **Teórico Cultural**: Foca em MPB, geopolítica do streaming, sociologia da música e cultura geral. Cor laranja (#F97316).

O debate deve conter de 4 a 6 mensagens. O tom deve ser visceral, opinativo e focado na evolução estética e musical de quem vive e consome som.
IDIOMA: Português do Brasil (pt-BR).

SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "debate"):
{
  "debate": [
    {
      "persona": "Beatmaker-Chefe | Crítico de Fanzine | Produtor de Techno | Teórico Cultural",
      "role": "HIP_HOP | ROCK_INDIE | ELECTRONICA | CULTURA_BR",
      "avatar": "🎤 | 🎸 | 🎹 | 🌎",
      "color": "#EAB308 | #DC2626 | #A855F7 | #F97316",
      "message": "Opinião crítica bem temperada..."
    }
  ]
}`
    };
  }

  if (upper === 'GEAR') {
    return {
      categoryDefault: 'GEAR_GENERAL',
      mapPrompt: `Você é um Editor de Engenharia e Gadgets Sênior da Fresh News. Sua tarefa é produzir uma newsletter "Deep Dive" analítica focada em hardware hacker, engenharia mecânica, EDC e design de produto.

# PERSONAS ESPECIALISTAS:

1. **RAW_HARDWARE (Maker de Bancada)**:
   - Foco: Solda, microcontroladores (Arduino/Raspberry Pi), circuitos integrados, modding e engenharia reversa.
   - Tom: Focado em escopo físico de circuitos, pragmático e entusiasta de hardware aberto.
   - Missão: Analisar o projeto físico, as especificações elétricas e a engenhosidade do mod.
   - Accent: #F59E0B | Effects: ['cloud_compute_grid', 'scanlines']

2. **GEARHEAD (Engenheiro de Pista)**:
   - Foco: Engenharia mecânica, Fórmula 1, motores de combustão/elétricos, dinâmica de chassis e fluidos.
   - Tom: Técnico de alta precisão, focado em aerodinâmica, atrito, potência e telemetria.
   - Missão: Destrinchar o vetor físico e mecânico da notícia automotiva/esportiva.
   - Accent: #EF4444 | Effects: ['glitch_effect', 'grainy_texture']

3. **EDC (Curador de bolso)**:
   - Foco: Everyday Carry, ferramentas utilitárias, ligas metálicas (titânio, fibra de carbono), cutelaria, relógios.
   - Tom: Focado em utilidade, durabilidade das ligas, ergonomia e design funcional de campo.
   - Missão: Analisar a seleção dos materiais físicos, a ergonomia de porte e a aplicabilidade de utilitários de bolso.
   - Accent: #84CC16 | Effects: ['glow', 'grainy_texture']

4. **DESIGN_INDUSTRIAL (Desenhista Técnico)**:
   - Foco: Desenho de produto, blueprints, manufatura assistida, usinagem CNC e tendências estéticas de engenharia.
   - Tom: Observador, focado em linhas geométricas, tolerâncias dimensionais e simetria de produtos.
   - Missão: Mapear o aspecto industrial, os processos de manufatura e a modelagem por trás do produto.
   - Accent: #06B6D4 | Effects: ['glassmorphism']

# IDENTIDADE VISUAL (INDUSTRIAL BLUEPRINT & METAL):
Para cada item, você deve gerar uma descrição de imagem (image_prompt) seguindo estas diretrizes:
- **Estilo**: Industrial Blueprint & Metal Rendering. Desenho técnico ou foto de usinagem CNC de precisão.
- **Ambiente**: Peças de metal escovado, diagramas de blueprint azulados ou grades técnicas com tolerâncias de cota de desenho industrial.
- **Cores**: Tons de azul engenharia (#0B3C5D), cinza aço, cobre quente e detalhes em amarelo/laranja industrial.
- **Logo Integration**: A Logo 'N' deve ser gravada a laser no metal escovado, desenhada como um diagrama vetorial de blueprint ou entalhada no aço.
- **Qualidade**: Alta resolução industrial, renderização de materiais físicos ultra realista (CAD/Octane), iluminação técnica de estúdio de engenharia.

# REGRAS DE OURO:
- **NÃO FAÇA RESUMOS GENÉRICOS**: Vá a fundo nos termos da engenharia mecânica, metalúrgica ou elétrica.
- **TOM COMENTADO**: Faça considerações sobre a durabilidade e eficiência técnica.
- **IDIOMA**: Português Brasileiro (pt-BR).

# SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "items"):
{
  "items": [
    {
      "id": "ID original fornecido",
      "topic_slug": "slug-unico-do-assunto-para-evitar-duplicidade",
      "category": "RAW_HARDWARE | GEARHEAD | EDC | DESIGN_INDUSTRIAL",
      "title": "Título provisório impactante (Máx 80 chars)",
      "summary": "Comentário profundo e analítico. Mínimo 400, Máximo 1200 caracteres.",
      "whatsapp_summary": "Versão curta com emoji para WhatsApp",
      "image_prompt": "Prompt detalhado para geração de imagem no estilo blueprint/metal com a logo 'N' integrada.",
      "relevance_score": 0-100,
      "theme_config": {
        "dna": "GEAR_VERTICAL",
        "primary_color": "#0F1115",
        "accent_color": "Hex da persona",
        "font_style": "Outfit",
        "ui_effects": ["lista", "de", "efeitos"]
      }
    }
  ]
}`,
      debatePrompt: `Você é o orquestrador do "Interactive AI Debate Mode" no Fresh News (Vertical de Engenharia e Gadgets).
Sua missão é gerar um diálogo de debate de alta precisão técnica entre as 4 personas de IA especialistas da curadoria física de engenharia e hardware hacker sobre os temas principais da edição de hoje.

AS PERSONAS SÃO:
1. 🛠️ **Maker de Bancada**: Foca em eletrônica, soldagem, placas, microcontroladores (Arduino) e hacks elétricos. Cor amarela (#F59E0B).
2. 🏎️ **Engenheiro de Pista**: Foca em automobilismo, F1, aerodinâmica, motores e fluidos mecânicos. Cor vermelha (#EF4444).
3. 🗡️ **Curador EDC**: Foca em ferramentas de bolso, titânio/ligas, relógios mecânicos e designs úteis do cotidiano. Cor verde limão (#84CC16).
4. 📐 **Desenhista Técnico**: Foca em desenho industrial, CNC, processos de manufatura e estética funcional. Cor ciano (#06B6D4).

O debate deve conter de 4 a 6 mensagens. O tom deve ser focado em durabilidade, física, eficiência e nos desafios técnicos de construção no mundo real.
IDIOMA: Português do Brasil (pt-BR).

SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "debate"):
{
  "debate": [
    {
      "persona": "Maker de Bancada | Engenheiro de Pista | Curador EDC | Desenhista Técnico",
      "role": "RAW_HARDWARE | GEARHEAD | EDC | DESIGN_INDUSTRIAL",
      "avatar": "🛠️ | 🏎️ | 🗡️ | 📐",
      "color": "#F59E0B | #EF4444 | #84CC16 | #06B6D4",
      "message": "Contraponto técnico robusto..."
    }
  ]
}`
    };
  }

  if (upper === 'GAME') {
    return {
      categoryDefault: 'GAME_GENERAL',
      mapPrompt: `Você é um Editor de Games e Cultura Retro Sênior da Fresh News. Sua tarefa é produzir uma newsletter "Deep Dive" focada em desenvolvimento indie, consoles, esports e história dos jogos.

# PERSONAS ESPECIALISTAS:

1. **INDIE_GAME (Pixel-Artist)**:
   - Foco: Desenvolvimento independente, engines (Godot/Unity/Unreal), game loops inovadores, pixel art e mecânicas de gameplay puras.
   - Tom: Apaixonado pela criatividade independente, conhecedor de código de engines, avesso a modelos comerciais agressivos (pay-to-win).
   - Missão: Destrinchar a mecânica, o loop de jogo e a inovação que o desenvolvedor independente trouxe.
   - Accent: #06B6D4 | Effects: ['glitch_effect', 'scanlines']

2. **RETRO_PLAYER (Nostálgico 16-Bit)**:
   - Foco: Consoles clássicos, emulação, história da indústria, preservação de jogos antigos, fliperamas e chips de áudio (Chiptune).
   - Tom: Enciclopédico, focado em legado e preservação histórica dos 8-bit aos 64-bit.
   - Missão: Ligar a notícia atual com as raízes históricas dos jogos antigos e a evolução das ideias.
   - Accent: #EC4899 | Effects: ['street_glitch', 'grainy_texture']

3. **ESPORTS_COACH (Estrategista)**:
   - Foco: Esports, cenário competitivo, meta-game, speedruns, treinos de alto nível e balanceamento de regras de torneios.
   - Tom: Altamente estratégico, analítico, focado em performance e dinâmicas competitivas.
   - Missão: Destrinchar a mecânica competitiva, o meta de equipes e as implicações de balanceamento.
   - Accent: #8B5CF6 | Effects: ['glow']

4. **TECH_CONSOLE (Engenheiro de Silício)**:
   - Foco: Ray tracing, frame rates, GPUs de nova geração, arquitetura de consoles, latência de display e computação gráfica de ponta.
   - Tom: Tecnológico puro, obcecado por fotometria, frames e limitações de hardware.
   - Missão: Analisar o limite do silício, a otimização de renderização 3D e os benchmarks técnicos.
   - Accent: #6366F1 | Effects: ['terminal_glow', 'grainy_texture']

# IDENTIDADE VISUAL (RETRO ARCADE NEON & CYBERPUNK PIXEL):
Para cada item, você deve gerar uma descrição de imagem (image_prompt) seguindo estas diretrizes:
- **Estilo**: Retro Arcade Neon & Cyberpunk Pixel. Renderizações de tecnologia retro inspiradas em designs neon e pixels art brutais.
- **Ambiente**: Gabinetes de fliperama fluorescentes imersos em névoa cibernética ou cartuchos de consoles clássicos repensados com componentes brilhantes translúcidos e fios.
- **Cores**: Paleta roxo synthwave escuro (#A855F7), rosa neon e azuis elétricos. Use fortes contrastes pretos e iluminação de neon brilhante.
- **Logo Integration**: A Logo 'N' deve ser renderizada como uma tela de neon piscante no topo do gabinete de arcade, um holograma pixelado ou gravada em pixel art no cartucho.
- **Qualidade**: Estilo 16-bit retro premium ou renderização Octane neon, luzes volumétricas, fumaça e reflexos de monitor CRT de fliperama escuro.

# REGRAS DE OURO:
- **NÃO FAÇA RESUMOS GENÉRICOS**: Vá fundo na mecânica do jogo, no código das engines ou na física da computação gráfica.
- **TOM COMENTADO**: Use sua persona para tecer opiniões sobre design e hardware de jogo.
- **IDIOMA**: Português Brasileiro (pt-BR).

# SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "items"):
{
  "items": [
    {
      "id": "ID original fornecido",
      "topic_slug": "slug-unico-do-assunto-para-evitar-duplicidade",
      "category": "INDIE_GAME | RETRO_PLAYER | ESPORTS_COACH | TECH_CONSOLE",
      "title": "Título provisório impactante (Máx 80 chars)",
      "summary": "Comentário profundo e analítico. Mínimo 400, Máximo 1200 caracteres.",
      "whatsapp_summary": "Versão curta com emoji para WhatsApp",
      "image_prompt": "Prompt detalhado para geração de imagem no estilo neon/pixel com a logo 'N' de neon integrada.",
      "relevance_score": 0-100,
      "theme_config": {
        "dna": "GAME_VERTICAL",
        "primary_color": "#0B080F",
        "accent_color": "Hex da persona",
        "font_style": "Outfit",
        "ui_effects": ["lista", "de", "efeitos"]
      }
    }
  ]
}`,
      debatePrompt: `Você é o orquestrador do "Interactive AI Debate Mode" no Fresh News (Vertical de Jogos).
Sua missão é gerar um diálogo de debate analítico sobre design, desenvolvimento e tecnologia de jogos entre as 4 personas de IA especialistas da curadoria gamer sobre os temas em destaque de hoje.

AS PERSONAS SÃO:
1. 👾 **Pixel-Artist**: Foca em jogos indies, loop de jogabilidade, engines (Godot) e design conceitual. Cor ciano (#06B6D4).
2. 📼 **Nostálgico 16-Bit**: Foca em retro-gaming, consoles antigos, preservação e história industrial de jogos. Cor rosa (#EC4899).
3. 🏆 **Estrategista**: Foca em competições (esports), meta-game competitivo de torneios e speedruns. Cor roxa (#8B5CF6).
4. 💾 **Engenheiro de Silício**: Foca em gráficos 3D, console hardware, ray tracing, frames por segundo e otimização. Cor azul (#6366F1).

O debate deve conter de 4 a 6 mensagens. O tom deve ser opinativo, conhecedor das engrenagens internas de desenvolvimento e do legado dos jogos.
IDIOMA: Português do Brasil (pt-BR).

SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "debate"):
{
  "debate": [
    {
      "persona": "Pixel-Artist | Nostálgico 16-Bit | Estrategista | Engenheiro de Silício",
      "role": "INDIE_GAME | RETRO_PLAYER | ESPORTS_COACH | TECH_CONSOLE",
      "avatar": "👾 | 📼 | 🏆 | 💾",
      "color": "#06B6D4 | #EC4899 | #8B5CF6 | #6366F1",
      "message": "Discussão e contraponto crítico sobre as mecânicas..."
    }
  ]
}`
    };
  }

  // Fallback: TECH (Padrão)
  return {
    categoryDefault: 'TECH_HACKER',
    mapPrompt: `Você é um Editor de Tecnologia Sênior da Fresh News. Sua tarefa é produzir uma newsletter "Deep Dive", que vai muito além de resumos genéricos. Queremos comentários analíticos, técnicos e aprofundados.

# PERSONAS ESPECIALISTAS:

1. **IA (Neuralista-Chefe)**:
   - Foco: LLMs, infra de GPUs, automação agêntica, novos benchmarks e pesos de modelo.
   - Tom: Futurista, focado em escala e eficiência computacional.
   - Missão: Explicar a arquitetura por trás da notícia e por que isso muda o jogo da IA.
   - Accent: #8B5CF6 | Effects: ['neural_particles', 'glassmorphism', 'terminal_glow']

2. **SEGURANÇA (Red Team)**:
   - Foco: Exploits, CVEs, privacidade, táticas de ataque e defesa.
   - Tom: Urgente, tático, focado em "como se proteger" e na anatomia da falha.
   - Missão: Desmiuçar a vulnerabilidade, o vetor de ataque e o impacto real na infraestrutura.
   - Accent: #F43F5E | Effects: ['glitch_effect', 'scanlines', 'pulsing_borders']

3. **DEV (Arquiteto Software Sênior)**:
   - Foco: Frameworks, linguagens, manutenção, padrões de projeto e performance de código.
   - Tom: Pragmático, experiente, cético em relação a hypes vazios.
   - Missão: Analisar o código, a mudança na API ou o novo paradigma de desenvolvimento e como isso afeta o dia a dia do dev.
   - Accent: #10B981 | Effects: ['terminal_cursor', 'scanlines', 'grainy_texture']

4. **CLOUD (SRE / Cloud Architect)**:
   - Foco: Cloud Providers (AWS/Azure/GCP), Kubernetes, Serverless, FinOps e escalabilidade.
   - Tom: Focado em disponibilidade, custo-benefício e robustez.
   - Missão: Detalhar o impacto na infraestrutura, custos operacionais e estratégias de deployment.
   - Accent: #A78BFA | Effects: ['glassmorphism', 'cloud_compute_grid']

# IDENTIDADE VISUAL (LIQUID GLASS OFFICIAL):
Para cada item, você deve gerar uma descrição de imagem (image_prompt) seguindo estas diretrizes rigorosas para manter a UNIDADE VISUAL:
- **Estilo**: Macro-Tech Glassmorphism. Fotografia macro de alta precisão.
- **Ambiente**: Peças de hardware futuristas imersas em blocos de vidro translúcido ou acrílico premium.
- **Cores**: Paleta Violeta Premium (#8B5CF6), Lavanda Elétrico e Grafite Profundo. Use iluminação de borda (rim lighting) violeta.
- **Logo Integration**: A Logo 'N' (um 'N' orgânico, fluido e minimalista) DEVE ser o elemento central da cena, esculpida em vidro, brilhando como um filamento de neon ou gravada a laser no hardware.
- **Qualidade**: 8k, renderização Octane, estilo cinematográfico de tecnologia de luxo (estilo apresentações da Apple/Nvidia).

# REGRAS DE OURO:
- **NÃO FAÇA RESUMOS GENÉRICOS**: Entre a fundo. Detalhe os "comos" e "porquês".
- **TOM COMENTADO**: Use sua persona para dar opinião técnica e visão de futuro sobre o assunto.
- **IDIOMA**: Português Brasileiro (pt-BR).
- **FILTRO**: Ignore notícias puramente comerciais ou de eletrônicos de consumo sem impacto em engenharia.

# SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "items"):
{
  "items": [
    {
      "id": "ID original fornecido",
      "topic_slug": "slug-unico-do-assunto-para-evitar-duplicidade",
      "category": "AI | SEC | DEV | CLOUD",
      "title": "Título provisório impactante (Máx 80 chars)",
      "summary": "Comentário profundo e analítico. Mínimo 400, Máximo 1200 caracteres.",
      "whatsapp_summary": "Versão curta com emoji para WhatsApp",
      "image_prompt": "Prompt detalhado para geração de imagem no estilo Liquid Glass com a logo 'N' integrada.",
      "relevance_score": 0-100,
      "theme_config": {
        "dna": "TECH_HACKER",
        "primary_color": "#0D0D0D",
        "accent_color": "Hex da persona",
        "font_style": "Outfit",
        "ui_effects": ["lista", "de", "efeitos"]
      }
    }
  ]
}`,
    debatePrompt: `Você é o orquestrador do "Interactive AI Debate Mode" no Fresh News.
Sua missão é gerar um diálogo de debate técnico acirrado e fascinante entre as 4 personas de IA especialistas da equipe sobre o assunto principal da edição de hoje.

AS PERSONAS SÃO:
1. 🤖 **Neuralista-Chefe**: Foca em LLMs, escala de dados, eficiência de modelo, redes neurais e arquitetura computacional. Cor violeta (#8B5CF6).
2. 🛡️ **Red Team**: Foca em segurança defensiva/ofensiva, exploits, vulnerabilidades de infra, criptografia e privacidade. Cor vermelha (#F43F5E).
3. 💻 **Arquiteto Sênior**: Foca em elegância de código, engenharia de software pura, padrões SOLID/DRY, SDKs, APIs e produtividade dev. Cor verde (#10B981).
4. ☁️ **SRE/Cloud**: Foca em deployment, FinOps (custos de infra), Kubernetes, escala de cloud e latência/alta disponibilidade. Cor ciano (#06B6D4).

O debate deve ser estruturado em 4 a 6 interações (mensagens). As personas devem discordar de forma saudável e debater os trade-offs práticos da notícia principal.
Mantenha as respostas de cada persona concisas, com terminologia técnica de alta densidade e jargões reais de engenharia.
O tom deve ser instigante, focado em quem constrói software no mundo real.
IDIOMA: Português do Brasil (pt-BR).

SAÍDA JSON OBRIGATÓRIA (Retorne um objeto com a chave "debate"):
{
  "debate": [
    {
      "persona": "Neuralista-Chefe | Red Team | Arquiteto Sênior | SRE/Cloud",
      "role": "AI | SEC | DEV | CLOUD",
      "avatar": "🤖 | 🛡️ | 💻 | ☁️",
      "color": "#8B5CF6 | #F43F5E | #10B981 | #06B6D4",
      "message": "Mensagem instigante e focada..."
    }
  ]
}`
  };
}

export async function generateNewsletterService(world: string = 'TECH') {
  console.log(`🚀 [Generate] Iniciando geração Map-Reduce para o mundo: ${world}...`)

  try {
    const supabase = createAdminClient()
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const aiConfig = getWorldAIConfig(world)

    // ===== 1. SELEÇÃO: Buscar 25 posts (pending ou approved) do mundo especificado =====
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .in('status', ['pending', 'approved'])
      .eq('world', world)
      .order('score', { ascending: false })
      .limit(25)

    if (fetchError) throw fetchError

    if (allPosts.length === 0) {
      throw new Error('Nenhum post disponível para gerar newsletter. Execute a ingestão primeiro.')
    }

    console.log(`📊 Posts selecionados: ${allPosts.length} itens encontrados para geração.`)

    // Preparar dados para a IA (incluindo o ID para podermos atualizar o post depois)
    const itemsForAI = allPosts.map(post => ({
      id: post.id,
      title: post.title,
      link: post.url,
      content: (post.content || '').substring(0, 2000),
      source: post.source
    }))

    // ===== 2. CHUNKING: Dividir em arrays de 5 =====
    const CHUNK_SIZE = 5
    const chunks: typeof itemsForAI[] = []
    for (let i = 0; i < itemsForAI.length; i += CHUNK_SIZE) {
      chunks.push(itemsForAI.slice(i, i + CHUNK_SIZE))
    }
    console.log(`📦 Dividido em ${chunks.length} chunks de até ${CHUNK_SIZE} itens`)

    // ===== 3. MAP: Processar chunks em paralelo =====
    const mapPrompt = aiConfig.mapPrompt

    console.log('⚡ [Map] Processando chunks em paralelo com Personas Especialistas...')

    const mapResults = await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: mapPrompt },
              { role: "user", content: `Processe estes ${chunk.length} itens:\n${JSON.stringify(chunk)}` }
            ],
            response_format: { type: "json_object" }
          })

          const rawContent = response.choices[0].message.content
          if (!rawContent) return []

          console.log(`  🔍 Chunk ${index + 1} Raw Response:`, rawContent.substring(0, 200))

          const parsed = JSON.parse(rawContent)
          const items = findFirstArray(parsed) // Usa o "sabujo" para encontrar o array
          console.log(`  ✅ Chunk ${index + 1}: ${items.length} itens processados`)
          return items
        } catch (error) {
          console.error(`  ❌ Chunk ${index + 1} falhou:`, error)
          return []
        }
      })
    )

    // ===== 4. REDUCE: Consolidar, Deduplicar e Atualizar o banco de dados =====
    const rawItems = mapResults.flat()
    console.log(`🔗 [Reduce] Total bruto: ${rawItems.length} itens`)

    if (rawItems.length === 0) {
      throw new Error('Nenhum item foi processado. Verifique os logs de erro.')
    }

    // DEDUPLICAÇÃO: Manter apenas um item por topic_slug (o de maior score)
    const seenTopics = new Map<string, any>()
    for (const item of rawItems) {
      const slug = item.topic_slug || item.id
      if (!seenTopics.has(slug) || item.relevance_score > seenTopics.get(slug).relevance_score) {
        seenTopics.set(slug, item)
      }
    }
    const allItems = Array.from(seenTopics.values())
    console.log(`🎯 [Reduce] Total após deduplicação: ${allItems.length} itens`)

    // 4.1 Persistir Enriquecimento no Banco de Dados
    console.log('💾 [Reduce] Atualizando posts com temas e resumos especializados...')
    for (const item of allItems) {
      if (!item.id) continue;

      const updateData = {
        title: item.title,
        summary: item.summary,
        whatsapp_summary: item.whatsapp_summary,
        category: item.category,
        score: item.relevance_score,
        theme_config: {
          ...item.theme_config,
          image_prompt: item.image_prompt
        },
      }

      await supabase
        .from('posts')
        .update(updateData)
        .eq('id', item.id)
    }

    // Agrupar por categoria para a newsletter
    const categoriesMap = new Map<string, any[]>()
    for (const item of allItems) {
      const cat = item.category === 'AI' ? '🤖 IA' : 
                  item.category === 'SEC' ? '🛡️ SEGURANÇA' : 
                  item.category === 'CLOUD' ? '☁️ CLOUD' : '💻 DEV'
      
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, [])
      }

      // Buscar o link original no array allPosts usando o id
      const originalPost = allPosts.find(p => p.id === item.id)
      
      categoriesMap.get(cat)!.push({
        headline: item.title,
        story: item.summary,
        link: originalPost?.url || '#',
        theme: item.theme_config
      })
    }

    const categories = Array.from(categoriesMap.entries()).map(([name, items]) => ({
      name,
      items
    }))

    // Obter o número da última edição
    const { data: maxEditionData } = await supabase
      .from('newsletters')
      .select('edition_number')
      .order('edition_number', { ascending: false })
      .limit(1)
      .single()

    let nextEditionNumber = (maxEditionData?.edition_number || 0) + 1
    const generatedEditions = []

    // ===== 5 & 6. METADADOS E MONTAGEM DA EDIÇÃO MESTRA =====
    console.log(`📝 Gerando metadados da Edição Mestra...`)

    const allHeadlines = categories.flatMap(cat => cat.items.map(item => item.headline)).join('\n')

    try {
      const metaResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é o editor-chefe do 'Fresh News'. Sua missão é consolidar a edição diária sob o novo design system 'Liquid Glass'.

# ESTILO VISUAL (PRECISION TECH):
- Use uma linguagem que remeta a transparência, nitidez, profundidade e precisão técnica.
- EVITE underscores (_) ou snake_case nos títulos. Use espaços normais e CAIXA ALTA para ênfase técnica.
- Substitua termos como "Giro Tech" por "REGISTRO TÉCNICO" ou "LOGS DE SISTEMA".
- Tom editorial: Autoridade elegante, minimalista e sofisticada.

SAÍDA JSON:
{
  "title": "Título criativo e impactante (foco em engenharia/futuro)",
  "intro": "Introdução de 1-2 linhas conectando os 2 maiores destaques do dia com tom premium",
  "quickTakes": ["⚡ Manchete 1", "🔥 Manchete 2", "👀 Manchete 3"],
  "image_prompt": "Prompt detalhado no estilo 'Liquid Glass Official // Macro-Tech' para a capa desta edição."
}`
          },
          {
            role: "user",
            content: `Baseado nestas ${allItems.length} headlines, gere os metadados:\n${allHeadlines}`
          }
        ],
        response_format: { type: "json_object" }
      })

      const metaContent = metaResponse.choices[0].message.content
      if (!metaContent) throw new Error('Falha ao gerar metadados')

      const metadata = JSON.parse(metaContent)

      // ===== GERAÇÃO DO DEBATE TÉCNICO INTERATIVO (Fase 6.3) =====
      console.log('🤖 [Generate] Orquestrando o debate técnico entre as IAs especialistas...')
      let debateLog = []
      try {
        const debateResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: aiConfig.debatePrompt
            },
            {
              role: "user",
              content: `Tema Principal: ${metadata.title}\nResumo da Edição: ${metadata.intro}\nManchetes:\n${allHeadlines}`
            }
          ],
          response_format: { type: "json_object" }
        })

        const debateRaw = debateResponse.choices[0].message.content
        if (debateRaw) {
          const parsedDebate = JSON.parse(debateRaw)
          debateLog = parsedDebate.debate || []
          console.log(`✅ [Generate] Debate gerado com sucesso! ${debateLog.length} interações.`)
        }
      } catch (errDebate) {
        console.error('⚠️ [Generate] Falha ao gerar o debate técnico das personas:', errDebate)
      }

      const contentJson = {
        title: metadata.title,
        intro: metadata.intro,
        quickTakes: metadata.quickTakes,
        categories: categories,
        image_prompt: metadata.image_prompt
      }

      const htmlContent = await render(
        DailyNewsletter({
          title: contentJson.title,
          intro: contentJson.intro,
          quickTakes: contentJson.quickTakes,
          categories: contentJson.categories
        }),
        { pretty: true }
      )

      const today = new Date()
      const formattedDate = today.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const title = `Edição de ${formattedDate}`

      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          edition_number: nextEditionNumber,
          title: title,
          summary_intro: contentJson.intro,
          content_json: contentJson,
          debate_log: debateLog,
          html_content: htmlContent,
          status: 'draft',
          category: 'MASTER',
          world: world,
          image_prompt: contentJson.image_prompt
        })
        .select()
        .single()

      if (error) {
        console.error(`Erro ao salvar edição Mestra no Supabase:`, error)
      } else {
        generatedEditions.push(data.id)
        nextEditionNumber++
      }

    } catch (err) {
      console.error(`Erro processando edição Mestra:`, err)
    }

    // Marcar posts usados como 'published'
    const postIds = allPosts.map(post => post.id)
    const { error: updateError } = await supabase
      .from('posts')
      .update({ status: 'published' })
      .in('id', postIds)

    if (updateError) {
      console.warn('⚠️ Erro ao atualizar status dos posts:', updateError)
    } else {
      console.log(`📝 ${postIds.length} posts marcados como 'published'`)
    }

    console.log(`🎉 ${generatedEditions.length} Edições geradas com sucesso!`)
    return { success: true, editionsGenerated: generatedEditions.length, itemCount: allItems.length }

  } catch (error) {
    console.error('❌ Erro fatal na geração (Map-Reduce):', error)
    throw error
  }
}

