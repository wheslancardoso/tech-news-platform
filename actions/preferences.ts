'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePreferences(id: string, preferences: string[]) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('subscribers')
    .update({ preferences })
    .eq('id', id)

  if (error) {
    throw new Error('Falha ao atualizar preferências: ' + error.message)
  }

  revalidatePath(`/preferencias/${id}`)
  return { success: true }
}
