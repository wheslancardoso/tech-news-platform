'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
})

export type SubscribeState = {
  message?: string
  success?: boolean
  errors?: {
    email?: string[]
  }
}

export async function subscribe(prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = formData.get('email')

  // 1. Validação com Zod
  const validatedFields = subscribeSchema.safeParse({ email })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Verifique os erros no formulário.',
    }
  }

  const supabase = await createClient()

  // 2. Inserção no Supabase
  const { error } = await supabase
    .from('subscribers')
    .insert({ email: validatedFields.data.email })

  // 3. Tratamento de Erros
  if (error) {
    // Erro 23505 é violação de unicidade no Postgres (Unique Key)
    if (error.code === '23505') {
      return {
        success: true, // Retornamos true para não assustar o usuário, mas avisamos
        message: 'Você já está inscrito na nossa lista! 🚀',
      }
    }

    console.error('Erro ao inscrever:', error)
    return {
      success: false,
      message: 'Ocorreu um erro ao tentar se inscrever. Tente novamente.',
    }
  }

  return {
    success: true,
    message: 'Inscrição realizada com sucesso! Bem-vindo(a). 🎉',
  }
}

