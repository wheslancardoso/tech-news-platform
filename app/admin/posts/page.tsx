import { createAdminClient } from '@/lib/supabase/admin'
import { publishNewsletter, rejectNewsletter } from '@/actions/newsletters'
import { Check, X, TrendingUp, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminPostsPage() {
  const supabase = createAdminClient()
  
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500 glass-card rounded-2xl border-red-500/20 bg-red-500/5">Erro ao carregar newsletters: {error.message}</div>
  }

  return (
    <div className="space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full border-white/10 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#8B5CF6]"></span>
            <span className="tech-label text-primary">Status // Protocolo Curadoria</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-none">
            Inbox de <br />
            <span className="text-primary">Curadoria</span>
          </h1>
        </div>
        <div className="px-6 py-3 glass-card rounded-2xl border-white/10 tech-label text-muted-foreground">
          Aguardando Operador
        </div>
      </header>

      {/* Seção de Métricas (Inspirada no Protótipo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12" />
          </div>
          <p className="tech-label text-muted-foreground mb-4">Tráfego Diário</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black tracking-tighter">42.8K</h3>
            <span className="text-[10px] font-black text-emerald-500">+12.4%</span>
          </div>
        </div>
        <div className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <p className="tech-label text-muted-foreground mb-4">Taxa de Conversão</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black tracking-tighter">8.2%</h3>
            <span className="text-[10px] font-black text-emerald-500">Estável</span>
          </div>
        </div>
        <div className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-12 h-12" />
          </div>
          <p className="tech-label text-muted-foreground mb-4">Tempo de Sessão</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black tracking-tighter">04:12</h3>
            <span className="text-[10px] font-black text-muted-foreground/40">Média</span>
          </div>
        </div>
      </div>
 
      {newsletters?.length === 0 ? (
        <div className="p-32 text-center glass-card rounded-[4rem] border-white/5 border-dashed relative overflow-hidden">
          <p className="tech-label text-muted-foreground/40">Fila de processamento vazia</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {newsletters?.map((newsletter) => (
            <div key={newsletter.id} className="glass-card rounded-[2.5rem] border-white/5 flex flex-col lg:flex-row gap-0 hover:border-primary/20 transition-all relative group overflow-hidden shadow-xl">
              
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]" />

              <div className="flex-1 p-10 lg:p-12 relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <span className="px-4 py-1.5 tech-label bg-primary text-white rounded-full shadow-lg shadow-primary/20">
                    {newsletter.category || 'GERAL'}
                  </span>
                  <span className="px-4 py-1.5 tech-label glass-card border-white/10 text-muted-foreground rounded-full">
                    VOL. {newsletter.edition_number}
                  </span>
                  <span className="tech-label text-muted-foreground/30 ml-2">
                    {new Date(newsletter.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-5xl font-black mb-6 text-foreground leading-[0.95] uppercase tracking-tighter group-hover:text-primary transition-colors">
                  {newsletter.title}
                </h3>
                
                <p className="text-muted-foreground mb-10 text-lg md:text-xl leading-snug max-w-3xl font-medium border-l-2 border-primary/20 pl-8 py-1">
                  {newsletter.summary_intro}
                </p>

                {newsletter.content_json?.categories?.length > 0 && (
                  <div className="glass-card bg-white/[0.01] p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 tech-label text-white/5">Content_Sync</div>
                    <div className="space-y-10">
                      {newsletter.content_json.categories.map((cat: any, catIdx: number) => (
                        <div key={catIdx}>
                          <h4 className="text-primary font-black text-[10px] mb-4 uppercase tracking-[0.4em] flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#8B5CF6]"></span> {cat.name}
                          </h4>
                          <ul className="space-y-3">
                            {cat.items?.map((item: any, idx: number) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-6 border-l border-white/5 group/item">
                                <span className="font-bold uppercase tracking-tight text-foreground group-hover/item:text-primary transition-colors block mb-1">{item.headline}</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="tech-label text-muted-foreground/30 hover:text-white transition-all">
                                  Ver Fonte Externa
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

              <div className="flex flex-row lg:flex-col shrink-0 lg:w-48 glass-card bg-white/[0.02] border-0 border-l border-white/5">
                <form action={publishNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <button type="submit" className="w-full h-full lg:h-1/2 flex flex-col items-center justify-center gap-3 bg-transparent text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border-r lg:border-r-0 lg:border-b border-white/5 group/btn">
                    <Check className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    <span className="tech-label">Aprovar</span>
                  </button>
                </form>
                <form action={rejectNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <button type="submit" className="w-full h-full lg:h-1/2 flex flex-col items-center justify-center gap-3 bg-transparent text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all group/btn">
                    <X className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    <span className="tech-label">Rejeitar</span>
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
