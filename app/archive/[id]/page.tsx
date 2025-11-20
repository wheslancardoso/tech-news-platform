import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ArchivePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !newsletter) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-muted-foreground hover:text-primary flex items-center text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            Edição #{newsletter.edition_number}
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            {newsletter.title}
          </h1>
          <div className="text-muted-foreground">
            {format(new Date(newsletter.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
        </div>

        {/* Renderização do conteúdo HTML seguro */}
        <article 
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600"
          dangerouslySetInnerHTML={{ __html: newsletter.html_content || '' }}
        />

        <div className="mt-12 pt-8 border-t text-center">
          <p className="mb-4 text-muted-foreground">Gostou desta edição?</p>
          <Button>Inscrever-se na Newsletter</Button>
        </div>
      </main>
    </div>
  )
}

