'use client'

import { useState, useRef, useCallback } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CoverTemplate } from '@/components/cover-template'
import { getThemeConfig, CATEGORY_KEYS } from '@/lib/chameleon-theme'
import { Download, Loader2, ImageIcon, RefreshCw } from 'lucide-react'
import { toJpeg } from 'html-to-image'
import { saveAs } from 'file-saver'

interface Newsletter {
  id: string
  title: string
  edition_number: number
  created_at: string
  category: string
  theme_config: any
  cover_url: string | null
  status: string
}

interface BackstageClientProps {
  newsletters: Newsletter[]
}

export default function BackstageClient({ newsletters }: BackstageClientProps) {
  const templateRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [customImages, setCustomImages] = useState<Record<string, string>>({})
  const [activeNewsletter, setActiveNewsletter] = useState<Newsletter | null>(null)

  const handleImageUpload = useCallback((newsletterId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomImages(prev => ({ ...prev, [newsletterId]: e.target!.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleGenerate = useCallback(async (newsletter: Newsletter) => {
    setGenerating(newsletter.id)
    setActiveNewsletter(newsletter)

    // Wait for template to render
    await new Promise(r => setTimeout(r, 500))

    try {
      if (!templateRef.current) throw new Error('Template not found')

      // Wait for fonts
      await document.fonts.ready
      await new Promise(r => setTimeout(r, 1500))

      const dataUrl = await toJpeg(templateRef.current, {
        quality: 0.92,
        pixelRatio: 1,
        width: 1080,
        height: 1080,
      })

      const slug = newsletter.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40)

      saveAs(dataUrl, `freshnews-${newsletter.edition_number}-${slug}.jpg`)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Erro ao gerar imagem.')
    } finally {
      setGenerating(null)
    }
  }, [customImages])

  return (
    <>
      {/* Grid de Newsletters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-border">
        {newsletters.map((newsletter) => {
          const theme = getThemeConfig(newsletter.category, newsletter.theme_config)
          const isGenerating = generating === newsletter.id

          return (
            <article
              key={newsletter.id}
              className="bg-card p-5 flex flex-col gap-4"
              style={{ borderLeft: `3px solid ${theme.accent}` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                    style={{
                      color: theme.accent,
                      border: `1px solid ${theme.accent}30`,
                      background: `${theme.accent}10`,
                    }}
                  >
                    {theme.icon} {theme.badgeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    #{String(newsletter.edition_number).padStart(3, '0')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60">
                  {format(new Date(newsletter.created_at), "dd.MM.yy", { locale: ptBR })}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-black leading-tight text-foreground uppercase tracking-tight line-clamp-2">
                {newsletter.title}
              </h3>

              {/* Image upload */}
              <div className="relative">
                <label
                  className="flex items-center justify-center gap-2 h-12 border border-dashed border-border hover:border-foreground/30 cursor-pointer transition-colors text-xs font-mono text-muted-foreground uppercase tracking-wider"
                >
                  <ImageIcon className="w-3 h-3" />
                  {customImages[newsletter.id] ? 'IMAGEM CARREGADA ✓' : 'UPLOAD IMAGEM (OPCIONAL)'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(newsletter.id, file)
                    }}
                  />
                </label>
                {customImages[newsletter.id] && (
                  <button
                    onClick={() => setCustomImages(prev => {
                      const next = { ...prev }
                      delete next[newsletter.id]
                      return next
                    })}
                    className="absolute top-1 right-1 text-[10px] font-mono text-muted-foreground hover:text-red-400 transition-colors px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Generate button */}
              <button
                onClick={() => handleGenerate(newsletter)}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 h-11 font-black text-[11px] tracking-widest uppercase transition-all disabled:opacity-40"
                style={{
                  background: theme.accent,
                  color: '#000',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    RENDERIZANDO...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    GERAR CARD [JPG]
                  </>
                )}
              </button>
            </article>
          )
        })}
      </div>

      {newsletters.length === 0 && (
        <div className="text-center py-24 border border-dashed border-border bg-card">
          <p className="text-muted-foreground font-mono text-sm">// SEM EDIÇÕES</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Nenhuma newsletter encontrada.</p>
        </div>
      )}

      {/* ═══ HIDDEN TEMPLATE — Rendered offscreen for capture ═══ */}
      <div
        className="fixed pointer-events-none overflow-hidden"
        style={{ top: '-9999px', left: '-9999px', zIndex: -9999 }}
      >
        {activeNewsletter && (
          <CoverTemplate
            ref={templateRef}
            title={activeNewsletter.title}
            edition={activeNewsletter.edition_number}
            date={format(new Date(activeNewsletter.created_at), "dd/MM/yyyy", { locale: ptBR })}
            category={activeNewsletter.category || 'tech'}
            theme={getThemeConfig(activeNewsletter.category, activeNewsletter.theme_config)}
            imageUrl={customImages[activeNewsletter.id] || activeNewsletter.cover_url || undefined}
          />
        )}
      </div>
    </>
  )
}
