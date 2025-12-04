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

const FEEDS = [
  // 🇧🇷 ENGENHARIA & ARQUITETURA
  'https://building.nubank.com.br/feed/',
  'https://medium.com/feed/mercadolibre-tech',
  'https://medium.com/feed/ifood-engineering',
  'https://medium.com/feed/quintoandar-tech-blog',
  'https://www.zup.com.br/blog/feed',
  'https://medium.com/feed/luizalabs',
  'https://cwi.com.br/blog/feed/',

  // 🇧🇷 DEV & COMUNIDADE
  'https://www.tabnews.com.br/rss',
  'https://loiane.com/feed.xml',
  'https://manualdousuario.net/feed/',

  // 🇧🇷 NOTÍCIAS TECH
  'https://tecnoblog.net/feed',
  'https://feeds.feedburner.com/canaltechbr',
  'https://olhardigital.com.br/rss',
  'https://rss.tecmundo.com.br/feed',
  'https://www.tudocelular.com/feed',

  // 🛡️ SEGURANÇA
  'https://thehackernews.com/feeds/posts/default',
  'https://www.bleepingcomputer.com/feed/',
  'https://krebsonsecurity.com/feed/',
  'https://googleprojectzero.blogspot.com/feeds/posts/default',
  'https://www.darkreading.com/rss.xml',

  // ☁️ CLOUD & BIG TECH
  'https://aws.amazon.com/blogs/architecture/feed/',
  // Removido SRE Google e Uber (404/Instáveis)
  'https://netflixtechblog.com/feed',
  'https://blog.cloudflare.com/rss/',

  // 🤖 IA & DATA
  'https://openai.com/blog/rss.xml',
  // Removido DeepMind (404)

  // 🗞️ VOLUME GERAL
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://dev.to/feed'
  // Removido InfoQ (406)
]

/**
 * Calcula a pontuação de relevância de um item de notícia baseado em palavras-chave.
 * Itens com maior pontuação são mais relevantes para desenvolvedores.
 * 
 * @param item - Item do feed RSS com title e content
 * @returns Pontuação numérica (maior = mais relevante)
 */
