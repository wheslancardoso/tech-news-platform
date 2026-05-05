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

interface NewsCardProps {
  id: string
  edition: number
  title: string
  date: string
  intro?: string
  status?: 'draft' | 'published'
  isAdmin?: boolean
}

export function NewsCard({ id, edition, title, date, intro, status = 'published', isAdmin = false }: NewsCardProps) {
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
    <div className="group relative h-full glass-card rounded-3xl overflow-hidden flex flex-col hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
      {/* Categoria Badge (Glass Style) */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md border border-white/10 shadow-xl bg-black/20 text-white">
          {status === 'draft' ? 'RASCUNHO' : 'PÚBLICO'}
        </span>
      </div>

      {/* Imagem com Overlay de Vidro */}
      <div className="aspect-[16/10] bg-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
        <img
          src={`https://picsum.photos/seed/${id}/800/500`}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
        />
      </div>

      <div className="p-8 flex flex-col flex-grow">
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          <span>Edição #{edition}</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>{format(dateObj, "d MMM yyyy", { locale: ptBR })}</span>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2 italic">
          {title}
        </h3>

        {/* Intro */}
        <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 mb-8 font-medium">
          {intro || 'Análise técnica em progresso. Aguarde a sincronização.'}
        </p>

        <div className="mt-auto flex items-center justify-between relative z-20">
          <Link
            href={`/archive/${id}`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary group/link pointer-events-auto"
          >
            READ_TRANSMISSION
            <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
          </Link>

          {isAdmin && (
            <div className="flex gap-2 pointer-events-auto">
              <PublishButton id={id} status={status} />
              <button 
                onClick={handleDelete} 
                className="p-2 glass-card rounded-full hover:bg-destructive transition-colors group/del"
                disabled={isDeleting}
              >
                <Trash2 className="w-3 h-3 text-muted-foreground group-hover/del:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
