import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, ArrowRight } from 'lucide-react'

interface NewsCardProps {
  id: string
  edition: number
  title: string
  date: string
  intro?: string
}

export function NewsCard({ id, edition, title, date, intro }: NewsCardProps) {
  return (
    <Link href={`/archive/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">Edição #{edition}</Badge>
            <div className="flex items-center text-muted-foreground text-xs">
              <CalendarDays className="w-3 h-3 mr-1" />
              {format(new Date(date), "d 'de' MMM, yyyy", { locale: ptBR })}
            </div>
          </div>
          <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {intro || 'Sem descrição disponível.'}
          </p>
        </CardContent>
        <CardFooter>
          <div className="text-sm font-medium text-primary flex items-center hover:underline">
            Ler edição completa <ArrowRight className="ml-1 w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

