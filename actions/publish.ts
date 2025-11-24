'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://technewsapi.com.br'

export async function publishNewsletter(newsletterId: string) {
  console.log(`🚀 Iniciando publicação da newsletter: ${newsletterId}`)

  const supabase = await createClient()

  // 1. Buscar Newsletter
  const { data: newsletter, error: newsError } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', newsletterId)
    .single()

  if (newsError || !newsletter) {
    throw new Error('Newsletter não encontrada.')
  }

  if (newsletter.status === 'published') {
    return { success: false, message: 'Esta edição já foi publicada.' }
  }

  // 2. Buscar Assinantes Ativos (Precisamos do ID e Token agora)
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('id, email, unsubscribe_token')
    .eq('status', 'active')

  if (subError || !subscribers || subscribers.length === 0) {
    return { success: false, message: 'Nenhum assinante ativo encontrado.' }
  }

  console.log(`📧 Preparando envio individual para ${subscribers.length} assinantes...`)

  try {
    // 3. Enviar via Resend (Loop Sequencial para Respeitar Rate Limit)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i]
      
      try {
        // Injeta o link de unsubscribe personalizado no HTML
        const unsubscribeLink = `${APP_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`
        
        // Substitui o placeholder do template (se houver) ou adiciona no final se não achar
        // No nosso template atual, o link é href="#" na linha 65. Vamos substituir isso.
        // Estratégia mais robusta: Substituir href="#" dentro do contexto do footer
        
        let personalizedHtml = newsletter.html_content.replace(
          'href="#">Unsubscribe', 
          `href="${unsubscribeLink}">Unsubscribe`
        )
        
        // Fallback simples se o replace falhar (caso o template mude)
        if (!personalizedHtml.includes(unsubscribeLink)) {
           personalizedHtml = personalizedHtml.replace(
             'Unsubscribe', 
             `<a href="${unsubscribeLink}" style="color:#8898aa;text-decoration:underline">Unsubscribe</a>`
           )
        }

        await resend.emails.send({
          from: 'Tech News <contato@news.technewsapi.com.br>',
          to: subscriber.email,
          subject: newsletter.title,
          html: personalizedHtml,
        })

        successCount++
        console.log(`✅ Email enviado para ${subscriber.email} (${successCount}/${subscribers.length})`)
      } catch (emailError) {
        failCount++
        console.error(`❌ Falha ao enviar para ${subscriber.email}:`, emailError)
      }

      // Delay de 2 segundos entre cada envio para respeitar o rate limit (2 req/s)
      // Não adiciona delay após o último envio
      if (i < subscribers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log(`✅ Envio concluído. Sucessos: ${successCount}, Falhas: ${failCount}`)

    if (successCount === 0) {
      throw new Error('Falha no envio de todos os e-mails.')
    }

    // 4. Atualizar Status no Banco
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', newsletterId)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
    }

    revalidatePath('/')
    return { 
      success: true, 
      message: `Newsletter enviada para ${successCount} assinantes${failCount > 0 ? ` (${failCount} falhas)` : ''}!` 
    }

  } catch (error) {
    console.error('Erro fatal na publicação:', error)
    return { success: false, message: 'Falha ao publicar newsletter.' }
  }
}
