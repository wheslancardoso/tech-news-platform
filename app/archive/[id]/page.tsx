import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Facebook, Instagram, Twitter, Linkedin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      {/* Header Unificado */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">TN</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">Tech News</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/#archive" className="hover:text-black transition-colors">Edições</Link>
            <Link href="#" className="hover:text-black transition-colors">Sobre</Link>
            <Button size="sm" className="bg-black text-white hover:bg-zinc-800 rounded-full px-6">
              Inscrever-se
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-slate-50">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Botão Voltar */}
          <div className="mb-8">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-black transition-colors inline-flex items-center group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para edições
            </Link>
          </div>

          <article className="bg-white rounded-xl border shadow-sm p-8 md:p-12">
            {/* Cabeçalho do Artigo */}
            <div className="mb-10 text-center border-b pb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                 <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                    Edição #{newsletter.edition_number}
                 </Badge>
                 <span className="text-sm text-muted-foreground">
                   {format(new Date(newsletter.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                 </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
                {newsletter.title}
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl mx-auto font-light">
                {newsletter.summary_intro}
              </p>
            </div>

            {/* Conteúdo HTML Renderizado */}
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900
              prose-li:marker:text-slate-400"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />

            {/* CTA Final */}
            <div className="mt-16 pt-10 border-t bg-slate-50 -mx-8 -mb-12 md:-mx-12 md:-mb-12 p-8 md:p-12 text-center rounded-b-xl">
              <h3 className="text-xl font-bold mb-2">Gostou desta edição?</h3>
              <p className="text-muted-foreground mb-6 text-sm">Receba conteúdo como este toda manhã na sua caixa de entrada.</p>
              <Link href="/#subscribe">
                <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-8">
                  Inscrever-se Gratuitamente
                </Button>
              </Link>
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">TN</span>
                </div>
                <span className="font-bold text-lg tracking-tight">Tech News</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Curadoria de notícias de tecnologia feita para desenvolvedores e entusiastas. Sem spam, apenas conteúdo.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-black">Últimas Edições</Link></li>
                <li><Link href="#" className="hover:text-black">Sobre Nós</Link></li>
                <li><Link href="#" className="hover:text-black">Patrocine</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Social</h4>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-black"><Twitter size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-black"><Instagram size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-black"><Linkedin size={20} /></Link>
                <Link href="#" className="text-muted-foreground hover:text-black"><Facebook size={20} /></Link>
              </div>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2025 Tech News API. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-black">Privacidade</Link>
              <Link href="#" className="hover:text-black">Termos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
