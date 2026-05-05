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
  if (upper.includes('IA') || upper.includes('INTELIGÊNCIA')) return '#A78BFA'; // Lavender
  if (upper.includes('DEV') || upper.includes('ENGENHARIA') || upper.includes('CODING')) return '#10B981'; // Emerald
  if (upper.includes('SEC') || upper.includes('CIBER') || upper.includes('HACKER')) return '#F43F5E'; // Rose
  if (upper.includes('STARTUP') || upper.includes('BUSINESS') || upper.includes('MERCADO')) return '#F59E0B'; // Amber
  return '#8b5cf6'; // Violet
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

  return (    <div className="bg-background min-h-screen text-foreground font-sans selection:bg-primary/30">
      {/* Header Liquid Glass */}
      <div className="fixed top-8 left-0 right-0 z-50 px-6">
        <header className="max-w-5xl mx-auto glass-nav h-20 px-10 rounded-full flex items-center justify-between border border-white/5 shadow-2xl">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-xs">FN</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-foreground md:block">Fresh News</span>
          </Link>
          <nav className="flex items-center gap-8">
            <Link href="/" className="tech-label hover:text-primary transition-all hidden md:block opacity-40">
              VOLTAR AO TERMINAL
            </Link>
            <Link href="/#subscribe">
              <button className="bg-primary text-white hover:bg-white hover:text-black px-10 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/25">
                Assinar Zine
              </button>
            </Link>
          </nav>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-52 pb-32">
        
        {/* INFO DA EDIÇÃO - Glass Badges */}
        <div className="flex flex-wrap items-center gap-4 mb-20">
          <span className="px-5 py-2.5 tech-label bg-primary text-white rounded-full shadow-xl shadow-primary/30">
            EDIÇÃO #{newsletter.edition_number}
          </span>
          <span className="px-5 py-2.5 tech-label glass-card border-white/5 text-muted-foreground/40 rounded-full">
            SYNC: {format(new Date(newsletter.created_at), "dd.MM.yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* TÍTULO & INTRODUÇÃO */}
        <div className="space-y-12 mb-32">
          <h1 className="text-5xl md:text-8xl font-heading font-bold tracking-tight text-foreground leading-[0.9]">
            {content.title}
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-muted-foreground/60 leading-relaxed border-l-2 border-primary/30 pl-12 py-4 italic">
            {content.intro}
          </p>
        </div>

        {/* QUICK TAKES - Glass Receptacle */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="glass-card p-12 md:p-20 rounded-[4rem] border-white/5 mb-44 relative overflow-hidden shadow-2xl bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
            <h2 className="tech-label mb-12 flex items-center gap-4 text-primary/80">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span> 
              GIRO TECH · QUICK LOGS
            </h2>
            <ul className="space-y-10">
              {content.quickTakes.map((take: string, idx: number) => (
                <li key={idx} className="text-foreground text-xl md:text-2xl font-bold leading-tight flex items-start group">
                  <span className="text-primary/30 mr-8 font-bold transition-transform group-hover:translate-x-3 text-2xl leading-none">/</span>
                  <span className="group-hover:text-primary transition-colors duration-300">{take}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CATEGORIAS (BLOCOS PRINCIPAIS) */}
        <div className="space-y-56">
          {content.categories?.map((cat: any, catIdx: number) => {
            const catColor = getCategoryColor(cat.name);
            return (
              <section key={catIdx} className="relative">
                <div className="flex items-center gap-8 mb-20">
                  <h2 
                    className="text-4xl md:text-6xl font-heading font-bold tracking-tight"
                    style={{ color: catColor }}
                  >
                    {cat.name}
                  </h2>
                  <div className="flex-grow h-[1px] opacity-10" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] font-bold opacity-20 uppercase tracking-[0.6em]">
                    SEC_{catIdx.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-32">
                  {cat.items?.map((item: any, itemIdx: number) => (
                    <article key={itemIdx} className="group relative">
                      <div className="max-w-3xl space-y-10">
                        <h3 className="text-3xl md:text-5xl font-heading font-bold text-foreground leading-[1.1] tracking-tight group-hover:text-primary transition-colors duration-300">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/20 decoration-1 underline-offset-[12px]">
                            {item.headline}
                          </a>
                        </h3>
                        
                        <p className="text-muted-foreground/70 text-xl md:text-2xl leading-relaxed font-medium">
                          {item.story}
                        </p>
                        
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-4 tech-label transition-all hover:gap-8"
                          style={{ color: catColor }}
                        >
                          DEEP DIVE DOCS <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ASSINATURA FINAL - Floating Glass */}
        <div className="mt-64 p-16 md:p-32 glass-card rounded-[5rem] text-center relative overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
          <div className="absolute inset-0 bg-scanlines opacity-[0.03]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"></div>
          
          <h3 className="text-4xl md:text-7xl font-heading font-bold text-foreground mb-10 tracking-tight">Fim da Transmissão</h3>
          <p className="text-muted-foreground/60 text-xl md:text-2xl mb-20 max-w-2xl mx-auto font-medium italic">
            O Fresh News é destilado para quem constrói o amanhã. <br /> Não perca a próxima sincronização técnica.
          </p>
          <Link href="/#subscribe">
            <button className="bg-primary text-white hover:bg-white hover:text-black px-20 py-7 rounded-full font-bold uppercase tracking-[0.5em] text-[10px] transition-all shadow-2xl shadow-primary/30">
              ENTRAR NA REDE DE ASSINANTES
            </button>
          </Link>
        </div>

      </main>

      {/* FOOTER Liquid Glass */}
      <footer className="bg-white/[0.01] backdrop-blur-3xl border-t border-white/5 py-24 text-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">FN</span>
            </div>
            <span className="font-heading font-bold text-xs tracking-[0.5em] uppercase text-foreground/50">Fresh News // Premium Intelligence</span>
          </div>
          <div className="text-muted-foreground/10 text-[10px] font-bold uppercase tracking-[0.8em]">
            Binary BroadSheet // SINCE_2026
          </div>
        </div>
      </footer>
    </div>
  )
}
