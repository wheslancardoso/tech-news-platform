'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server Action para logout do admin
 * Deleta o cookie de sessão e redireciona para /login
 */
export async function handleLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}

// Cliente Admin (Bypass RLS) - Helper function to avoid build errors
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

import { render } from '@react-email/render'
import { DailyNewsletter } from '@/emails/daily-template'

type NewsletterContent = {
  title: string
  intro: string // Mapped to summary_intro in DB
  quickTakes?: string[]
  categories: Array<{
    name: string
    items: Array<{
      headline: string
      story: string
      link: string
    }>
  }>
}

export async function deleteNewsletter(id: string, editionNumber: number) {
  const supabaseAdmin = getAdminClient()
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

export async function updateNewsletter(id: string, data: NewsletterContent) {
  const supabaseAdmin = getAdminClient()
  try {
    // Regenerar HTML com base no JSON atualizado
    const htmlContent = await render(
      DailyNewsletter({
        title: data.title,
        intro: data.intro,
        quickTakes: data.quickTakes,
        categories: data.categories
      }),
      { pretty: true }
    )

    const { error } = await supabaseAdmin
      .from('newsletters')
      .update({
        title: data.title,
        summary_intro: data.intro,
        content_json: data, // Salva o JSON atualizado
        html_content: htmlContent // Salva o HTML regenerado
      })
      .eq('id', id)

    if (error) throw new Error('Falha ao atualizar newsletter: ' + error.message)

    revalidatePath(`/archive/${id}`)
    revalidatePath('/')
    return { success: true, message: 'Newsletter atualizada com sucesso.' }
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    throw error
  }
}
