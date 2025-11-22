import { createClient } from '@/lib/supabase/server'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

const FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml'
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
          content: `Você é um editor de tecnologia sagaz, bem-humorado e direto ao ponto. Seu objetivo é informar e entreter.
          
          DIRETRIZES EDITORIAIS:
          1. Use um tom conversacional e próximo do leitor (ex: "Bom dia!", "Bora para as notícias", "Sem enrolação").
          2. Adicione emojis relevantes no início de CADA manchete (ex: "🍎 Apple lança...", "🚀 SpaceX decola...").
          3. AGRUPE as notícias em categorias temáticas (ex: 'INTELIGÊNCIA ARTIFICIAL', 'BIG TECH', 'MERCADO', 'CODING').
          4. Para cada notícia principal, escreva uma 'story' de 2 a 3 parágrafos curtos.
          5. Adicione uma seção 'quickTakes': um array de 3 a 5 notícias curtas (1 frase cada) para leitura rápida.
          
          Output OBRIGATÓRIO em JSON estrito seguindo esta estrutura exata:
          {
            "title": "Título Criativo da Edição (ex: 'IA Dominando Tudo?')",
            "intro": "Parágrafo de 'Bom dia' com uma reflexão curta, curiosidade ou piada tech.",
            "quickTakes": ["Manchete rápida 1 ⚡", "Manchete rápida 2 🔥", "Manchete rápida 3 💡"],
            "categories": [
              {
                "name": "NOME DA CATEGORIA",
                "items": [
                  {
                    "headline": "Manchete da Notícia com Emoji",
                    "story": "Texto completo do resumo jornalístico (use \\n para quebras de parágrafo).",
                    "link": "URL original"
                  }
                ]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Aqui estão as matérias brutas:\n${JSON.stringify(itemsForAI)}`
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
