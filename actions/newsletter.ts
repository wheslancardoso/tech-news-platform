'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateNewsletter(id: string, data: { image_url?: string, image_prompt?: string, content_json?: any }) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('newsletters')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar newsletter:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/newsletters')
  return { success: true }
}
