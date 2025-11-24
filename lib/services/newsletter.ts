import { createClient } from '@/lib/supabase/server'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

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
  // Removido TabNews RSS (usando API) e links quebrados (Akita, Mario Filho)
  'https://loiane.com/feed.xml',
  'https://manualdousuario.net/feed/',
  
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

async function fetchTabNewsApi() {
  try {
    const response = await fetch('https://www.tabnews.com.br/api/v1/contents?strategy=relevant', {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TechNews-Newsletter/1.0' // Identificação educada
      }
    });
    if (!response.ok) throw new Error('Failed to fetch TabNews API');
    const data = await response.json();
    
    return data.map((item: any) => ({
      title: item.title,
      link: `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`,
      content: item.body || item.description || "",
      pubDate: item.published_at,
      source: 'TabNews (API)'
    }));
  } catch (error) {
    console.error('Erro ao buscar TabNews API:', error);
    return [];
  }
}

export async function generateNewsletterService() {
  console.log('🚀 [Service] Iniciando geração editorial Tech News...')

  try {
    // 1. Ingestão: RSS + APIs
    const parser = new Parser()
    const feedItems: any[] = []

    // Processamento Paralelo de RSS e TabNews API
    const [rssResults, tabNewsItems] = await Promise.all([
      Promise.allSettled(FEEDS.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return feed.items;
        } catch (error) {
          console.error(`Erro ao ler feed ${url}:`, error);
          return [];
        }
      })),
      fetchTabNewsApi()
    ]);

    // Processar resultados do RSS
    rssResults.forEach(result => {
        if (result.status === 'fulfilled') {
            feedItems.push(...result.value);
        }
    });

    // Combinar todas as fontes
    const allItems = [...feedItems, ...tabNewsItems];

    // Trava de 24h: Ignora notícias velhas para evitar repetição
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Ordenar e pegar os TOP 150 itens mais recentes (RSS + API) que sejam < 24h
    const sortedItems = allItems
      .filter(item => new Date(item.pubDate || item.isoDate) > yesterday)
      .sort((a, b) => new Date(b.pubDate || b.isoDate).getTime() - new Date(a.pubDate || a.isoDate).getTime())
      .slice(0, 150)

    const itemsForAI = sortedItems.map(item => ({
      title: item.title,
      link: item.link,
      content: (item.contentSnippet || item.content || '').substring(0, 500), 
      source: item.source || new URL(item.link).hostname
    }))

    console.log(`✅ Ingestão concluída. ${itemsForAI.length} itens enviados para editoria.`)

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
          3. **PROFUNDIDADE:** Escreva de 2 a 3 parágrafos por notícia. Explique o impacto técnico.
          4. **IDIOMA:** Português do Brasil (PT-BR) sempre.
          5. **QUANTIDADE MÍNIMA:** Você DEVE preencher pelo menos 3 CATEGORIAS DIFERENTES, com 2 a 3 notícias EM CADA UMA. Não economize conteúdo. Se a notícia for boa, coloque-a.
          
          ESTRUTURA JSON OBRIGATÓRIA:
          {
            "title": "Título Criativo e Engraçadinho (ex: 'O estagiário derrubou a prod?')",
            "intro": "Intro 'quebra-gelo'. Ex: 'Bom dia, devs! Enquanto você dormia, o Java atualizou e o Bitcoin caiu. Pegue seu café e bora pro resumo.'",
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
      })
    )

    // 4. Persistência e Título Padronizado
    const supabase = await createClient()

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

    console.log(`🎉 Edição #${nextEditionNumber} salva com sucesso!`)
    return { success: true, edition: nextEditionNumber }
    
  } catch (error) {
    console.error('❌ Erro fatal na geração (Service):', error)
    throw error // Relança para quem chamou tratar
  }
}
