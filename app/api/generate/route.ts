import { generateNewsletterService } from '@/lib/services/newsletter'
import { NextResponse } from 'next/server'

// Evitar timeout em gerações longas (Map-Reduce)
export const maxDuration = 300 // 5 minutos
export const dynamic = 'force-dynamic'

export async function POST() {
    console.log('🌟 [API] Recebida solicitação de geração manual...')

    try {
        const result = await generateNewsletterService()

        return NextResponse.json({
            success: true,
            message: 'Edição gerada com sucesso!',
            edition: result.edition,
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
