import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminNewslettersPage() {
  const supabase = createAdminClient()
  
  const { data: drafts, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500 border border-red-200 bg-red-50 rounded-lg">Erro: {error.message}</div>
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tighter mb-4 text-foreground uppercase italic leading-none">Newsletters (Drafts)</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
          Visualize e gerencie os rascunhos diários antes de aprovar o disparo pelo Resend.
        </p>
      </header>
 
      {drafts?.length === 0 ? (
        <div className="p-24 text-center glass-card rounded-[3rem] border-white/5 border-dashed">
          <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-sm italic">Nenhum rascunho de newsletter no momento. 📭</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {drafts?.map((draft) => (
            <div key={draft.id} className="glass-card p-10 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex flex-wrap items-center gap-4 mb-8 relative z-10">
                <span className="px-4 py-1.5 text-[10px] font-black bg-primary text-white rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                  Edição #{draft.edition_number}
                </span>
                <span className="px-4 py-1.5 text-[10px] font-black glass-card border-white/10 text-muted-foreground rounded-full uppercase tracking-[0.2em]">
                  {new Date(draft.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black mb-4 text-foreground uppercase tracking-tight italic group-hover:text-primary transition-colors relative z-10">
                {draft.title}
              </h3>

              {draft.summary_intro && (
                <p className="text-muted-foreground text-lg mb-8 font-medium leading-relaxed max-w-3xl relative z-10">
                  {draft.summary_intro}
                </p>
              )}

              <div className="text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.4em] border-t border-white/5 pt-6 relative z-10 italic">
                Aguardando infraestrutura da Fase 5 (Resend) para habilitar disparo.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
