'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

/**
 * Define o mundo ativo do multiverso no cookie do usuário
 * @param world O nome do mundo ('TECH', 'MUSIC' ou 'GEAR')
 */
export async function setActiveWorld(world: string) {
  const allowedWorlds = ['TECH', 'MUSIC', 'GEAR']
  if (!allowedWorlds.includes(world)) {
    throw new Error(`Mundo inválido: ${world}`)
  }

  const cookieStore = await cookies()
  
  // Define o cookie ativo por 1 ano de expiração de forma segura
  cookieStore.set('active_world', world, {
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    path: '/',
    httpOnly: false, // Permite acesso client-side se necessário, mas seguro
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  // Revalida a home e as rotas de arquivo para recalcular posts e estilos SSR
  revalidatePath('/')
  revalidatePath('/archive')

  return { success: true, world }
}