function scoreItem(item: { title?: string; content?: string; contentSnippet?: string }): number {
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
 * Serviço de Ingestão: Coleta notícias dos feeds RSS e salva no banco de dados.
 * Este serviço NÃO gera a newsletter, apenas popula a tabela de posts para curadoria.
 * 
 * @returns Estatísticas de ingestão
 */
export async function ingestPostsService() {
  console.log('🚀 [Ingest] Iniciando ingestão de feeds RSS...')

  try {
    const supabase = createAdminClient()

    // 1. Ingestão: RSS
    const parser = new Parser({
      requestOptions: {
        rejectUnauthorized: false
      }
    })

    // Processamento Paralelo de RSS
    const feedPromises = FEEDS.map(async (url) => {
      try {
        const feed = await parser.parseURL(url);
        return feed.items;
      } catch (error) {
        console.error(`Erro ao ler feed ${url}:`, error);
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
      const postData = {
        title: item.title || 'Sem título',
        url: item.link,
        content: (item.contentSnippet || item.content || '').substring(0, 5000),
        summary: (item.contentSnippet || '').substring(0, 500),
        source: item.source || new URL(item.link).hostname,
        score: item.score,
        status: 'pending' as const
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
export async function generateNewsletterService() {
  console.log('🚀 [Generate] Iniciando geração Map-Reduce...')

  try {
    const supabase = createAdminClient()
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // ===== 1. SELEÇÃO: Buscar 25 posts =====
    const { data: approvedPosts, error: approvedError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('score', { ascending: false })

    if (approvedError) throw approvedError

    const remainingSlots = 25 - (approvedPosts?.length || 0)
    let pendingPosts: any[] = []

    if (remainingSlots > 0) {
      const { data, error: pendingError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending')
        .order('score', { ascending: false })
        .limit(remainingSlots)

      if (pendingError) throw pendingError
      pendingPosts = data || []
    }

    const allPosts = [...(approvedPosts || []), ...pendingPosts]

    if (allPosts.length === 0) {
      throw new Error('Nenhum post disponível para gerar newsletter. Execute a ingestão primeiro.')
    }

    console.log(`📊 Posts selecionados: ${approvedPosts?.length || 0} aprovados + ${pendingPosts.length} pendentes = ${allPosts.length} total`)

    // Preparar dados para a IA
    const itemsForAI = allPosts.map(post => ({
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
    const mapPrompt = `Você é um redator técnico de newsletter para DESENVOLVEDORES DE SOFTWARE. Escreva em PT-BR.

TAREFA: Resuma os itens abaixo que forem RELEVANTES para engenharia de software.

DEFINIÇÕES DE CATEGORIA:
- 🛡️ CIBERSEGURANÇA = Vulnerabilidades, CVEs, malware, vazamentos, patches de segurança
- 💻 DEV = Código, Frameworks, Linguagens, Libs, Open Source (NÃO inclua celulares, fones, TVs ou gadgets)
- 🤖 IA = LLMs, modelos, benchmarks, ferramentas de IA para devs
- ☁️ DEVOPS & CLOUD = AWS, Azure, GCP, Kubernetes, Docker, infra, outages
- 💰 MERCADO = Aquisições, IPOs, layoffs de empresas tech

REGRA DE EXCLUSÃO (CRÍTICO):
- Se a notícia for sobre ELETRÔNICOS DE CONSUMO (smartphones, TVs, fones, smartwatches, gadgets), IGNORE-A.
- Se for fofoca de mercado sem impacto técnico, IGNORE-A.
- Se for review/unboxing de produto, IGNORE-A.
- Retorne um array menor se necessário. Qualidade > Quantidade.

REGRAS DE ESCRITA:
- Use emojis no início de cada headline
- Seja técnico: mencione versões, CVEs, métricas
- Tom descontraído de dev (gírias: "deploy", "bug", "prod")
- 1-2 parágrafos curtos por item

SAÍDA JSON:
{
  "items": [
    {
      "category": "🛡️ CIBERSEGURANÇA",
      "headline": "🔥 Título chamativo",
      "story": "Texto técnico.",
      "link": "URL"
    }
  ]
}`

    console.log('⚡ [Map] Processando chunks em paralelo...')

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

    // ===== 4. REDUCE: Consolidar todos os itens =====
    const allItems = mapResults.flat()
    console.log(`🔗 [Reduce] Total consolidado: ${allItems.length} itens`)

    if (allItems.length === 0) {
      throw new Error('Nenhum item foi processado. Verifique os logs de erro.')
    }

    // Agrupar por categoria
    const categoriesMap = new Map<string, any[]>()
    for (const item of allItems) {
      const cat = item.category || '💻 DEV'
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, [])
      }
      categoriesMap.get(cat)!.push({
        headline: item.headline,
        story: item.story,
        link: item.link
      })
    }

    const categories = Array.from(categoriesMap.entries()).map(([name, items]) => ({
      name,
      items
    }))

    // ===== 5. METADADOS: Chamada final leve =====
    console.log('📝 [Metadados] Gerando title, intro e quickTakes...')

    const headlines = allItems.map(item => item.headline).join('\n')

    const metaResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é o editor-chefe do 'Tech News'. Gere APENAS metadados para a newsletter.

SAÍDA JSON:
{
  "title": "Título criativo e engraçado (ex: 'O estagiário derrubou a prod?')",
  "intro": "Introdução de 1-2 linhas conectando os 2 maiores destaques",
  "quickTakes": ["⚡ Manchete 1", "🔥 Manchete 2", "👀 Manchete 3"]
}`
        },
        {
          role: "user",
          content: `Baseado nestas ${allItems.length} headlines, gere os metadados:\n${headlines}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const metaContent = metaResponse.choices[0].message.content
    if (!metaContent) throw new Error('Falha ao gerar metadados')

    const metadata = JSON.parse(metaContent)
    console.log('✅ Metadados gerados:', metadata.title)

    // ===== 6. MONTAGEM FINAL =====
    const contentJson = {
      title: metadata.title,
      intro: metadata.intro,
      quickTakes: metadata.quickTakes,
      categories
    }

    // Renderização HTML
    const htmlContent = await render(
      DailyNewsletter({
        title: contentJson.title,
        intro: contentJson.intro,
        quickTakes: contentJson.quickTakes,
        categories: contentJson.categories
      }),
      { pretty: true }
    )

    // Persistência
    const { data: maxEditionData } = await supabase
      .from('newsletters')
      .select('edition_number')
      .order('edition_number', { ascending: false })
      .limit(1)
      .single()

    const nextEditionNumber = (maxEditionData?.edition_number || 0) + 1

    const today = new Date()
    const formattedDate = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
    const title = `Edição ${formattedDate}`

    const { data, error } = await supabase
      .from('newsletters')
      .insert({
        edition_number: nextEditionNumber,
        title: title,
        summary_intro: contentJson.intro,
        content_json: contentJson,
        html_content: htmlContent,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar no Supabase:', error)
      throw new Error('Falha ao salvar draft')
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

    console.log(`🎉 Edição #${nextEditionNumber} salva! ${allItems.length} itens processados via Map-Reduce.`)
    return { success: true, edition: nextEditionNumber, id: data.id, itemCount: allItems.length }

  } catch (error) {
    console.error('❌ Erro fatal na geração (Map-Reduce):', error)
    throw error
  }
}

