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
      alert(result.message)
      setIsDeleting(false)
    }
  }

  return (
    <div className="h-full">
      <article className="h-full bg-white border border-border transition-all duration-200 ease-in-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col rounded-lg overflow-hidden relative group">
        {/* Link Principal (Overlay) */}
        <Link href={`/archive/${id}`} className="absolute inset-0 z-0">
          <span className="sr-only">Ver edição</span>
        </Link>

        <div className="p-6 flex flex-col flex-grow pointer-events-none relative z-10">

          {/* Header: Data + Badges + Admin Controls */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {format(dateObj, "d MMM", { locale: ptBR })}
              </span>
              <div className="flex gap-2 items-center">
                {status === 'draft' && isAdmin && (
                  <Badge variant="secondary" className="text-[10px] h-5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    Draft
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] font-normal px-2 py-0 h-5">
                  #{edition}
                </Badge>
              </div>
            </div>

            {/* Admin Controls Row */}
            {isAdmin && (
              <div className="flex justify-end gap-2 pt-1 border-t border-dashed pointer-events-auto relative z-20">
                <PublishButton id={id} status={status} />

                {status === 'draft' && (
                  <Link href={`/archive/${id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      title="Editar Draft"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    </Button>
                  </Link>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 px-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Excluir Edição"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-grow">
            {intro || 'Sem descrição disponível.'}
          </p>
        </div>

        <div className="px-6 pb-6 pt-0 mt-auto pointer-events-none relative z-10">
          <div className="text-xs font-semibold text-primary flex items-center group-hover:underline underline-offset-4">
            Ler edição <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </div>
  )
}
