'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Mocks para simulação
const MOCK_RSS_URLS = [
  'https://techcrunch.com/feed/',
  'https://news.ycombinator.com/rss',
  'https://verge.com/rss'
]

const MOCK_AI_RESPONSE = {
  title: 'Tech Daily: AI Revolution & Next.js Updates',
  intro: 'Hoje o mundo da tecnologia parou para ver as novidades da Vercel e os novos modelos da OpenAI.',
  sections: [
    {
      headline: 'GPT-5 Anunciado?',
      body: 'Rumores indicam que o novo modelo está mais próximo do que imaginamos, com capacidades de raciocínio avançadas.',
      link: 'https://openai.com'
    },
    {
      headline: 'Next.js 15 Estável',
      body: 'A nova versão traz melhorias significativas em performance e simplificação das Server Actions.',
      link: 'https://nextjs.org'
    }
  ]
}

export async function generateDraft() {
  const supabase = await createClient()
  
  // 1. Mock: Ler RSS (Em produção, usaríamos rss-parser aqui)
  console.log('Lendo feeds RSS:', MOCK_RSS_URLS)
  
  // 2. Mock: Simular chamada OpenAI
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // Em produção: const completion = await openai.chat.completions.create(...)
  console.log('Gerando resumo com AI...')
  
  const content = MOCK_AI_RESPONSE
  
  // 3. Gerar HTML básico (para o email)
  // Em produção, renderizaríamos o componente React Email aqui para string
  const htmlContent = `
    <h1>${content.title}</h1>
    <p>${content.intro}</p>
    ${content.sections.map(s => `
      <div style="margin-bottom: 20px;">
        <h3>${s.headline}</h3>
        <p>${s.body}</p>
        <a href="${s.link}">Ler mais</a>
      </div>
    `).join('')}
  `

  // 4. Salvar no Supabase
  const { data, error } = await supabase
    .from('newsletters')
    .insert({
      title: content.title,
      summary_intro: content.intro,
      content_json: content,
      html_content: htmlContent,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar draft:', error)
    throw new Error('Falha ao gerar draft')
  }

  return { success: true, data }
}

