import { createAdminClient } from '@/lib/supabase/admin'
import { publishNewsletter, rejectNewsletter } from '@/actions/newsletters'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminPostsPage() {
  const supabase = createAdminClient()
  
  // Usando service role pra ler tudo sem depender do RLS
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar newsletters: {error.message}</div>
  }

  return (
    <div className="bg-background min-h-screen text-foreground font-sans selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-white/5 pb-16">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full border-white/10 mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">System_Level_0 // Protocolo_Aprovação</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85]">
              Inbox de <br />
              <span className="text-primary drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Curadoria</span>
            </h1>
          </div>
          <div className="px-6 py-3 glass-card rounded-full border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-xl">
            Aguardando Decisão do Operador
          </div>
        </header>
 
      {newsletters?.length === 0 ? (
        <div className="p-32 text-center glass-card rounded-[4rem] border-white/5 border-dashed relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-scanlines opacity-5"></div>
          <p className="text-muted-foreground font-black text-xl uppercase tracking-[0.3em] italic">Nenhuma transmissão pendente de análise.</p>
          <div className="mt-12 inline-block px-8 py-3 glass-card rounded-full text-primary font-black text-[10px] uppercase tracking-widest animate-pulse">Scanning Grid...</div>
        </div>
      ) : (
        <div className="grid gap-12">
          {newsletters?.map((newsletter) => {
            return (
            <div key={newsletter.id} className="glass-card rounded-[3rem] border-white/10 flex flex-col lg:flex-row gap-0 hover:border-primary/30 transition-all relative group overflow-hidden shadow-2xl">
              
              {/* DNA Stripe Accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 group-hover:bg-primary transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
 
              <div className="flex-1 p-10 lg:p-16 relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <span className="px-4 py-1.5 text-[10px] font-black bg-primary text-white rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                    {newsletter.category || 'GERAL'}
                  </span>
                  <span className="px-4 py-1.5 text-[10px] font-black glass-card border-white/10 text-muted-foreground rounded-full uppercase tracking-widest">
                    VOL. #{newsletter.edition_number}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] ml-2 italic">
                    {new Date(newsletter.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-6xl font-black mb-8 text-foreground leading-[0.9] uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                  {newsletter.title}
                </h3>
                
                <p className="text-muted-foreground mb-12 text-lg md:text-2xl leading-tight max-w-3xl font-medium border-l-4 border-primary/20 pl-8 py-2 italic">
                  {newsletter.summary_intro}
                </p>
 
                {/* Conteúdo da Edição (Log View) - Nested Glass */}
                {newsletter.content_json?.categories?.length > 0 && (
                  <div className="glass-card bg-white/[0.01] p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Content_Sync_Log</div>
                    <div className="space-y-12">
                      {newsletter.content_json.categories.map((cat: any, catIdx: number) => (
                        <div key={catIdx}>
                          <h4 className="text-primary font-black text-[10px] mb-6 uppercase tracking-[0.4em] flex items-center gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span> {cat.name}
                          </h4>
                          <ul className="space-y-4">
                            {cat.items?.map((item: any, idx: number) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-6 border-l-2 border-white/5 group/item">
                                <span className="font-black uppercase tracking-tight text-foreground group-hover/item:text-primary transition-colors block mb-2">{item.headline}</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block text-[8px] font-black text-muted-foreground/40 hover:text-white uppercase tracking-[0.3em] border border-white/5 px-3 py-1 rounded-full transition-all">
                                  SOURCE_LINK // EXTERNAL
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
 
              <div className="flex flex-row lg:flex-col shrink-0 lg:w-56 glass-card bg-white/[0.02] border-0 border-l border-white/5">
                <form action={publishNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <button type="submit" className="w-full h-full lg:h-1/2 flex flex-col items-center justify-center gap-4 bg-transparent text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all border-r lg:border-r-0 lg:border-b border-white/5 group/btn">
                    <Check className="w-8 h-8 group-hover/btn:scale-125 transition-transform" />
                    <span className="font-black uppercase tracking-[0.4em] text-[10px]">Publicar</span>
                  </button>
                </form>
                <form action={rejectNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <button type="submit" className="w-full h-full lg:h-1/2 flex flex-col items-center justify-center gap-4 bg-transparent text-muted-foreground hover:bg-red-500 hover:text-white transition-all group/btn">
                    <X className="w-8 h-8 group-hover/btn:scale-125 transition-transform" />
                    <span className="font-black uppercase tracking-[0.4em] text-[10px]">Rejeitar</span>
                  </button>
                </form>
              </div>
            </div>
          )})}
        </div>
      )}
      </div>
    </div>
  )
}
