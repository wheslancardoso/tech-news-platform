'use server'

import { generateNewsletterService } from '@/lib/services/newsletter'
import { revalidatePath } from 'next/cache'

export async function generateDraft(formData?: FormData) {
  try {
    await generateNewsletterService()
    revalidatePath('/')
  } catch (error) {
    console.error('Erro ao gerar draft via Action:', error)
    // Não relança erro para não quebrar a UI se for chamado via form
  }
}
