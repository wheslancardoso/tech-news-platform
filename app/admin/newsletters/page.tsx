import { createAdminClient } from '@/lib/supabase/admin'
import { AlertTriangle, Zap } from 'lucide-react'
import { generateDraft } from '@/actions/generate'
import { Button } from '@/components/ui/button'
import { NewsletterCard } from '@/components/admin/NewsletterCard'

export default async function AdminNewslettersPage() {
  const supabase = createAdminClient()
  
  const { data: drafts, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500 glass-card rounded-2xl border-red-500/20 bg-red-500/5">Erro: {error.message}</div>
  }

  return (
    <div className="space-y-16">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div>
          <div className="inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full border-white/10 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#8B5CF6]"></span>
            <span className="tech-label text-primary">Repositório // Rascunhos Diários</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-none">
            Edições <br />
            <span className="text-primary">Pendentes</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <div className="px-6 py-3 glass-card rounded-2xl border-white/10 tech-label text-muted-foreground">
            {drafts?.length || 0} Drafts em Fila
          </div>
          <form action={generateDraft} className="flex items-center gap-3">
            <select name="world" className="bg-zinc-950 text-white border-2 border-primary/20 rounded-2xl px-4 py-3 text-xs font-mono focus:border-primary outline-none h-[48px] uppercase tracking-widest cursor-pointer">
              <option value="TECH">TECH</option>
              <option value="MUSIC">MUSIC</option>
              <option value="GEAR">GEAR</option>
              <option value="GAME">GAME</option>
            </select>
            <Button type="submit" className="px-8 py-3 rounded-2xl bg-primary text-white hover:bg-white hover:text-black tech-label transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
              <Zap className="w-4 h-4 fill-current" />
              Gerar Nova Edição
            </Button>
          </form>
        </div>
      </header>

      {/* Seção de Alerta de Ação */}
      <section className="glass-card p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle className="w-16 h-16 text-primary" />
        </div>
        <h4 className="tech-label text-primary mb-4">Ação Requerida</h4>
        <p className="text-lg md:text-xl text-foreground font-medium max-w-2xl leading-snug">
          A infraestrutura da <span className="text-primary font-bold">Fase 5 (Resend)</span> está em fase de integração. O disparo em massa será habilitado após a validação do protocolo de DNS.
        </p>
      </section>
 
      {drafts?.length === 0 ? (
        <div className="p-32 text-center glass-card rounded-[4rem] border-white/5 border-dashed relative overflow-hidden">
          <p className="tech-label text-muted-foreground/40">Nenhum rascunho aguardando processamento</p>
        </div>
      ) : (
        <div className="grid gap-12">
          {drafts?.map((draft) => (
            <NewsletterCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  )
}
