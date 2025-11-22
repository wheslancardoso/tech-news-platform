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
  'https://blog.stone.co/rss',
  'https://medium.com/feed/luizalabs',
  'https://cwi.com.br/blog/feed/',
  
  // 🇧🇷 DEV & COMUNIDADE
  'https://www.tabnews.com.br/rss',
  'https://akitaonrails.com/feed.atom',
  'http://mariofilho.com/feed',
  'https://loiane.com/feed.xml',
  'https://braziljs.org/blog/feed.xml',
  'https://manualdousuario.net/feed/',
  
  // 🛡️ SEGURANÇA (CRÍTICO PARA RECÊNCIA)
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.bleepingcomputer.com/feed/',
  'https://krebsonsecurity.com/feed/',
  'https://googleprojectzero.blogspot.com/feeds/posts/default',
  'https://www.darkreading.com/rss.xml',
  
  // ☁️ CLOUD & BIG TECH
  'https://aws.amazon.com/blogs/architecture/feed/',
  'https://sre.google/blog/index.xml',
  'https://netflixtechblog.com/feed',
  'https://eng.uber.com/feed/',
  'https://blog.cloudflare.com/rss/',
  
  // 🤖 IA & DATA
  'https://openai.com/blog/rss.xml',
  'https://deepmind.google/blog/rss.xml',
  
  // 🗞️ VOLUME GERAL
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://dev.to/feed',
  'https://feed.infoq.com/'
]

export async function generateNewsletterService() {
  console.log('🚀 [Service] Iniciando geração editorial Tech News...')

  try {
    // 1. Ingestão: Ler Feeds RSS
    const parser = new Parser()
    const feedItems: any[] = []

    // Promise.allSettled para processar feeds em paralelo e ser mais rápido
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
    
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            feedItems.push(...result.value);
        }
    });

    // Ordenar e pegar os TOP 150 itens mais recentes para dar contexto à IA
    const sortedItems = feedItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 150)

    const itemsForAI = sortedItems.map(item => ({
      title: item.title,
      link: item.link,
      content: (item.contentSnippet || item.content || '').substring(0, 500), 
      source: new URL(item.link).hostname
    }))

    console.log(`✅ RSS processado. ${itemsForAI.length} itens enviados para editoria.`)

    // 2. O Editor-Chefe: Chamada OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é o 'Tech News', um editor de tecnologia que fala a língua dos desenvolvedores.
          
          SUA PERSONALIDADE:
          - Você é descontraído, usa gírias tech ("deploy", "bug", "feature") e tem bom humor.
          - Você ODEIA texto corporativo chato. Você escreve como se estivesse contando uma novidade para um colega de trabalho no café.
          - Você é TÉCNICO: Sabe diferenciar um framework de uma linguagem, mas explica de jeito simples.
          
          REGRAS DE CONTEÚDO:
          1. **EMOJIS SÃO OBRIGATÓRIOS:** Toda manchete DEVE começar com um emoji. Use emojis no meio do texto para destacar pontos.
          2. **FILTRO:** Ignore fofocas de celebridades e política. Foque em: Código, IA Real, Vazamentos/Segurança, Cloud e Carreira Dev.
          3. **PROFUNDIDADE:** Para as notícias principais, escreva 2 a 3 parágrafos.
             - Parágrafo 1: O que aconteceu (O fato direto).
             - Parágrafo 2: O detalhe técnico (Como funciona? Qual a falha? Qual a stack?).
             - Parágrafo 3: Por que isso importa para o dev/mercado?
          
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
                "name": "NOME DA CATEGORIA (Ex: 🛡️ CIBERSEGURANÇA, ☁️ DEVOPS & CLOUD, 🤖 IA)",
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
