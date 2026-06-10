import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { savePreferencesAction } from '@/actions/preferences'

interface PreferencesPageProps {
  params: Promise<{
    id: string
  }>
}

const TECH_CATEGORIES = [
  { id: 'TECH_HACKER', label: '💻 TECH_HACKER // DEV & SEGURANÇA' },
  { id: 'GEARHEAD', label: '🏎️ GEARHEAD // PERFORMANCE & MOTOR' },
  { id: 'SYNTH_AESTHETICS', label: '🔮 SYNTH_AESTHETICS // ARTE DIGITAL' },
  { id: 'IA', label: '🤖 IA // INTELIGÊNCIA ARTIFICIAL' },
  { id: 'SEGURANÇA', label: '🛡️ SEGURANÇA // CYBERSECURITY' }
]

const MUSIC_CATEGORIES = [
  { id: 'HIP_HOP', label: '🎤 HIP-HOP // CULTURA URBANA & BEATS' },
  { id: 'ROCK_INDIE', label: '🎸 ROCK & INDIE // VANGUARDA ALTERNATIVA' },
  { id: 'ELECTRONICA', label: '🎹 ELETRÔNICA // SYNTH & TECHNO' },
  { id: 'CULTURA', label: '🌎 CULTURA // FESTIVAIS & MUSICA INDEPENDENTE' }
]

export default async function PreferencesPage({ params }: PreferencesPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !subscriber) {
    notFound()
  }

  const activeWorlds = subscriber.active_worlds || ['TECH']
  const categoriesToShow = [
    ...(activeWorlds.includes('TECH') ? TECH_CATEGORIES : []),
    ...(activeWorlds.includes('MUSIC') ? MUSIC_CATEGORIES : [])
  ]

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden bg-scanlines">
      {/* Scanline overlay e CRT flicker */}
      <div className="absolute inset-0 pointer-events-none bg-black/10 z-50"></div>
      
      <div className="max-w-lg w-full bg-[#030d03] border-double border-4 border-green-500 p-8 md:p-12 shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10 rounded-none">
        <header className="mb-10 border-b border-green-500/30 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-green-500 flex items-center justify-center rounded-none bg-green-950/50">
              <span className="text-green-500 font-black text-xs">FN</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 animate-pulse">
              [PROTOCOLO_PREFERÊNCIAS_V2.0]
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase italic leading-none text-green-400">
            SUAS ESCOLHAS // ZINE PESSOAL
          </h1>
          <p className="text-green-600 text-xs font-black select-all">
            ASSINANTE: {subscriber.email}
          </p>
        </header>

        <form action={savePreferencesAction.bind(null, id)} className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-black text-green-400 uppercase tracking-[0.2em] mb-4 border-b border-green-500/20 pb-2">
              SELECIONE SEUS INTERESSES DE LEITURA:
            </p>
            
            {categoriesToShow.map((cat) => {
              const isChecked = subscriber.preferences?.includes(cat.id);
              return (
                <label 
                  key={cat.id} 
                  className={`flex items-center gap-4 p-4 border border-green-500/30 hover:border-green-400 transition-all cursor-pointer rounded-none bg-green-950/10 hover:bg-green-950/30 select-none group`}
                >
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="preferences" 
                      value={cat.id} 
                      defaultChecked={isChecked}
                      className="w-5 h-5 rounded-none border-green-500 bg-black text-green-500 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer accent-green-500"
                    />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs text-green-500/70 group-hover:text-green-400 transition-colors">
                    {cat.label}
                  </span>
                </label>
              );
            })}
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-950/40 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-none font-black uppercase tracking-[0.3em] h-14 text-xs transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer"
          >
            [ GRAVAR_PROTOCOLOS_DE_PREFERÊNCIA ]
          </button>

          <div className="pt-6 text-center border-t border-green-500/20">
            <p className="text-[9px] text-green-700 uppercase tracking-[0.4em] font-black italic">
              Fresh News // Deep Intelligence // Hermes 3 Agêntico
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
