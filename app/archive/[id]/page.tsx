import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // Extrair apenas o miolo do HTML para evitar conflito de tags <html>/<body>
  let safeHtml = newsletter.html_content || '';
  const bodyMatch = safeHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    safeHtml = bodyMatch[1];
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-[hsl(186,100%,50%)] flex items-center justify-center">
              <span className="text-black font-black text-[10px] tracking-tighter">FN</span>
            </div>
            <span className="font-black text-lg tracking-[-0.06em] uppercase text-foreground">Fresh News</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            <Link href="/#archive" className="hover:text-foreground transition-colors">Edições</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Sobre</Link>
            <Link
              href="/#subscribe"
              className="px-4 py-1.5 bg-[hsl(186,100%,50%)] text-black font-bold text-[11px] tracking-wider hover:bg-[hsl(186,100%,60%)] transition-colors"
            >
              INSCREVER-SE
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
          {/* Botão Voltar */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 tracking-wider uppercase group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            VOLTAR
          </Link>

          <article className="bg-card border border-border p-8 md:p-12">
            {/* Cabeçalho do Artigo */}
            <div className="mb-10 pb-8 border-b border-border">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase text-[hsl(186,100%,50%)] border border-[hsl(186,100%,50%)]/30 bg-[hsl(186,100%,50%)]/10">
                  EDIÇÃO #{newsletter.edition_number}
                </span>
                <span className="text-xs font-mono text-muted-foreground tracking-wider">
                  {format(new Date(newsletter.created_at), "dd.MM.yyyy", { locale: ptBR })}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground leading-tight">
                {newsletter.title}
              </h1>
            </div>

            {/* Conteúdo HTML Renderizado */}
            <div
              className="email-renderer-full prose prose-invert max-w-none
                prose-headings:text-foreground prose-headings:font-black prose-headings:tracking-tight
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-[hsl(186,100%,50%)] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-img:border prose-img:border-border
                prose-code:text-[hsl(120,100%,50%)] prose-code:bg-card prose-code:px-1
                prose-pre:bg-[hsl(0,0%,7%)] prose-pre:border prose-pre:border-border
                prose-blockquote:border-l-[hsl(186,100%,50%)] prose-blockquote:text-muted-foreground
                prose-li:text-muted-foreground
                prose-hr:border-border
              "
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {/* CTA Final */}
            <div className="mt-16 pt-8 border-t-2 border-border text-center">
              <p className="text-[10px] font-mono text-[hsl(186,100%,50%)] tracking-widest uppercase mb-3">// TRANSMISSÃO ENCERRADA</p>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Gostou desta edição?</h3>
              <p className="text-muted-foreground mb-6 text-sm">Receba conteúdo como este toda manhã na sua caixa de entrada.</p>
              <Link href="/#subscribe">
                <button className="px-8 py-3 bg-[hsl(186,100%,50%)] text-black font-black text-xs tracking-widest uppercase hover:bg-[hsl(186,100%,60%)] transition-colors">
                  INSCREVER-SE GRATUITAMENTE
                </button>
              </Link>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8 bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/50 font-mono tracking-wider">
          <p>© 2025 FRESH NEWS. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="cursor-pointer hover:text-foreground transition-colors">PRIVACIDADE</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">TERMOS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
