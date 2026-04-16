'use client'

import { forwardRef } from 'react'
import { type ThemeConfig } from '@/lib/chameleon-theme'

interface CoverTemplateProps {
  title: string
  edition: number
  date: string
  category: string
  theme: ThemeConfig
  imageUrl?: string
}

export const CoverTemplate = forwardRef<HTMLDivElement, CoverTemplateProps>(
  function CoverTemplate({ title, edition, date, category, theme, imageUrl }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1080px',
          backgroundColor: '#0D0D0D',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          fontFamily: 'var(--font-geist-sans), Inter, sans-serif',
        }}
      >
        {/* Background image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(50%) contrast(120%) brightness(80%)',
            }}
          />
        )}

        {/* Noise overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.06,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            zIndex: 1,
          }}
        />

        {/* Dark gradient for readability */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Left accent border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '8px',
            height: '100%',
            background: theme.accent,
            zIndex: 10,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
          }}
        >
          {/* Top: Logo + Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* FN Square */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#000', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.05em' }}>
                  FN
                </span>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                  FRESH NEWS
                </div>
                <div style={{ color: theme.accent, fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {theme.tagline}
                </div>
              </div>
            </div>

            {/* Category badge */}
            <div
              style={{
                padding: '8px 20px',
                border: `2px solid ${theme.accent}`,
                color: theme.accent,
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {theme.icon} {theme.badgeLabel}
            </div>
          </div>

          {/* Middle: spacer */}
          <div />

          {/* Bottom: Title + Footer */}
          <div>
            <h1
              style={{
                color: '#fff',
                fontWeight: 900,
                fontSize: title.length > 80 ? '56px' : title.length > 50 ? '68px' : '80px',
                lineHeight: 0.92,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                textShadow: '0 4px 8px rgba(0,0,0,0.8)',
                marginBottom: '40px',
              }}
            >
              {title}
            </h1>

            {/* Footer bar */}
            <div
              style={{
                borderTop: `3px solid ${theme.accent}`,
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <span
                  style={{
                    color: theme.accent,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  EDIÇÃO #{String(edition).padStart(3, '0')}
                </span>
                <span
                  style={{
                    color: '#666',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {date}
                </span>
              </div>
              <span
                style={{
                  color: '#444',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                FRESHNEWS.DEV
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
