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
    <div className="h-full group relative overflow-hidden bg-surface-container">
      <article className="h-full flex flex-col p-8 transition-all duration-300 ease-in-out hover:bg-surface-container-high relative">
        {/* Link Principal (Overlay) */}
        <Link href={`/archive/${id}`} className="absolute inset-0 z-0">
          <span className="sr-only">Ver edição</span>
        </Link>

        {/* Canto Decorativo (Chameleon Edge) */}
        <div className="absolute top-0 right-0 w-16 h-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>

        <div className="flex flex-col flex-grow pointer-events-none relative z-10">
          {/* Header: Data + Edição */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">
              {format(dateObj, "d MMM yyyy", { locale: ptBR })}
            </span>
            <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 border border-white/5 px-2 py-0.5">
              VOL. #{edition.toString().padStart(3, '0')}
            </span>
          </div>

          <h3 className="text-2xl font-black leading-[0.95] mb-6 uppercase italic tracking-tighter group-hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm font-medium leading-tight line-clamp-3 mb-8 border-l-2 border-white/10 pl-4">
            {intro || 'Análise técnica em progresso. Aguarde a sincronização.'}
          </p>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex gap-2 mb-6 pointer-events-auto relative z-20 pt-4 border-t border-white/5">
              <PublishButton id={id} status={status} />
              
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-3 uppercase text-[10px] font-black"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                DEL
              </Button>
            </div>
          )}
        </div>

        <div className="mt-auto pointer-events-none relative z-10 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center">
            Acessar Protocolo <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
          </div>
          <div className="w-2 h-2 bg-white/10 group-hover:bg-primary group-hover:animate-pulse"></div>
        </div>
      </article>
    </div>
  )
}
