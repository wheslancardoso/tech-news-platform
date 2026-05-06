import { createAdminClient } from '@/lib/supabase/admin'
import { publishNewsletter, rejectNewsletter } from '@/actions/newsletters'
import { Check, X, TrendingUp, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewsletterCard } from '@/components/admin/NewsletterCard'

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
    <div className="space-y-8">
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
        <div className="p-20 text-center glass-card rounded-[3rem] border-white/5 border-dashed relative overflow-hidden">
          <p className="tech-label text-muted-foreground/40">Fila de processamento vazia</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {newsletters?.map((newsletter) => (
            <div key={newsletter.id} className="space-y-4">
              <NewsletterCard draft={newsletter} />
              
              <div className="flex gap-4 px-10">
                <form action={publishNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-500/20 tech-label transition-all">
                    <Check className="w-5 h-5 mr-3" /> Aprovar e Publicar
                  </Button>
                </form>
                <form action={rejectNewsletter.bind(null, newsletter.id)} className="flex-1">
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 tech-label transition-all">
                    <X className="w-5 h-5 mr-3" /> Rejeitar Edição
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
