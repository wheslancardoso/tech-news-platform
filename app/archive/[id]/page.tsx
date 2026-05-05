import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight, Share2, Zap } from 'lucide-react'
import Link from 'next/link'
import { ChameleonEffects } from '@/components/ChameleonEffects'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ArchivePageProps {
  params: Promise<{
    id: string
  }>
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const getCategoryTheme = (name: string) => {
  const upper = name.toUpperCase();
  // SEGURANÇA (Rose/Red)
  if (upper.includes('SEGURANÇA') || upper.includes('SEC') || upper.includes('HACK')) {
    return { 
      color: '#F43F5E', 
      rgb: hexToRgb('#F43F5E'), 
      effects: ['glitch', 'scanlines', 'terminal_glow'],
      label: 'PROTOCOL_CRITICAL' 
    };
  }
  // CLOUD (Cyan/Azure)
  if (upper.includes('CLOUD') || upper.includes('NUVEM') || upper.includes('INFRA')) {
    return { 
      color: '#06B6D4', 
      rgb: hexToRgb('#06B6D4'), 
      effects: ['cloud_compute_grid', 'glow'],
      label: 'INFRA_STRUCTURE' 
    };
  }
  // DEV (Emerald/Green)
  if (upper.includes('DEV') || upper.includes('ENGENHARIA') || upper.includes('CODING')) {
    return { 
      color: '#10B981', 
      rgb: hexToRgb('#10B981'), 
      effects: ['terminal_glow', 'grainy_texture'],
      label: 'SOURCE_CODE' 
    };
  }
  // IA (Lavender/Violet)
  if (upper.includes('IA') || upper.includes('INTELIGÊNCIA') || upper.includes('AI')) {
    return { 
      color: '#A78BFA', 
      rgb: hexToRgb('#A78BFA'), 
      effects: ['glow', 'neural_particles', 'grainy_texture'],
      label: 'NEURAL_LOGIC' 
    };
  }
  
  // Default (Violet)
  return { 
    color: '#8b5cf6', 
    rgb: hexToRgb('#8b5cf6'), 
    effects: ['glow'],
    label: 'GENERAL_INTEL' 
  };
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
  const mainImage = newsletter.image_url || `https://picsum.photos/seed/${id}/1920/1080`;

  return (
    <div className="bg-[#050505] min-h-screen text-foreground font-sans selection:bg-primary/30 relative overflow-x-hidden">
      
      {/* Overlays Globais Tech (Quase invisíveis, apenas textura) */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-scanlines bg-fixed"></div>
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-grainy bg-fixed"></div>

      {/* Header Liquid Glass */}
      <div className="fixed top-8 left-0 right-0 z-[110] px-6">
        <header className="max-w-6xl mx-auto glass-nav h-20 px-10 rounded-full flex items-center justify-between border border-white/5 shadow-2xl">
          <Link href="/archive" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <ArrowLeft className="w-4 h-4 text-primary" />
            </div>
            <span className="tech-label text-primary hidden md:block">Arquivo // Transmissões</span>
          </Link>
          
          <div className="flex items-center gap-6">
             <button className="p-3 glass-card rounded-xl border-white/5 text-muted-foreground hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <Link href="/#subscribe">
              <button className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/25">
                Assinar Edição
              </button>
            </Link>
          </div>
        </header>
      </div>

      {/* HERO IMERSIVO */}
      <section className="relative h-[90vh] w-full overflow-hidden flex items-end pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={mainImage} 
            alt={content.title} 
            className="w-full h-full object-cover grayscale-[0.5] brightness-[0.3] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
          <div className="inline-flex items-center gap-4 px-4 py-2 glass-card rounded-full border-primary/20 mb-10">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#8B5CF6]"></span>
            <span className="tech-label text-primary uppercase">Edição #{newsletter.edition_number} // {format(new Date(newsletter.created_at), "dd MMMM yyyy", { locale: ptBR })}</span>
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter text-white leading-[0.8] uppercase italic mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {content.title}
          </h1>
          <p className="text-xl md:text-3xl text-muted-foreground font-medium max-w-4xl leading-snug border-l-4 border-primary pl-8 py-2 italic bg-black/40 backdrop-blur-md">
            {content.intro}
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-32 space-y-48">
        
        {/* QUICK TAKES - Glass Receptacle */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="glass-card p-12 md:p-24 rounded-[4rem] border-white/5 relative overflow-hidden shadow-2xl bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <h2 className="tech-label mb-16 flex items-center gap-4 text-primary">
              <Zap className="w-4 h-4 fill-current" /> 
              Sincronização Rápida // Quick Logs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {content.quickTakes.map((take: string, idx: number) => (
                <div key={idx} className="flex gap-6 group">
                  <span className="text-primary/20 font-black text-4xl group-hover:text-primary transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                  <p className="text-lg md:text-xl font-bold leading-tight group-hover:text-foreground/90 transition-colors">{take}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIAS CAMALEÔNICAS */}
        <div className="space-y-64 pb-64">
          {content.categories?.map((cat: any, catIdx: number) => {
            const theme = getCategoryTheme(cat.name);
            return (
              <section 
                key={catIdx} 
                className="relative scroll-mt-40 pt-32 pb-40 px-12 -mx-12 rounded-[5rem] transition-colors duration-1000"
                style={{ 
                  '--theme-primary': theme.color,
                  '--theme-primary-rgb': theme.rgb 
                } as any}
              >
                {/* 
                  FUNDO TEMÁTICO DA SEÇÃO 
                  Isso cria uma "nuvem" de cor atrás de toda a seção
                */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundColor: theme.color }}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--theme-primary-rgb),0.15)_0%,transparent_80%)]"></div>
                  <ChameleonEffects effects={theme.effects} />
                </div>

                {/* Cabeçalho da Seção */}
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-24 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="w-3 h-[2px]" style={{ backgroundColor: theme.color }}></span>
                      <span className="tech-label" style={{ color: theme.color }}>{theme.label}</span>
                    </div>
                    <h2 
                      className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)] leading-none"
                      style={{ color: theme.color }}
                    >
                      {cat.name}
                    </h2>
                  </div>
                  <div className="hidden md:block text-[10px] font-black opacity-30 uppercase tracking-[1em] mb-4">
                    SEC_DATA_LAYER_{catIdx + 1}
                  </div>
                </div>

                {/* Grid de Artigos */}
                <div className="grid grid-cols-1 gap-40 relative z-10">
                  {cat.items?.map((item: any, itemIdx: number) => {
                    const itemEffects = item.theme?.ui_effects || theme.effects;
                    
                    return (
                      <article key={itemIdx} className="group relative">
                        {/* Efeito de Destaque no Hover do Artigo */}
                        <div className="absolute -inset-12 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                           <ChameleonEffects effects={itemEffects} />
                        </div>
                        
                        <div className="max-w-4xl space-y-12 relative z-10 p-4 transition-transform duration-500 group-hover:translate-x-4">
                          <div className="space-y-4">
                             <h3 className="text-4xl md:text-6xl font-bold text-white leading-[1] tracking-tighter group-hover:text-[var(--theme-primary)] transition-all duration-500">
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-[var(--theme-primary)]/40 decoration-2 underline-offset-[20px]">
                                {item.headline}
                              </a>
                            </h3>
                          </div>
                          
                          <p className="text-muted-foreground/90 text-xl md:text-2xl leading-relaxed font-medium max-w-3xl">
                            {item.story}
                          </p>
                          
                          <div className="flex items-center gap-8">
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-4 tech-label transition-all hover:gap-8 hover:text-white"
                              style={{ color: theme.color }}
                            >
                              ACESSAR_LOG_COMPLETO <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* ASSINATURA FINAL - Floating Glass */}
        <div className="mt-64 p-20 md:p-40 glass-card rounded-[5rem] text-center relative overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
          <div className="absolute inset-0 bg-scanlines opacity-[0.05]"></div>
          <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[150px]"></div>
          
          <div className="relative z-10 space-y-12">
            <h3 className="text-5xl md:text-[7rem] font-black text-foreground tracking-tighter uppercase italic leading-none">
              Fim da <br /> <span className="text-primary">Transmissão</span>
            </h3>
            <p className="text-muted-foreground/60 text-xl md:text-3xl max-w-3xl mx-auto font-medium italic leading-tight">
              O Fresh News é o protocolo de inteligência para quem constrói a próxima camada da web.
            </p>
            <div className="pt-8">
              <Link href="/#subscribe">
                <button className="bg-primary text-white hover:bg-white hover:text-black px-16 py-8 rounded-full font-black uppercase tracking-[0.5em] text-[10px] transition-all shadow-2xl shadow-primary/40">
                  SINCRONIZAR MINHA CAIXA DE ENTRADA
                </button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER Liquid Glass */}
      <footer className="bg-white/[0.01] backdrop-blur-3xl border-t border-white/5 py-24 text-center relative z-[110]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">FN</span>
            </div>
            <span className="font-black text-xs tracking-[0.4em] uppercase text-foreground/40">Fresh News // Premium Intelligence Layer</span>
          </div>
          <div className="text-muted-foreground/5 text-[8px] font-black uppercase tracking-[1em]">
            TERMINAL_SESSIONS_ID_{newsletter.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  )
}
