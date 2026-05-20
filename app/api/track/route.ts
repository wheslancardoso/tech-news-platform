import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/track
 * Rastreia o clique do usuário em uma categoria e o redireciona para a URL final.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const subscriberId = searchParams.get('sub')
  const newsletterId = searchParams.get('nl')
  const category = searchParams.get('cat')
  const redirectUrl = searchParams.get('url')

  // Log de auditoria interna
  console.log(`[TRACKING] Clique detectado: subscriber=${subscriberId}, newsletter=${newsletterId}, category=${category}`)

  // O redirecionamento é prioritário para garantir UX, mas tentamos gravar o clique
  let fallbackRedirect = `/archive/${newsletterId || ''}`
  const targetUrl = redirectUrl || fallbackRedirect

  if (!subscriberId || !category) {
    console.warn('[TRACKING] Parâmetros insuficientes para registrar o clique', {
      subscriberId,
      category
    })
    return NextResponse.redirect(new URL(targetUrl, request.url), 307)
  }

  try {
    const supabase = createAdminClient()

    // Gravar o clique no banco
    const { error } = await supabase
      .from('user_clicks')
      .insert({
        subscriber_id: subscriberId,
        newsletter_id: newsletterId || null,
        category: category.trim()
      })

    if (error) {
      console.error('[TRACKING] Erro ao salvar clique no Supabase', {
        error,
        subscriberId,
        category
      })
    } else {
      console.log(`[TRACKING] Clique registrado com sucesso no banco para o assinante ${subscriberId}`)
    }

    // Processamento de ML Reativo / IA:
    // Atualizar as preferências de afinidade do usuário no Supabase
    // Vamos calcular os cliques recentes e atualizar a coluna 'preferences'
    await updateUserPreferencesFromClicks(supabase, subscriberId)

  } catch (err) {
    // Tratamento de erros explícito de acordo com 01_code_standards
    console.error('[TRACKING] Falha crítica no pipeline de rastreamento de cliques', {
      error: err instanceof Error ? err.message : err,
      subscriberId
    })
  }

  // Redireciona o usuário (307 Temporary Redirect para evitar cache agressivo de redirects do navegador)
  return NextResponse.redirect(new URL(targetUrl, request.url), 307)
}

/**
 * IA/ML Reativo: Re-calcula as preferências de categoria do usuário com base nos cliques mais frequentes.
 */
async function updateUserPreferencesFromClicks(supabase: any, subscriberId: string) {
  try {
    // 1. Buscar os cliques recentes do usuário (últimos 30 cliques ou últimos 14 dias)
    const { data: clicks, error: clicksError } = await supabase
      .from('user_clicks')
      .select('category')
      .eq('subscriber_id', subscriberId)
      .order('clicked_at', { ascending: false })
      .limit(30)

    if (clicksError || !clicks || clicks.length === 0) return

    // 2. Contar a frequência de cada categoria
    const categoryCounts: Record<string, number> = {}
    clicks.forEach((c: any) => {
      const cat = c.category
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    // 3. Ordenar as categorias pelo número de cliques e pegar as mais acessadas
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat)

    // 4. Salvar as preferências calculadas no cadastro do assinante
    // Mantemos as principais de interesse em destaque (ex: top 3 de interesse ativo)
    const topPreferences = sortedCategories.slice(0, 3)

    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ preferences: topPreferences })
      .eq('id', subscriberId)

    if (updateError) {
      console.error('[TRACKING-ML] Erro ao atualizar preferências do usuário via ML', {
        updateError,
        subscriberId,
        topPreferences
      })
    } else {
      console.log(`[TRACKING-ML] Preferências do usuário ${subscriberId} atualizadas dinamicamente via cliques:`, topPreferences)
    }

  } catch (err) {
    console.error('[TRACKING-ML] Falha crítica no recálculo de afinidade', {
      error: err instanceof Error ? err.message : err,
      subscriberId
    })
  }
}
