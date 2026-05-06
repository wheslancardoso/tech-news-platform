'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function uploadImageAction(base64: string, fileName: string, contentType: string) {
  const supabase = createAdminClient()
  const buffer = Buffer.from(base64, 'base64')

  const { data, error } = await supabase.storage
    .from('newsletters')
    .upload(fileName, buffer, {
      contentType,
      upsert: true
    })

  if (error) {
    console.error('Erro no upload via Admin:', error)
    return { success: false, error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('newsletters')
    .getPublicUrl(fileName)

  return { success: true, publicUrl }
}

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
