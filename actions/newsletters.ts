'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { distributeNewsletter } from '@/lib/services/distribution'

export async function publishNewsletter(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('newsletters')
    .update({ status: 'published' })
    .eq('id', id)

  if (error) {
    throw new Error('Falha ao publicar a newsletter: ' + error.message)
  }

  // Trigger distribution in background (async)
  // Note: For large lists, consider moving to a Queue/Job system
  distributeNewsletter(id).catch(err => {
    console.error('Falha na distribuição da newsletter:', err)
  })

  revalidatePath('/admin/posts')
  revalidatePath('/')
}

export async function rejectNewsletter(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('newsletters')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) {
    throw new Error('Falha ao rejeitar a newsletter: ' + error.message)
  }

  revalidatePath('/admin/posts')
}
