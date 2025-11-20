'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD não configurada no servidor.')
  }

  if (password === adminPassword) {
    // Senha correta: Definir cookie de sessão
    const cookieStore = await cookies()
    
    // Define o cookie por 7 dias
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    })

    redirect('/')
  } else {
    // Senha incorreta: Retornar erro (mas como é redirect, vamos lançar erro ou retornar state)
    // Para simplificar neste fluxo de redirect, vamos lançar erro ou redirecionar com query param
    redirect('/login?error=invalid_password')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}

