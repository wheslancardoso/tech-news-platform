import { ingestPostsService } from '@/lib/services/newsletter'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // Estende o timeout para 300s (5min) para acomodar a ingestão
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const start = Date.now()

  // Verifica parâmetro de força manual via URL (?force=true)
  const forceRun = request.nextUrl.searchParams.get('force') === 'true'

  // ===== MODO MANUAL (force=true) =====
  // Bypass total: ignora ENABLE_CRON_JOB e Authorization
  if (forceRun) {
    console.log(`🔧 [CRON] Execução FORÇADA Manual às: ${new Date().toISOString()}`)
  } else {
    // ===== MODO AUTOMÁTICO (Cron Vercel) =====
    // Verificações de segurança estritas

    // 1. Kill Switch via env var
    if (process.env.ENABLE_CRON_JOB !== 'true') {
      return NextResponse.json(
        { status: 'skipped', message: 'Cron Job disabled. Use ?force=true to run manually.' },
        { status: 200 }
      )
    }

    // 2. Verificação do Bearer Token
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn(`🔒 [CRON] Acesso negado. Header recebido: ${authHeader ? 'Presente (Inválido)' : 'Ausente'}`)
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`🕒 [CRON] Iniciando Job Automático às: ${new Date().toISOString()}`)
  }

  try {
    console.log('🚀 [CRON] Iniciando serviço de ingestão...')

    const result = await ingestPostsService()
    const duration = (Date.now() - start) / 1000

    console.log(`✅ [CRON] Ingestão concluída! Duração: ${duration}s`)
    console.log(`📊 [CRON] ${result.inserted} posts inseridos, ${result.skipped} ignorados`)

    return NextResponse.json({
      success: true,
      message: 'Posts ingested successfully',
      stats: {
        total: result.total,
        inserted: result.inserted,
        skipped: result.skipped,
        avgScore: result.avgScore,
        maxScore: result.maxScore,
        minScore: result.minScore
      },
      duration
    })
  } catch (error: any) {
    console.error('❌ [CRON] Erro Crítico:', error.message)
    console.error(error.stack)

    return NextResponse.json(
      { success: false, message: 'Failed to ingest posts', error: error.message },
      { status: 500 }
    )
  }
}
