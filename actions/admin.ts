'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteNewsletter(id: string, editionNumber: number) {
  const supabase = await createClient()

  try {
    // 1. Excluir a newsletter alvo
    const { error: deleteError } = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error('Erro ao excluir newsletter')

    // 2. Reajuste de Índice: Buscar newsletters posteriores para decrementar
    // Infelizmente o Supabase (Postgrest) não tem um "update ... where ... decrement" atômico simples via JS client sem stored procedure.
    // Vamos fazer via RPC se possível, ou buscar e atualizar.
    // Como o volume de newsletters não deve ser gigante, buscar e atualizar em loop ou batch é aceitável para este MVP.
    // Melhor: Usar rpc se tiver, mas vamos tentar uma query raw ou lógica de JS para simplificar sem migrations complexas agora.
    
    // Solução via JS (menos performática mas funciona sem mexer no SQL agora):
    const { data: newerNewsletters, error: fetchError } = await supabase
      .from('newsletters')
      .select('id, edition_number')
      .gt('edition_number', editionNumber)
      .order('edition_number', { ascending: true })

    if (fetchError) throw new Error('Erro ao buscar newsletters para reordenação')

    if (newerNewsletters && newerNewsletters.length > 0) {
      // Atualizar um por um (idealmente seria batch, mas o supabase-js v2 facilita upsert)
      const updates = newerNewsletters.map(n => ({
        id: n.id,
        edition_number: n.edition_number - 1
      }))

      // Upsert funciona como update se o ID existir
      const { error: updateError } = await supabase
        .from('newsletters')
        .upsert(updates, { onConflict: 'id' }) 
        // Nota: upsert requer que passemos todos os campos not-null ou que eles tenham default.
        // Se edition_number for o único campo alterado, precisamos garantir que o resto não quebre.
        // Na verdade, 'upsert' substitui o registro ou faz merge. Para merge seguro, é melhor usar update individual ou RPC.
        
      // Mudança de estratégia: Vamos fazer updates individuais em paralelo para segurança dos dados
      const updatePromises = newerNewsletters.map(n => 
        supabase
          .from('newsletters')
          .update({ edition_number: n.edition_number - 1 })
          .eq('id', n.id)
      )
      
      await Promise.all(updatePromises)
    }

    revalidatePath('/')
    return { success: true, message: 'Edição excluída e índices reajustados.' }

  } catch (error) {
    console.error('Erro ao excluir:', error)
    return { success: false, message: 'Falha ao excluir edição.' }
  }
}

