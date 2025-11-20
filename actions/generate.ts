'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Parser from 'rss-parser'
import OpenAI from 'openai'
import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

// Configurações
const FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml'
]

export async function generateDraft(formData?: FormData) {
  console.log('🚀 Iniciando geração de draft...')

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
        // Continua mesmo se um feed falhar
      }
    }

    // Ordenar por data (mais recentes primeiro) e pegar os top 5
    const sortedItems = feedItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 5)

    // Preparar dados para a IA
    const itemsForAI = sortedItems.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }))

    console.log(`✅ RSS processado. ${itemsForAI.length} itens encontrados.`)

    // 2. O Editor: Chamada OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um editor de tecnologia experiente. Gere uma newsletter matinal em Português do Brasil. O output deve ser EXCLUSIVAMENTE um JSON válido com a estrutura: { title: string, intro: string, sections: { headline: string, body: string, link: string }[] }."
        },
        {
          role: "user",
          content: `Aqui estão as notícias mais recentes:\n${JSON.stringify(itemsForAI)}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const aiContent = completion.choices[0].message.content
    if (!aiContent) throw new Error('Falha ao gerar conteúdo com IA')

    const contentJson = JSON.parse(aiContent)
    console.log('✅ Conteúdo gerado pela IA:', contentJson.title)

    // 3. Renderização: Gerar HTML com React Email
    const htmlContent = await render(
      DailyNewsletter({
        title: contentJson.title,
        intro: contentJson.intro,
        sections: contentJson.sections
      })
    )

    // 4. Persistência: Salvar no Supabase
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('newsletters')
      .insert({
        title: contentJson.title,
        summary_intro: contentJson.intro,
        content_json: contentJson,
        html_content: htmlContent,
        status: 'draft'
      })

    if (error) {
      console.error('Erro ao salvar no Supabase:', error)
      throw new Error('Falha ao salvar draft')
    }

    console.log('🎉 Newsletter salva com sucesso!')
    revalidatePath('/')
    
  } catch (error) {
    console.error('❌ Erro fatal na geração:', error)
    // Não relançamos o erro para não quebrar a UI se for chamado via form
    // Em produção, deveríamos reportar para um sistema de logs (Sentry)
  }
}
