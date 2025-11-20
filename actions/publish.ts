'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // 2. Buscar Assinantes Ativos
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('email')
    .eq('status', 'active')

  if (subError || !subscribers || subscribers.length === 0) {
    return { success: false, message: 'Nenhum assinante ativo encontrado.' }
  }

  const recipientEmails = subscribers.map(s => s.email)
  console.log(`📧 Enviando para ${recipientEmails.length} assinantes...`)

  try {
    // 3. Enviar via Resend
    // Nota: Em plano gratuito do Resend, você só pode enviar para o e-mail cadastrado.
    // Use 'onboarding@resend.dev' como remetente para testes.
    const { data, error } = await resend.emails.send({
      from: 'Tech News <contato@news.technewsapi.com.br>',
      to: recipientEmails, // Cuidado: Em produção use BCC ou envie em lotes
      subject: newsletter.title,
      html: newsletter.html_content,
    })

    if (error) {
      console.error('Erro Resend:', error)
      throw new Error('Falha no envio de e-mail.')
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
      // O e-mail foi enviado, então é um estado inconsistente, mas retornamos sucesso parcial
    }

    revalidatePath('/')
    return { success: true, message: 'Newsletter publicada e enviada com sucesso!' }

  } catch (error) {
    console.error('Erro fatal na publicação:', error)
    return { success: false, message: 'Falha ao publicar newsletter.' }
  }
}

