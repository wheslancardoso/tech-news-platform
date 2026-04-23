'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approvePost(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ status: 'approved' })
    .eq('id', id)

  if (error) {
    throw new Error('Falha ao aprovar o post: ' + error.message)
  }

  revalidatePath('/admin/posts')
}

export async function rejectPost(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('posts')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) {
    throw new Error('Falha ao rejeitar o post: ' + error.message)
  }

  revalidatePath('/admin/posts')
}
