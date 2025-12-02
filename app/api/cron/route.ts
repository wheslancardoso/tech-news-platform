import { generateNewsletterService } from '@/lib/services/newsletter'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // Estende o timeout para 300s (5min) para acomodar a geração da newsletter
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
    console.log(`✅ [CRON] Sucesso na geração! Duração: ${duration}s. Edição: #${result.edition}`)
    console.log(`📝 [CRON] Newsletter salva como draft. Publicação manual necessária no painel.`)

    // Publicação Automática removida - Human-in-the-Loop requerido
    // A publicação deve ser feita manualmente através do botão "Publicar" no painel admin

    return NextResponse.json({
      success: true,
      message: 'Newsletter generated and saved as draft',
      edition: result.edition,
      duration,
      status: 'draft'
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
