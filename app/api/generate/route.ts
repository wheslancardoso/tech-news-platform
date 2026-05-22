import { generateNewsletterService } from '@/lib/services/newsletter'
import { NextResponse } from 'next/server'

// Evitar timeout em gerações longas (Map-Reduce)
export const maxDuration = 300 // 5 minutos
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    console.log('🌟 [API] Recebida solicitação de geração manual...')

    try {
        let world = 'TECH'

        // 1. Tentar ler do query params (?world=MUSIC)
        const { searchParams } = new URL(request.url)
        const queryWorld = searchParams.get('world')
        if (queryWorld) {
            world = queryWorld.toUpperCase()
        } else {
            // 2. Tentar ler do JSON body
            try {
                const body = await request.clone().json()
                if (body && body.world) {
                    world = String(body.world).toUpperCase()
                }
            } catch (e) {
                // Corpo vazio ou inválido, ignora
            }
        }

        // Validação estrita
        const allowedWorlds = ['TECH', 'MUSIC', 'GEAR']
        if (!allowedWorlds.includes(world)) {
            return NextResponse.json(
                { success: false, message: `Mundo inválido: ${world}. Mundos permitidos: ${allowedWorlds.join(', ')}` },
                { status: 400 }
            )
        }

        const result = await generateNewsletterService(world)

        return NextResponse.json({
            success: true,
            message: `Edição para o mundo ${world} gerada com sucesso!`,
            data: result
        })
    } catch (error: any) {
        console.error('❌ [API] Falha na geração:', error)

        return NextResponse.json(
            { success: false, message: error.message || 'Erro desconhecido na geração' },
            { status: 500 }
        )
    }
}
