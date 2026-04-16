import { createClient } from '@/lib/supabase/server'
import { getThemeConfig } from '@/lib/chameleon-theme'
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: newsletter, error } = await supabase
      .from('newsletters')
      .select('title, edition_number, created_at, category, theme_config, cover_url')
      .eq('id', id)
      .single()

    if (error || !newsletter) {
      return new Response('Newsletter not found', { status: 404 })
    }

    const theme = getThemeConfig(newsletter.category, newsletter.theme_config)
    const title = (newsletter.title || 'SEM TÍTULO').toUpperCase()
    const edition = `#${String(newsletter.edition_number).padStart(3, '0')}`
    const date = new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0D0D0D',
            padding: '60px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Cover background */}
          {newsletter.cover_url && (
            <img
              src={newsletter.cover_url}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
                filter: 'grayscale(60%) contrast(120%)',
              }}
            />
          )}

          {/* Left accent border */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              background: theme.accent,
            }}
          />

          {/* Top: Logo + Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* FN Square */}
            <div
              style={{
                width: '48px',
                height: '48px',
                background: theme.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#000', fontWeight: 900, fontSize: '18px' }}>FN</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase' as const }}>
                FRESH NEWS
              </span>
              <span style={{ color: theme.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
                {theme.tagline}
              </span>
            </div>
          </div>

          {/* Middle: Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center', paddingTop: '20px', paddingBottom: '20px' }}>
            <div
              style={{
                color: 'white',
                fontSize: title.length > 60 ? 42 : title.length > 40 ? 52 : 64,
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase' as const,
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom: Edition + Date */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `2px solid ${theme.accent}40`,
              paddingTop: '20px',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ color: theme.accent, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>
                {theme.badgeLabel} {edition}
              </span>
              <span style={{ color: '#666', fontSize: '13px', fontWeight: 700 }}>
                {date}
              </span>
            </div>
            <span style={{ color: '#444', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
              FRESHNEWS.DEV
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (err) {
    console.error('OG Image Generation Error:', err)
    return new Response('Failed to generate image', { status: 500 })
  }
}
