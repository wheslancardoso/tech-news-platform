import { generateNewsletterService } from '@/lib/services/newsletter'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Estende o timeout para 60s (Garantia para processar 150 itens)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const start = Date.now()
  console.log(`🕒 [CRON] Iniciando Job às: ${new Date().toISOString()}`)

  const authHeader = request.headers.get('authorization')

  // Segurança: Verifica o Bearer Token
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(`🔒 [CRON] Acesso negado. Header recebido: ${authHeader ? 'Presente (Inválido)' : 'Ausente'}`)
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('🚀 [CRON] Autenticação OK. Iniciando serviço de geração...')

    const result = await generateNewsletterService()
    const duration = (Date.now() - start) / 1000
    console.log(`✅ [CRON] Sucesso! Duração: ${duration}s. Edição: #${result.edition}`)

    return NextResponse.json({
      success: true,
      message: 'Newsletter generated successfully',
      edition: result.edition,
      duration
    })
  } catch (error: any) {
    console.error('❌ [CRON] Erro Crítico:', error.message)
    console.error(error.stack)

    return NextResponse.json(
      { success: false, message: 'Failed to generate newsletter', error: error.message },
      { status: 500 }
    )
  }
}
