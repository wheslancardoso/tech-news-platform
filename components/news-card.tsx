'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Trash2, Edit2 } from 'lucide-react'
import { PublishButton } from '@/components/publish-button'
import { Button } from '@/components/ui/button'
import { deleteNewsletter } from '@/actions/admin'
import { useState } from 'react'
import { toast } from 'sonner'

interface NewsCardProps {
  id: string
  edition: number
  title: string
  date: string
  intro?: string
  status?: 'draft' | 'published'
  isAdmin?: boolean
  imageUrl?: string
}

export function NewsCard({ id, edition, title, date, intro, status = 'published', isAdmin = false, imageUrl }: NewsCardProps) {
  const dateObj = new Date(date)
  const [isDeleting, setIsDeleting] = useState(false)

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
    <div className="group relative h-full glass-card rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 border-white/5">
      {/* Invisible Link covering the whole card */}
      <Link 
        href={`/archive/${id}`} 
        className="absolute inset-0 z-10"
        aria-label={`Ver conteúdo da edição ${edition}`}
      />

      {/* Status Badge (Glass Style) */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <span className="px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase backdrop-blur-xl border border-white/10 shadow-2xl bg-black/40 text-white/80">
          {status === 'draft' ? 'RASCUNHO' : 'PÚBLICO'}
        </span>
      </div>

      {/* Imagem com Overlay de Vidro */}
      <div className="aspect-[16/10] bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
        <img
          src={imageUrl || `https://picsum.photos/seed/${id}/800/500`}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
        />
      </div>

      <div className="p-10 flex flex-col flex-grow relative z-20 pointer-events-none">
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-6 tech-label opacity-50">
          <span>Edição #{edition}</span>
          <span className="w-1 h-1 bg-primary/30 rounded-full" />
          <span>{format(dateObj, "dd.MM.yyyy", { locale: ptBR })}</span>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-heading font-bold mb-4 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Intro */}
        <p className="text-sm text-muted-foreground/60 leading-relaxed line-clamp-3 mb-10 font-medium italic">
          {intro || 'Análise técnica em progresso. Aguarde a sincronização.'}
        </p>

        <div className="mt-auto flex items-center justify-between pointer-events-auto">
          <div
            className="inline-flex items-center gap-4 tech-label text-primary hover:text-white transition-all group/link"
          >
            VER CONTEÚDO
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-2" />
          </div>

          {isAdmin && (
            <div className="flex gap-3 relative z-30">
              <PublishButton id={id} status={status} />
              {status === 'draft' && (
                <Link
                  href="/admin/newsletters"
                  title="Editar Draft"
                  className="p-2.5 glass-card rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all group/edit border-white/5 flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground/40 group-hover/edit:text-primary" />
                </Link>
              )}
              <button 
                onClick={handleDelete} 
                title="Excluir Edição"
                className="p-2.5 glass-card rounded-xl hover:bg-red-500/10 hover:border-red-500/20 transition-all group/del border-white/5"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground/40 group-hover/del:text-red-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
