import { createClient } from '@/lib/supabase/server'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

const FEEDS = [
  // 🇧🇷 Destaques BR (Engenharia & Mercado)
  'https://www.tabnews.com.br/rss',
  'https://building.nubank.com.br/feed/',
  'https://medium.com/feed/ifood-engineering',
  'https://medium.com/feed/mercadolibre-tech',
  'https://www.zup.com.br/feed',
  'https://stackspot.com/blog/feed/',
  'https://medium.com/feed/quintoandar-tech-blog',
  'https://blog.elo7.dev/feed/',
  'https://medium.com/feed/picpay-tech',
  'https://manualdousuario.net/feed/', // Foco em Privacidade/Segurança BR
  
  // 🇺🇸 Gringos (Tendências Globais - Mantendo alguns chave)
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://news.ycombinator.com/rss',
  'https://www.bleepingcomputer.com/feed/' // Referência mundial em Segurança/InfoSec
]

export async function generateNewsletterService() {
  console.log('🚀 [Service] Iniciando geração editorial Tech News...')

  try {
    // 1. Ingestão: Ler Feeds RSS
    const parser = new Parser()
    const feedItems: any[] = []

    for (const url of FEEDS) {
      try {
        const feed = await parser.parseURL(url)
        feedItems.push(...feed.items)
      } catch (error) {
        console.error(`Erro ao ler feed ${url}:`, error)
      }
    }

    const sortedItems = feedItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 8)

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
          content: `Você é um Editor Sênior de Tecnologia focado em ENGENHARIA DE SOFTWARE.
          
          🚨 REGRAS CRÍTICAS (LEIA COM ATENÇÃO):
          1. IDIOMA: O conteúdo final deve ser 100% em Português do Brasil. TRADUZA os títulos das notícias originais se estiverem em inglês.
          2. FILTRO DE CONTEÚDO:
             - ✅ APROVADO: Artigos sobre código, arquitetura, IA técnica, vazamento de dados, cloud, devops, lançamentos de frameworks.
             - ❌ PROIBIDO: Fofocas de bilionários (Elon Musk, Jack Ma), política, ciência espacial (NASA, musgos), quadrinhos/filmes, reviews de celular genéricos.
             - Se a notícia não for técnica/profissional, IGNORE-A.
          3. CATEGORIAS OBRIGATÓRIAS:
             - 🛡️ CIBERSEGURANÇA (Vazamentos, patches, ataques)
             - 🤖 IA & DATA (LLMs, RAG, novos modelos)
             - ☁️ CLOUD & DEVOPS (AWS, Kubernetes, Serverless)
             - 💻 DESENVOLVIMENTO (Linguagens, Frameworks, Engenharia)
             - 💰 MERCADO TECH (Apenas aquisições/demissões relevantes, sem fofoca)
          
          4. FORMATO:
             - Títulos diretos e informativos (sem clickbait).
             - Resumos ('story') de 2 a 3 parágrafos explicando o impacto técnico.
             - 'quickTakes': 3 a 5 notícias curtas e rápidas (1 frase).
          
          Output em JSON estrito:
          {
            "title": "Título Técnico e Chamativo (ex: 'Falha Crítica no Linux')",
            "intro": "Bom dia. Resumo curto do destaque técnico do dia.",
            "quickTakes": ["Manchete traduzida 1 ⚡", "Manchete traduzida 2 🛡️"],
            "categories": [
              {
                "name": "NOME DA CATEGORIA (DAS OBRIGATÓRIAS)",
                "items": [
                  {
                    "headline": "Título da Notícia Traduzido",
                    "story": "Resumo técnico em português...",
                    "link": "URL original"
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Filtre e resuma estas matérias brutas:\n${JSON.stringify(itemsForAI)}`
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
