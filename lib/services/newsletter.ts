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
    'deal', 'sale', 'discount', 'promo', 'promotion',
    'hiring', 'job', 'career', 'recruitment', 'apply now',
    'podcast', 'interview', 'exclusive interview'
  ]

  noiseKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 5
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
 * Serviço de Geração: Busca posts curados/pendentes do banco e gera a newsletter.
 * Prioriza posts aprovados (curadoria humana), depois pendentes ordenados por score.
 * 
 * @returns Dados da edição gerada
 */
export async function generateNewsletterService() {
  console.log('🚀 [Generate] Iniciando geração editorial Tech News...')

  try {
    const supabase = createAdminClient()

    // 1. Buscar posts do banco
    // Prioridade 1: Posts aprovados manualmente
    const { data: approvedPosts, error: approvedError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .order('score', { ascending: false })

    if (approvedError) {
      console.error('Erro ao buscar posts aprovados:', approvedError)
      throw approvedError
    }

    // Prioridade 2: Posts pendentes (fallback automático)
    const remainingSlots = 20 - (approvedPosts?.length || 0)
    let pendingPosts: any[] = []

    if (remainingSlots > 0) {
      const { data, error: pendingError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'pending')
        .order('score', { ascending: false })
        .limit(remainingSlots)

      if (pendingError) {
        console.error('Erro ao buscar posts pendentes:', pendingError)
        throw pendingError
      }

      pendingPosts = data || []
    }

    // Combinar posts
    const allPosts = [...(approvedPosts || []), ...pendingPosts]

    if (allPosts.length === 0) {
      throw new Error('Nenhum post disponível para gerar newsletter. Execute a ingestão primeiro.')
    }

    console.log(`📊 Posts selecionados: ${approvedPosts?.length || 0} aprovados + ${pendingPosts.length} pendentes = ${allPosts.length} total`)

    // Preparar dados para a IA
    const itemsForAI = allPosts.map(post => ({
      title: post.title,
      link: post.url,
      content: (post.content || '').substring(0, 3000),
      source: post.source
    }))

    // 2. O Editor-Chefe: Chamada OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é o 'Tech News', um editor de tecnologia que fala a língua dos desenvolvedores.
          
          SUA PERSONALIDADE:
          - Você é descontraído, usa gírias tech ("deploy", "bug", "feature", "prod") e tem bom humor.
          - Você escreve como se estivesse conversando com um colega dev no café. Zero "corporatês".
          - Você é TÉCNICO: Explica o *porquê* das coisas, não apenas o *o quê*.
          
          REGRAS DE CONTEÚDO:
          1. **EMOJIS SÃO LEI:** Use emojis no início de cada manchete e no meio do texto para dar vida.
          2. **FILTRO:** Ignore fofocas. Foque em: Código, IA Técnica, Vazamentos/Segurança, Cloud e Carreira Dev.
          3. **PROFUNDIDADE TÉCNICA (CRÍTICO):** Escreva de 2 a 3 parágrafos por notícia. NÃO faça resumos genéricos. Extraia e mencione:
             - **Números de versão** (ex: "React 19.0", "Node.js 22.1.0")
             - **CVEs e vulnerabilidades** (ex: "CVE-2024-1234", "CVSS 9.8")
             - **Métricas e números** (ex: "melhoria de 40% em performance", "redução de 2.3s no tempo de build")
             - **Nomes técnicos específicos** (ex: "malware XLoader", "framework Next.js 15", "API GraphQL")
             - **Features principais** (se for lançamento, liste as 2-3 features mais importantes)
             - **Impacto técnico real** (ex: "afeta aplicações que usam JWT", "requer atualização imediata em produção")
          4. **IDIOMA:** Português do Brasil (PT-BR) sempre.
          5. **QUANTIDADE MÍNIMA (OBRIGATÓRIO):** Você DEVE preencher OBRIGATORIAMENTE 4 categorias diferentes (🛡️ CIBERSEGURANÇA, 💻 DEV, 🤖 IA, ☁️ DEVOPS & CLOUD). Cada categoria deve ter 2 a 3 notícias. Se não houver notícias óbvias para uma categoria específica, procure itens correlatos na entrada que possam se encaixar. Não economize conteúdo. Se a notícia for boa, coloque-a.
          6. **DIVERSIDADE & RELEVÂNCIA:** Se houver muitas notícias relevantes, priorize a diversidade de temas. Não deixe assuntos críticos de segurança ou grandes lançamentos de fora.
          7. **QUALIDADE > QUANTIDADE:** Mantenha a profundidade técnica atual, mas garanta que o e-mail final pareça "cheio" e cubra todas as áreas. Cada item deve ser uma "Deep Dive" que realmente informa o desenvolvedor.
          
          ESTRUTURA JSON OBRIGATÓRIA:
          {
            "title": "Título Criativo e Engraçadinho (ex: 'O estagiário derrubou a prod?')",
            "intro": "Escreva uma introdução ÚNICA de 1 parágrafo (max 2 linhas) conectando os 2 maiores destaques desta edição. Seja criativo e NÃO COPIE O EXEMPLO. Ex: 'Bom dia! Hoje o foco é segurança com o vazamento da X e a nova IA da Y...'",
            "quickTakes": [
              "⚡ Manchete rápida 1 (1 frase)",
              "🔥 Manchete rápida 2 (1 frase)",
              "👀 Manchete rápida 3 (1 frase)"
            ],
            "categories": [
              {
                "name": "NOME DA CATEGORIA (Use: 🛡️ CIBERSEGURANÇA, ☁️ DEVOPS & CLOUD, 🤖 IA, 💻 DEV, 💰 MERCADO)",
                "items": [
                  {
                    "headline": "Emoji + Título Traduzido e Chamativo",
                    "story": "Texto completo e envolvente com 2-3 parágrafos. Use tom de conversa.",
                    "link": "URL original"
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Analise estes feeds e crie a melhor newsletter do dia:\n${JSON.stringify(itemsForAI)}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const aiContent = completion.choices[0].message.content
    if (!aiContent) throw new Error('Falha ao gerar conteúdo com IA')

    const contentJson = JSON.parse(aiContent)
    console.log('✅ Edição gerada:', contentJson.title)

    // 3. Renderização
    const htmlContent = await render(
      DailyNewsletter({
        title: contentJson.title,
        intro: contentJson.intro,
        quickTakes: contentJson.quickTakes,
        categories: contentJson.categories
      }),
      { pretty: true }
    )

    // 4. Persistência e Título Padronizado
    const { data: maxEditionData } = await supabase
      .from('newsletters')
      .select('edition_number')
      .order('edition_number', { ascending: false })
      .limit(1)
      .single()

    const nextEditionNumber = (maxEditionData?.edition_number || 0) + 1

    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    const title = `Edição ${formattedDate}`;

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

    // 5. Marcar posts usados como 'published'
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

    console.log(`🎉 Edição #${nextEditionNumber} salva com sucesso!`)
    return { success: true, edition: nextEditionNumber, id: data.id }

  } catch (error) {
    console.error('❌ Erro fatal na geração (Service):', error)
    throw error // Relança para quem chamou tratar
  }
}
