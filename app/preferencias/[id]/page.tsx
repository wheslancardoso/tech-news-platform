import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updatePreferences } from '@/actions/preferences'


interface PreferencesPageProps {
  params: Promise<{
    id: string
  }>
}

const CATEGORIES = ['💻 DEV', '🤖 IA', '🛡️ CIBERSEGURANÇA', '💰 MERCADO']

export default async function PreferencesPage({ params }: PreferencesPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !subscriber) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const prefs = formData.getAll('preferences') as string[]
    await updatePreferences(id, prefs)
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-primary/20 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card p-10 md:p-14 rounded-[3.5rem] border-white/10 shadow-2xl relative z-10">
        <header className="mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">FN</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Protocolo_Preferências</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-3 text-foreground uppercase italic leading-none">SUAS ESCOLHAS</h1>
          <p className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.2em] font-black">
            {subscriber.email}
          </p>
        </header>
 
        <form action={handleSubmit} className="space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Sincronizar Categorias:</p>
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-4 p-5 glass-card rounded-2xl border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    name="preferences" 
                    value={cat} 
                    defaultChecked={subscriber.preferences?.includes(cat)}
                    className="peer w-6 h-6 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-offset-0 focus:ring-0 transition-all checked:bg-primary checked:border-primary"
                  />
                </div>
                <span className="font-black uppercase tracking-widest text-xs text-muted-foreground group-hover:text-foreground transition-colors peer-checked:text-white">
                  {cat}
                </span>
              </label>
            ))}
          </div>
 
          <button type="submit" className="w-full bg-primary text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-[0.3em] h-16 text-[10px] transition-all shadow-2xl shadow-primary/20 hover:shadow-white/10 active:scale-95">
            SALVAR_PROTOCOLOS
          </button>
 
          <div className="pt-8 text-center">
            <p className="text-[10px] text-muted-foreground/20 uppercase tracking-[0.5em] font-black italic">
              Fresh News // Deep Intelligence // 2026
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
