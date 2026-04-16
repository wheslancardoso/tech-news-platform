'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Trash2 } from 'lucide-react'
import { PublishButton } from '@/components/publish-button'
import { Button } from '@/components/ui/button'
import { deleteNewsletter } from '@/actions/admin'
import { useState } from 'react'
import { toast } from 'sonner'
import { getThemeConfig, ThemeConfig } from '@/lib/chameleon-theme'

interface NewsCardProps {
  id: string
  edition: number
  title: string
  date: string
  intro?: string
  status?: 'draft' | 'published'
  isAdmin?: boolean
  category?: string
  themeConfig?: ThemeConfig
}

export function NewsCard({ id, edition, title, date, intro, status = 'published', isAdmin = false, category = 'tech', themeConfig }: NewsCardProps) {
  const dateObj = new Date(date)
  const [isDeleting, setIsDeleting] = useState(false)
  const theme = getThemeConfig(category, themeConfig)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`ATENÇÃO: Isso excluirá a Edição #${edition} permanentemente e reajustará o índice de todas as edições posteriores. Continuar?`)) {
      return
    }

    setIsDeleting(true)
    const result = await deleteNewsletter(id, edition)
    if (!result.success) {
      toast.error(result.message)
      setIsDeleting(false)
    } else {
      toast.success(result.message)
    }
  }

  return (
    <div className="h-full">
      <article
        className="h-full bg-card relative group transition-all duration-300 flex flex-col"
        style={{
          borderLeft: `3px solid ${theme.accent}`,
        }}
      >
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}08 0%, transparent 60%)`,
          }}
        />

        {/* Link Principal (Overlay) */}
        <Link href={`/archive/${id}`} className="absolute inset-0 z-0">
          <span className="sr-only">Ver edição</span>
        </Link>

        <div className="p-5 md:p-6 flex flex-col flex-grow pointer-events-none relative z-10">

          {/* Header: Badge + Edition + Date */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Category Badge — camaleônico */}
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                style={{
                  color: theme.accent,
                  border: `1px solid ${theme.accent}30`,
                  background: `${theme.accent}10`,
                }}
              >
                {theme.badgeLabel}
              </span>

              <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                {format(dateObj, "dd.MM.yy", { locale: ptBR })}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              {status === 'draft' && isAdmin && (
                <Badge variant="secondary" className="text-[9px] h-4 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5">
                  DRAFT
                </Badge>
              )}
              <span className="text-[10px] font-mono text-muted-foreground/60">
                #{String(edition).padStart(3, '0')}
              </span>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex justify-end gap-2 pt-2 pb-3 border-t border-dashed border-border pointer-events-auto relative z-20">
              <PublishButton id={id} status={status} />

              {status === 'draft' && (
                <Link href={`/archive/${id}/edit`}>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] border-border" title="Editar Draft">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                  </Button>
                </Link>
              )}

              <Button
                size="sm"
                variant="destructive"
                className="h-7 px-2 text-[10px]"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Excluir Edição"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Title */}
          <h3
            className={`text-lg md:text-xl font-black leading-tight tracking-[-0.02em] mb-3 text-foreground group-hover:text-white transition-colors ${theme.titleStyle || ''}`}
          >
            {title}
          </h3>

          {/* Summary */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-grow">
            {intro || 'Sem descrição disponível.'}
          </p>
        </div>

        {/* Bottom: Read link with accent */}
        <div className="px-5 md:px-6 pb-5 md:pb-6 mt-auto pointer-events-none relative z-10">
          <div
            className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1 transition-all duration-300 group-hover:gap-2"
            style={{ color: theme.accent }}
          >
            Ler edição
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="h-[2px] w-0 group-hover:w-full transition-all duration-500 ease-out"
          style={{ background: theme.accent }}
        />
      </article>
    </div>
  )
}
