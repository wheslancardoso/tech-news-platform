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

  return (    <div className="bg-background min-h-screen text-foreground font-sans selection:bg-primary/30">
      {/* Header Liquid Glass */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-5xl mx-auto glass-nav h-20 px-8 rounded-full flex items-center justify-between border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm tracking-tighter">FN</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-foreground uppercase italic hidden md:block">Fresh News</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all hidden md:block">
              Voltar ao Terminal
            </Link>
            <Link href="/#subscribe">
              <button className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20">
                Assinar Zine
              </button>
            </Link>
          </nav>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-44 pb-32">
        
        {/* INFO DA EDIÇÃO - Glass Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
          <span className="px-4 py-1.5 text-[10px] font-black bg-primary text-white rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
            EDIÇÃO #{newsletter.edition_number}
          </span>
          <span className="px-4 py-1.5 text-[10px] font-black glass-card border-white/10 text-muted-foreground rounded-full uppercase tracking-[0.3em]">
            SYNC: {format(new Date(newsletter.created_at), "dd.MM.yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* TÍTULO & INTRODUÇÃO */}
        <div className="space-y-12 mb-32">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase italic">
            {content.title}
          </h1>
          <p className="text-2xl md:text-4xl font-medium text-muted-foreground leading-tight border-l-4 border-primary pl-10 py-4 italic">
            {content.intro}
          </p>
        </div>

        {/* QUICK TAKES - Glass Receptacle */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="glass-card p-12 md:p-16 rounded-[3rem] border-white/10 mb-32 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            <h2 className="text-primary font-black text-xs mb-10 uppercase tracking-[0.5em] flex items-center gap-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span> ⚡ GIRO TECH // QUICK_LOGS
            </h2>
            <ul className="space-y-8">
              {content.quickTakes.map((take: string, idx: number) => (
                <li key={idx} className="text-foreground text-xl font-bold leading-tight flex items-start group">
                  <span className="text-primary mr-6 font-black transition-transform group-hover:translate-x-2 text-2xl leading-none">/</span>
                  <span className="group-hover:text-primary transition-colors">{take}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CATEGORIAS (BLOCOS PRINCIPAIS) */}
        <div className="space-y-44">
          {content.categories?.map((cat: any, catIdx: number) => {
            const catColor = getCategoryColor(cat.name);
            return (
              <section key={catIdx} className="relative">
                <div className="flex items-center gap-6 mb-16">
                  <h2 
                    className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic"
                    style={{ color: catColor }}
                  >
                    {cat.name}
                  </h2>
                  <div className="flex-grow h-[1px] opacity-10" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">
                    SEC_{catIdx.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-24">
                  {cat.items?.map((item: any, itemIdx: number) => (
                    <article key={itemIdx} className="group relative">
                      <div className="max-w-3xl space-y-8">
                        <h3 className="text-3xl md:text-5xl font-black text-foreground leading-[0.9] uppercase tracking-tight group-hover:text-primary transition-colors">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary/30 decoration-2 underline-offset-8">
                            {item.headline}
                          </a>
                        </h3>
                        
                        <p className="text-muted-foreground text-xl md:text-2xl leading-tight font-medium">
                          {item.story}
                        </p>
                        
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:gap-6"
                          style={{ color: catColor }}
                        >
                          DEEP_DIVE_FULL_DOCS <ArrowRight className="w-4 h-4" />
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
        <div className="mt-56 p-16 md:p-24 glass-card rounded-[4rem] text-center relative overflow-hidden border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-scanlines opacity-5"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"></div>
          
          <h3 className="text-4xl md:text-6xl font-black text-foreground mb-8 uppercase tracking-tighter italic">Fim da Transmissão</h3>
          <p className="text-muted-foreground text-xl mb-16 max-w-2xl mx-auto font-medium italic">
            O Fresh News é destilado para quem constrói. Não perca a próxima sincronização técnica.
          </p>
          <Link href="/#subscribe">
            <button className="bg-primary text-white hover:bg-white hover:text-black px-16 py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all shadow-2xl shadow-primary/30">
              ENTRAR NA REDE DE ASSINANTES
            </button>
          </Link>
        </div>

      </main>

      {/* FOOTER Liquid Glass */}
      <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/5 py-24 text-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">FN</span>
            </div>
            <span className="font-black text-xs tracking-[0.4em] uppercase text-foreground italic">Fresh News // Premium Intelligence</span>
          </div>
          <div className="text-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.6em]">
            Binary BroadSheet // SINCE_2026
          </div>
        </div>
      </footer>
    </div>
  )
}
