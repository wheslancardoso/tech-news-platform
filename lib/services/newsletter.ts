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
 * Serviço de Ingestão: Coleta notícias dos feeds RSS e salva no banco de dados.
 * Este serviço NÃO gera a newsletter, apenas popula a tabela de posts para curadoria.
 * 
 * @returns Estatísticas de ingestão
 */
export async function ingestPostsService() {
  console.log('🚀 [Ingest] Iniciando ingestão de feeds RSS...')

  try {
    const supabase = createAdminClient()

    // 1. Ingestão: Buscar fontes ativas do banco
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('rss_url')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError
    const activeFeeds = sources?.map(s => s.rss_url) || []

    if (activeFeeds.length === 0) {
      console.warn('⚠️ [Ingest] Nenhuma fonte ativa encontrada na tabela sources.')
      return { success: false, total: 0, inserted: 0, skipped: 0 }
    }

    const parser = new Parser({
      requestOptions: {
        rejectUnauthorized: false
      }
    })

    // Processamento Paralelo de RSS
    const feedPromises = activeFeeds.map(async (url) => {
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

    // ===== 1. SELEÇÃO: Buscar 25 posts (pending ou approved) =====
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .in('status', ['pending', 'approved'])
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
    const mapPrompt = `Você é um Editor de Tecnologia Sênior da Fresh News. Sua tarefa é produzir uma newsletter "Deep Dive", que vai muito além de resumos genéricos. Queremos comentários analíticos, técnicos e aprofundados.

# PERSONAS ESPECIALISTAS:

1. **IA (Neuralista-Chefe)**:
   - Foco: LLMs, infra de GPUs, automação agêntica, novos benchmarks e pesos de modelo.
   - Tom: Futurista, focado em escala e eficiência computacional.
   - Missão: Explicar a arquitetura por trás da notícia e por que isso muda o jogo da IA.
   - Accent: #00F0FF | Effects: ['neural_particles', 'glassmorphism', 'terminal_glow']

2. **SEGURANÇA (Red Team)**:
   - Foco: Exploits, CVEs, privacidade, táticas de ataque e defesa.
   - Tom: Urgente, tático, focado em "como se proteger" e na anatomia da falha.
   - Missão: Desmiuçar a vulnerabilidade, o vetor de ataque e o impacto real na infraestrutura.
   - Accent: #FF0000 | Effects: ['glitch_effect', 'scanlines', 'pulsing_borders']

3. **DEV (Arquiteto Software Sênior)**:
   - Foco: Frameworks, linguagens, manutenção, padrões de projeto e performance de código.
   - Tom: Pragmático, experiente, cético em relação a hypes vazios.
   - Missão: Analisar o código, a mudança na API ou o novo paradigma de desenvolvimento e como isso afeta o dia a dia do dev.
   - Accent: #00FF41 | Effects: ['terminal_cursor', 'scanlines', 'grainy_texture']

4. **CLOUD (SRE / Cloud Architect)**:
   - Foco: Cloud Providers (AWS/Azure/GCP), Kubernetes, Serverless, FinOps e escalabilidade.
   - Tom: Focado em disponibilidade, custo-benefício e robustez.
   - Missão: Detalhar o impacto na infraestrutura, custos operacionais e estratégias de deployment.
   - Accent: #BD00FF | Effects: ['glassmorphism', 'cloud_compute_grid']

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
      "topic_slug": "slug-unico-do-assunto-para-evitar-duplicidade (ex: apple-ceo-ternus, cpanel-cve-2026)",
      "category": "AI | SEC | DEV | CLOUD",
      "title": "Título provisório impactante (Máx 80 chars)",
      "summary": "Comentário profundo e analítico. Mínimo 400, Máximo 1200 caracteres. Use markdown leve (negrito para termos técnicos).",
      "whatsapp_summary": "Versão curta com emoji para WhatsApp (Máx 160 chars)",
      "relevance_score": 0-100,
      "theme_config": {
        "dna": "TECH_HACKER",
        "primary_color": "#0D0D0D",
        "accent_color": "Hex da persona",
        "font_style": "Mono",
        "ui_effects": ["lista", "de", "efeitos", "conforme", "persona"]
      }
    }
  ]
}`

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
        theme_config: item.theme_config,
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
        link: originalPost?.url || '#'
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
            content: `Você é o editor-chefe do 'Fresh News'. Gere metadados globais para a edição da newsletter.

SAÍDA JSON:
{
  "title": "Título criativo e engraçado (ex: 'O estagiário derrubou a prod?')",
  "intro": "Introdução de 1-2 linhas conectando os 2 maiores destaques do dia",
  "quickTakes": ["⚡ Manchete 1", "🔥 Manchete 2", "👀 Manchete 3"]
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

      const contentJson = {
        title: metadata.title,
        intro: metadata.intro,
        quickTakes: metadata.quickTakes,
        categories: categories // Array com todas as categorias!
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
        year: '2-digit'
      })
      const title = `Edição de ${formattedDate}`

      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          edition_number: nextEditionNumber,
          title: title,
          summary_intro: contentJson.intro,
          content_json: contentJson,
          html_content: htmlContent,
          status: 'draft',
          category: 'MASTER'
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

