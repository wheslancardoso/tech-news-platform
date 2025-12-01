'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Cliente Admin (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type UpdateData = {
  title: string
  summary_intro: string
  html_content: string
}

export async function deleteNewsletter(id: string, editionNumber: number) {
  try {
    // 1. Excluir a newsletter alvo
    const { error: deleteError } = await supabaseAdmin
      .from('newsletters')
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error('Erro ao excluir newsletter')

    // 2. Reajuste de Índice: Buscar newsletters posteriores para decrementar
    const { data: newerNewsletters, error: fetchError } = await supabaseAdmin
      .from('newsletters')
      .select('id, edition_number')
      .gt('edition_number', editionNumber)
      .order('edition_number', { ascending: true })

    if (fetchError) throw new Error('Erro ao buscar newsletters para reordenação')

    if (newerNewsletters && newerNewsletters.length > 0) {
      // Atualizar um por um em paralelo
      const updatePromises = newerNewsletters.map(n =>
        supabaseAdmin
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

export async function updateNewsletter(id: string, data: UpdateData) {
  try {
    const { error } = await supabaseAdmin
      .from('newsletters')
      .update({
        title: data.title,
        summary_intro: data.summary_intro,
        html_content: data.html_content
      })
      .eq('id', id)

    if (error) throw new Error('Falha ao atualizar newsletter: ' + error.message)

    revalidatePath(`/archive/${id}`)
    revalidatePath('/')
    return { success: true, message: 'Newsletter atualizada com sucesso.' }
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    throw error // Re-throw para ser capturado pelo componente se necessário
  }
}
