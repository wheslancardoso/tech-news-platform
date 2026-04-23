import { createClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Motor de Distribuição: Recorta a Edição Mestra para cada assinante e envia via Webhook.
 */
export async function distributeNewsletter(newsletterId: string) {
  const supabase = createAdminClient()

  // 1. Buscar a Newsletter
  const { data: newsletter, error: nlError } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', newsletterId)
    .single()

  if (nlError || !newsletter) {
    throw new Error('Newsletter não encontrada para distribuição')
  }

  const content = newsletter.content_json

  // 2. Buscar todos os assinantes ativos
  const { data: subscribers, error: subError } = await supabase
    .from('subscribers')
    .select('*')
    .eq('status', 'active')

  if (subError || !subscribers) {
    throw new Error('Erro ao buscar assinantes')
  }

  console.log(`📤 Iniciando distribuição da Edição #${newsletter.edition_number} para ${subscribers.length} assinantes.`)

  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0
  }

  // 3. Loop de Distribuição
  for (const subscriber of subscribers) {
    try {
      // Filtrar categorias baseadas nas preferências do usuário
      // Se não tiver preferências, manda tudo por padrão
      const userPrefs = subscriber.preferences || []
      
      const filteredCategories = content.categories.filter((cat: any) => {
        if (userPrefs.length === 0) return true
        // Verifica se o nome da categoria (ex: "🤖 IA") contém algum dos termos preferidos
        return userPrefs.some((pref: string) => cat.name.includes(pref.replace(/[^a-zA-Z0-9]/g, '').trim()) || cat.name.includes(pref))
      })

      if (filteredCategories.length === 0 && userPrefs.length > 0) {
        console.log(`⏩ Pulando assinante ${subscriber.email} - Nenhuma categoria compatível na edição de hoje.`)
        continue
      }

      // 4. Formatar Mensagem para WhatsApp (Brutalista / Limpa)
      const message = formatWhatsAppMessage(newsletter, filteredCategories, subscriber)

      // 5. Enviar para o Webhook do n8n
      // Nota: Substitua pela sua URL real do n8n quando disponível
      const n8nWebhookUrl = process.env.N8N_WHATSAPP_WEBHOOK_URL
      
      if (n8nWebhookUrl && subscriber.phone) {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: subscriber.phone,
            email: subscriber.email,
            message: message,
            edition: newsletter.edition_number
          })
        })
        results.sent++
      } else {
        // Se não tem telefone ou webhook, apenas logamos o sucesso da geração
        console.log(`[SIMULATION] Mensagem gerada para ${subscriber.email}:\n${message.substring(0, 100)}...`)
        results.sent++
      }

    } catch (err) {
      console.error(`❌ Falha ao processar envio para ${subscriber.email}:`, err)
      results.failed++
    }
  }

  console.log(`✅ Distribuição concluída: ${results.sent} enviados, ${results.failed} falhas.`)
  return results
}

/**
 * Formata o texto final para WhatsApp usando Markdown.
 */
function formatWhatsAppMessage(newsletter: any, categories: any[], subscriber: any) {
  const content = newsletter.content_json
  const prefsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/preferencias/${subscriber.id}`

  let text = `*FRESH NEWS / EDIÇÃO #${newsletter.edition_number}*\n`
  text += `_Sem hype, só o que importa_\n\n`
  
  text += `*${content.title.toUpperCase()}*\n\n`
  text += `${content.intro}\n\n`

  if (content.quickTakes && content.quickTakes.length > 0) {
    text += `⚡ *GIRO TECH*\n`
    content.quickTakes.forEach((take: string) => {
      text += `• ${take}\n`
    })
    text += `\n`
  }

  text += `--------------------------\n\n`

  categories.forEach(cat => {
    text += `*${cat.name.toUpperCase()}*\n\n`
    cat.items.forEach((item: any) => {
      text += `${item.headline}\n`
      text += `${item.story}\n`
      text += `🔗 _Fonte:_ ${item.link}\n\n`
    })
    text += `\n`
  })

  text += `--------------------------\n`
  text += `📖 *Ler na web:* ${process.env.NEXT_PUBLIC_APP_URL}/archive/${newsletter.id}\n`
  text += `⚙️ *Ajustar o que você recebe:* ${prefsUrl}\n\n`
  text += `_© 2026 Fresh News Zine_`

  return text
}
