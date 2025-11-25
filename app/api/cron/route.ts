import { generateNewsletterService } from '@/lib/services/newsletter'
import { publishNewsletter } from '@/actions/publish'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // Estende o timeout para 300s (5min) para acomodar geração + envio de e-mails
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

    // Publicação Automática
    if (result.success && result.id) {
      console.log(`🚀 [CRON] Iniciando publicação automática da edição ${result.edition}...`)
      const pubResult = await publishNewsletter(result.id)

      if (!pubResult.success) {
        console.error('⚠️ [CRON] Falha ao enviar e-mails:', pubResult.message)
      } else {
        console.log('✅ [CRON] E-mails enviados com sucesso:', pubResult.message)
      }
    }

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
