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
  console.log('🚀 Iniciando geração editorial Tech News...')

  try {
    // 1. Ingestão: Ler Feeds RSS com mais contexto
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

    // Ordenar e pegar Top 8 (aumentamos para ter material para categorias)
    const sortedItems = feedItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 8)

    // Preparar dados ricos para a IA
    const itemsForAI = sortedItems.map(item => ({
      title: item.title,
      link: item.link,
      // Tenta pegar o conteúdo mais completo possível
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
          content: `Você é o editor-chefe do 'Tech News'. Sua missão é criar uma newsletter editorial completa e profissional.
          
          DIRETRIZES EDITORIAIS:
          1. NÃO faça apenas uma lista de links. O leitor deve se informar lendo APENAS a newsletter.
          2. AGRUPE as notícias em categorias temáticas claras (ex: '🤖 INTELIGÊNCIA ARTIFICIAL', '💻 DESENVOLVIMENTO', '📱 MOBILE', '🚀 BIG TECH', '💰 MERCADO').
          3. Para cada notícia, escreva uma 'story' jornalística de 2 a 3 parágrafos curtos, explicando o contexto e o impacto. Use tom objetivo mas envolvente.
          4. Output OBRIGATÓRIO em JSON estrito seguindo esta estrutura exata:
          {
            "title": "Título chamativo da edição",
            "intro": "Introdução curta sobre o destaque do dia",
            "categories": [
              {
                "name": "NOME DA CATEGORIA",
                "items": [
                  {
                    "headline": "Manchete da Notícia",
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

    // 3. Renderização: Gerar HTML com React Email (Nova Estrutura)
    const htmlContent = await render(
      DailyNewsletter({
        title: contentJson.title,
        intro: contentJson.intro,
        categories: contentJson.categories
      })
    )

    // 4. Persistência: Calcular Próximo Número de Edição Manualmente
    const supabase = await createClient()

    // Busca o maior edition_number atual
    const { data: maxEditionData } = await supabase
      .from('newsletters')
      .select('edition_number')
      .order('edition_number', { ascending: false })
      .limit(1)
      .single()

    const nextEditionNumber = (maxEditionData?.edition_number || 0) + 1
    
    // Gerar título padronizado
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    const title = `Edição ${formattedDate}`; // Ex: Edição 20/11/25

    const { error } = await supabase
      .from('newsletters')
      .insert({
        edition_number: nextEditionNumber, // Força o número calculado
        title: title, // Usa o título padronizado
        summary_intro: contentJson.intro,
        content_json: contentJson,
        html_content: htmlContent,
        status: 'draft'
      })

    if (error) {
      console.error('Erro ao salvar no Supabase:', error)
      throw new Error('Falha ao salvar draft')
    }

    console.log(`🎉 Edição #${nextEditionNumber} salva com sucesso!`)
    revalidatePath('/')
    
  } catch (error) {
    console.error('❌ Erro fatal na geração:', error)
  }
}
