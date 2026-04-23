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
  const preferences = formData.getAll('preferences') as string[]

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
  const userEmail = validatedFields.data.email

  // 2. Verificar status atual do assinante
  const { data: existingSubscriber, error: fetchError } = await supabase
    .from('subscribers')
    .select('id, status')
    .eq('email', userEmail)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 0 rows found (ok)
    console.error('Erro ao buscar assinante:', fetchError)
    return {
      success: false,
      message: 'Ocorreu um erro ao verificar sua inscrição.',
    }
  }

  if (existingSubscriber) {
    if (existingSubscriber.status === 'active') {
      return {
        success: true,
        message: 'Você já está inscrito na nossa lista! 🚀',
      }
    } else {
      // Reativar inscrição (Update)
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ status: 'active', preferences: preferences })
        .eq('id', existingSubscriber.id)

      if (updateError) {
        console.error('Erro ao reativar:', updateError)
        return { success: false, message: 'Erro ao reativar inscrição.' }
      }

      return {
        success: true,
        message: 'Sua inscrição foi reativada com sucesso! Bem-vindo(a) de volta. 🎉',
      }
    }
  }

  // 3. Inserção de novo assinante (Insert)
  const { error: insertError } = await supabase
    .from('subscribers')
    .insert({ email: userEmail, preferences: preferences })

  if (insertError) {
    console.error('Erro ao inscrever:', insertError)
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
