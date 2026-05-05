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
    <div className="bg-background min-h-screen p-8 text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-b-2 border-editorial pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-foreground uppercase italic leading-[0.85]">
              Inbox de <span className="text-primary">Curadoria</span>
            </h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.3em]">
              Protocolo de Aprovação Editorial // System Level 0
            </p>
          </div>
          <div className="text-[10px] font-black border-2 border-editorial p-4 uppercase tracking-[0.2em] text-primary bg-surface-container">
            Aguardando Decisão do Operador
          </div>
        </header>

      {newsletters?.length === 0 ? (
        <div className="p-32 text-center border-2 border-dashed border-editorial bg-surface-container relative overflow-hidden">
          <div className="absolute inset-0 bg-scanlines opacity-5"></div>
          <p className="text-muted-foreground font-black text-xl uppercase tracking-tighter">Nenhuma transmissão pendente de análise.</p>
          <div className="mt-8 text-primary font-black text-[10px] uppercase tracking-widest animate-pulse">Scanning Grid...</div>
        </div>
      ) : (
        <div className="grid gap-12">
          {newsletters?.map((newsletter) => {
            return (
            <div key={newsletter.id} className="bg-surface-container border-2 border-editorial flex flex-col lg:flex-row gap-0 hover:border-primary transition-all relative group">
              
              {/* DNA Stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />

              <div className="flex-1 p-8 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-editorial">
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <span className="px-3 py-1 text-[10px] font-black bg-primary text-primary-foreground uppercase tracking-widest">
                    {newsletter.category || 'GERAL'}
                  </span>
                  <span className="px-3 py-1 text-[10px] font-black border-2 border-editorial text-muted-foreground uppercase tracking-widest">
                    VOL. #{newsletter.edition_number}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] ml-2">
                    {new Date(newsletter.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="text-3xl md:text-5xl font-black mb-8 text-foreground leading-[0.9] uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                  {newsletter.title}
                </h3>
                
                <p className="text-muted-foreground mb-12 text-lg md:text-xl leading-tight max-w-3xl font-medium border-l-4 border-white/5 pl-6 py-2">
                  {newsletter.summary_intro}
                </p>

                {/* Conteúdo da Edição (Log View) */}
                {newsletter.content_json?.categories?.length > 0 && (
                  <div className="bg-surface-container-high border-2 border-editorial p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/5 uppercase">Content_Log</div>
                    <div className="space-y-10">
                      {newsletter.content_json.categories.map((cat: any, catIdx: number) => (
                        <div key={catIdx}>
                          <h4 className="text-primary font-black text-[10px] mb-4 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary"></span> {cat.name}
                          </h4>
                          <ul className="space-y-4">
                            {cat.items?.map((item: any, idx: number) => (
                              <li key={idx} className="text-sm text-foreground pl-4 border-l-2 border-white/10 group/item">
                                <span className="font-bold uppercase tracking-tight group-hover/item:text-primary transition-colors">{item.headline}</span>
                                <div className="mt-2">
                                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-muted-foreground hover:text-white uppercase tracking-widest border border-white/5 px-2 py-0.5 transition-colors">
                                    [ SOURCE_LINK ]
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex md:flex-row lg:flex-col gap-0 shrink-0 lg:w-48 bg-surface-container-high/50">
                <form action={publishNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <Button type="submit" className="w-full h-full lg:h-32 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all border-r-2 lg:border-r-0 lg:border-b-2 border-editorial">
                    <Check className="w-4 h-4 mr-2" /> Publicar
                  </Button>
                </form>
                <form action={rejectNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <Button type="submit" variant="ghost" className="w-full h-full lg:h-32 bg-transparent text-muted-foreground hover:bg-destructive hover:text-white rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all">
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
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
