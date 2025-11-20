'use server'

import { createClient } from '@/lib/supabase/server'

export async function unsubscribeUser(token: string) {
  if (!token) return { success: false, message: 'Token inválido.' }

  const supabase = await createClient()

  // Verifica se o token existe e pega o usuário
  const { data: subscriber, error: fetchError } = await supabase
    .from('subscribers')
    .select('id, email')
    .eq('unsubscribe_token', token)
    .single()

  if (fetchError || !subscriber) {
    return { success: false, message: 'Link de cancelamento inválido ou expirado.' }
  }

  // Atualiza status
  const { error: updateError } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', subscriber.id)

  if (updateError) {
    console.error('Erro ao cancelar inscrição:', updateError)
    return { success: false, message: 'Erro ao processar cancelamento.' }
  }

  return { success: true, message: 'Inscrição cancelada com sucesso.' }
}

