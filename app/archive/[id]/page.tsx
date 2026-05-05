import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ArchivePageProps {
  params: Promise<{
    id: string
  }>
}

const getCategoryColor = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes('IA') || upper.includes('INTELIGÊNCIA')) return '#00F0FF';
  if (upper.includes('DEV') || upper.includes('ENGENHARIA') || upper.includes('CODING')) return '#00FF41';
  if (upper.includes('SEC') || upper.includes('CIBER') || upper.includes('HACKER')) return '#FF0000';
  if (upper.includes('STARTUP') || upper.includes('BUSINESS') || upper.includes('MERCADO')) return '#E10600';
  return '#ffffff';
};

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

  const content = newsletter.content_json;

  return (
    <div className="bg-background min-h-screen text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* HEADER EDITORIAL */}
      <header className="border-b-2 border-editorial bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm tracking-tighter">FN</span>
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground uppercase italic">Fresh News</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[10px] font-black tracking-[0.3em] uppercase">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Voltar ao Terminal</Link>
            <Link href="/#subscribe" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 transition-colors">
              Assinar Zine
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* INFO DA EDIÇÃO */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <span className="px-3 py-1 text-[10px] font-black bg-primary text-primary-foreground uppercase tracking-widest">
            EDIÇÃO #{newsletter.edition_number}
          </span>
          <span className="px-3 py-1 text-[10px] font-black border-2 border-editorial text-muted-foreground uppercase tracking-[0.2em]">
            SYNC: {format(new Date(newsletter.created_at), "dd.MM.yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* TÍTULO & INTRODUÇÃO */}
        <div className="space-y-8 mb-24">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] uppercase italic">
            {content.title}
          </h1>
          <p className="text-xl md:text-3xl font-medium text-muted-foreground leading-tight border-l-4 border-primary pl-8 py-2">
            {content.intro}
          </p>
        </div>

        {/* QUICK TAKES */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="bg-surface-container border-2 border-editorial p-10 mb-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rotate-45"></div>
            <h2 className="text-primary font-black text-xs mb-8 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-2 h-2 bg-primary animate-pulse"></span> ⚡ GIRO TECH // QUICK_LOGS
            </h2>
            <ul className="space-y-6">
              {content.quickTakes.map((take: string, idx: number) => (
                <li key={idx} className="text-foreground text-lg font-bold leading-snug flex items-start group">
                  <span className="text-primary mr-4 font-black transition-transform group-hover:translate-x-1">&gt;</span>
                  {take}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CATEGORIAS (BLOCOS PRINCIPAIS) */}
        <div className="space-y-32">
          {content.categories?.map((cat: any, catIdx: number) => {
            const catColor = getCategoryColor(cat.name);
            return (
              <section key={catIdx} className="relative group">
                <div className="flex items-center gap-4 mb-12">
                  <h2 
                    className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic"
                    style={{ color: catColor }}
                  >
                    {cat.name}
                  </h2>
                  <div className="flex-grow h-0.5 opacity-20" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                    SEC_{catIdx.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-16">
                  {cat.items?.map((item: any, itemIdx: number) => (
                    <article key={itemIdx} className="group/item relative">
                      <div className="absolute left-[-2rem] top-0 bottom-0 w-1 opacity-10 group-hover/item:opacity-100 transition-opacity" style={{ backgroundColor: catColor }} />
                      
                      <h3 className="text-2xl md:text-4xl font-black mb-6 text-foreground leading-none uppercase tracking-tight group-hover/item:text-primary transition-colors">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-4 underline-offset-8">
                          {item.headline}
                        </a>
                      </h3>
                      
                      <div className="max-w-2xl">
                        <p className="text-muted-foreground text-lg md:text-xl leading-tight mb-8 font-medium">
                          {item.story}
                        </p>
                      </div>
                      
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:translate-x-2"
                        style={{ color: catColor }}
                      >
                        Acessar Documentação Completa <ArrowRight className="ml-2 w-3 h-3" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ASSINATURA FINAL */}
        <div className="mt-40 p-12 bg-surface-container border-2 border-editorial text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-scanlines opacity-5"></div>
          <h3 className="text-4xl font-black text-foreground mb-6 uppercase tracking-tighter italic">Fim da Transmissão</h3>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto font-medium">
            O Fresh News é destilado para quem constrói. Não perca a próxima sincronização técnica.
          </p>
          <Link href="/#subscribe" className="inline-flex bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-5 font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105">
            Entrar na Rede de Assinantes
          </Link>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container border-t-2 border-editorial py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs">FN</span>
            </div>
            <span className="font-black text-lg tracking-tighter uppercase text-foreground">Fresh News</span>
          </div>
          <div className="text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.5em]">
            Binary BroadSheet // Since 2026
          </div>
        </div>
      </footer>
    </div>
  )
}
