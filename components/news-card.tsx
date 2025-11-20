import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { PublishButton } from '@/components/publish-button'

interface NewsCardProps {
  id: string
  edition: number
  title: string
  date: string
  intro?: string
  status?: 'draft' | 'published' // Adicionado status
}

export function NewsCard({ id, edition, title, date, intro, status = 'published' }: NewsCardProps) {
  const dateObj = new Date(date)
  
  return (
    <div className="relative group h-full">
      {/* Botão de Publicar (Visível apenas se draft) */}
      <PublishButton id={id} status={status} />

      <Link href={`/archive/${id}`} className="block h-full">
        <article className="h-full bg-white border border-border transition-all duration-200 ease-in-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col rounded-lg overflow-hidden">
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {format(dateObj, "d MMM", { locale: ptBR })}
              </span>
              <div className="flex gap-2 items-center">
                {status === 'draft' && (
                  <Badge variant="secondary" className="text-[10px] h-5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    Draft
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] font-normal px-2 py-0 h-5">
                  #{edition}
                </Badge>
              </div>
            </div>
            
            <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-grow">
              {intro || 'Sem descrição disponível.'}
            </p>
          </div>
          
          <div className="px-6 pb-6 pt-0 mt-auto">
            <div className="text-xs font-semibold text-primary flex items-center group-hover:underline underline-offset-4">
              Ler edição <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}
