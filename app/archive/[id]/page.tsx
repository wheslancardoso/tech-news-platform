import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight, Share2, Zap } from 'lucide-react'
import Link from 'next/link'
import { ChameleonEffects } from '@/components/ChameleonEffects'
import { cleanAISummary } from '@/lib/utils/text-cleanup'

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
  
  // --- NOVAS CATEGORIAS DE MÚSICA ---
  
  // MUSICA_URBANA (Amarelo Ocre / Street Brutalism)
  if (upper.includes('URBANA') || upper.includes('HIP') || upper.includes('RAP')) {
    return { 
      color: '#EAB308', 
      rgb: hexToRgb('#EAB308'), 
      effects: ['street_glitch', 'grainy_texture', 'terminal_glow'],
      label: 'URBAN_VANGUARD' 
    };
  }

  // MUSICA_ELETRONICA (Hacker / Synth / Matrix)
  if (upper.includes('ELETRONICA') || upper.includes('TECHNO') || upper.includes('HOUSE')) {
    return { 
      color: '#22C55E', 
      rgb: hexToRgb('#22C55E'), 
      effects: ['terminal_glow', 'scanlines', 'glitch'],
      label: 'SYNTH_PROTOCOL' 
    };
  }

  // VANGUARDA_CRITICA (Monocromático / Acadêmico)
  if (upper.includes('VANGUARDA') || upper.includes('CRITICA') || upper.includes('QUIETUS')) {
    return { 
      color: '#FFFFFF', 
      rgb: '255, 255, 255', 
      effects: ['grainy_texture', 'subtle_glow'],
      label: 'CRITICAL_THEORY' 
    };
  }

  // CULTURA_BR (Brasil Tech)
  if (upper.includes('BR') || upper.includes('BRASIL')) {
    return { 
      color: '#84CC16', 
      rgb: hexToRgb('#84CC16'), 
      effects: ['glow', 'street_glitch'],
      label: 'BRAZIL_AXIS' 
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
      <div className="fixed top-2 md:top-8 left-0 right-0 z-[110] px-2 md:px-6 w-full">
        <header className="max-w-6xl mx-auto glass-nav h-14 md:h-20 px-4 md:px-10 rounded-full flex items-center justify-between border border-white/5 shadow-2xl w-full overflow-hidden">
          <Link href="/archive" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity shrink-0">
            <div className="w-7 h-7 md:w-9 md:h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <ArrowLeft className="w-3 h-3 text-primary" />
            </div>
            <span className="tech-label text-primary hidden md:block">Arquivo // Transmissões</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-6 shrink-0">
             <button className="p-2 md:p-3 glass-card rounded-lg md:rounded-xl border-white/5 text-muted-foreground hover:text-white transition-colors">
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <Link href="/#subscribe">
              <button className="bg-primary text-white hover:bg-white hover:text-black px-3 md:px-8 py-2 md:py-3 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-all shadow-xl shadow-primary/25 whitespace-nowrap">
                Assinar
              </button>
            </Link>
          </div>
        </header>
      </div>

      {/* HERO IMERSIVO */}
      <section className="relative min-h-[50vh] md:h-[90vh] w-full overflow-hidden flex items-end pb-12 md:pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={mainImage} 
            alt={content.title} 
            className="w-full h-full object-cover grayscale-[0.5] brightness-[0.2] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 w-full overflow-hidden">
          <div className="inline-flex items-center gap-2 px-2 py-1 glass-card rounded-full border-primary/20 mb-3 md:mb-10">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#8B5CF6]"></span>
            <span className="tech-label text-primary uppercase text-[6px] md:text-[10px]">Edição #{newsletter.edition_number} // {format(new Date(newsletter.created_at), "dd MMMM yyyy", { locale: ptBR })}</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-white leading-tight md:leading-[0.85] uppercase italic mb-4 md:mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] break-words overflow-hidden">
            {content.title}
          </h1>
          <p className="text-[10px] sm:text-base md:text-xl lg:text-2xl text-muted-foreground font-medium max-w-4xl leading-tight border-l-2 md:border-l-4 border-primary pl-3 md:pl-8 py-0.5 italic bg-black/40 backdrop-blur-md">
            {cleanAISummary(content.intro)}
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-32 space-y-12 md:space-y-48">
        
        {/* QUICK TAKES - Glass Receptacle */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="glass-card p-6 md:p-24 rounded-2xl md:rounded-[4rem] border-white/5 relative overflow-hidden shadow-2xl bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <h2 className="tech-label mb-6 md:mb-16 flex items-center gap-3 text-primary">
              <Zap className="w-3 h-3 md:w-4 md:h-4 fill-current" /> 
              Sincronização Rápida // Quick Logs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {content.quickTakes.map((take: string, idx: number) => (
                <div key={idx} className="flex gap-4 md:gap-6 group">
                  <span className="text-primary/20 font-black text-xl md:text-4xl group-hover:text-primary transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                  <p className="text-sm md:text-xl font-bold leading-tight group-hover:text-foreground/90 transition-colors">{take}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIAS CAMALEÔNICAS */}
        <div className="space-y-16 md:space-y-64 pb-16 md:pb-64">
          {content.categories?.map((cat: any, catIdx: number) => {
            const theme = getCategoryTheme(cat.name);
            return (
              <section 
                key={catIdx} 
                className="relative scroll-mt-40 pt-8 md:pt-32 pb-12 md:pb-40 px-3 md:px-12 md:-mx-12 rounded-xl md:rounded-[5rem] transition-colors duration-1000"
                style={{ 
                  '--theme-primary': theme.color,
                  '--theme-primary-rgb': theme.rgb 
                } as any}
              >
                {/* 
                  FUNDO TEMÁTICO DA SEÇÃO 
                  Utiliza uma máscara radial para garantir que o brilho se funda suavemente 
                  com o fundo preto da página nas bordas.
                */}
                <div 
                  className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                  style={{ 
                    maskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 95%)'
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundColor: theme.color }}></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--theme-primary-rgb),0.15)_0%,transparent_80%)]"></div>
                  <ChameleonEffects effects={theme.effects} />
                </div>

                {/* Cabeçalho da Seção */}
                <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6 md:mb-24 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 mb-1.5 md:mb-4">
                      <span className="w-2 md:w-3 h-[2px]" style={{ backgroundColor: theme.color }}></span>
                      <span className="tech-label text-[6px] md:text-[10px]" style={{ color: theme.color }}>{theme.label}</span>
                    </div>
                    <h2 
                      className="text-base sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)] leading-none break-words"
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
                <div className="grid grid-cols-1 gap-12 md:gap-40 relative z-10">
                  {cat.items?.map((item: any, itemIdx: number) => {
                    const itemTheme = item.theme_config || item.theme || {};
                    const itemEffects = itemTheme.ui_effects || theme.effects;
                    const itemAccent = itemTheme.accent_color || 'var(--theme-primary)';
                    
                    return (
                      <article key={itemIdx} className="group relative">
                        {/* Efeito de Destaque no Hover do Artigo */}
                        <div className="absolute inset-0 md:-inset-12 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl md:rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                           <ChameleonEffects effects={itemEffects} />
                        </div>
                        
                        <div className="max-w-4xl space-y-2 md:space-y-6 relative z-10 p-1.5 md:p-2 transition-transform duration-500">
                             <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-snug md:leading-[1.1] tracking-tighter transition-all duration-500" style={{ color: itemAccent === 'var(--theme-primary)' ? undefined : itemAccent }}>
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-[4px] md:underline-offset-[12px]" style={{ textDecorationColor: itemAccent === 'var(--theme-primary)' ? 'rgba(var(--theme-primary-rgb), 0.4)' : `${itemAccent}66` }}>
                                {item.title || item.headline}
                              </a>
                            </h3>
                          
                          {item.imageUrl && (
                            <div className="relative aspect-video md:aspect-[21/9] rounded-xl md:rounded-[2rem] overflow-hidden border border-white/5 my-4 md:my-8">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title || item.headline} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                          )}

                          <p className="text-muted-foreground/80 text-[10px] sm:text-sm md:text-lg lg:text-xl xl:text-2xl leading-normal font-medium max-w-3xl">
                            {cleanAISummary(item.summary || item.story)}
                          </p>
                          
                          <div className="flex items-center gap-6 md:gap-8">
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 tech-label transition-all hover:gap-6 hover:text-white text-[7px] md:text-[10px]"
                              style={{ color: theme.color }}
                            >
                              VER_MAIS <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
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
        <div className="mt-24 md:mt-64 p-6 md:p-40 glass-card rounded-2xl md:rounded-[5rem] text-center relative overflow-hidden border-white/5 shadow-2xl bg-white/[0.01]">
          <div className="absolute inset-0 bg-scanlines opacity-[0.05]"></div>
          <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[150px]"></div>
          
          <div className="relative z-10 space-y-6 md:space-y-12">
            <h3 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none break-words">
              Fim da <br /> <span className="text-primary">Transmissão</span>
            </h3>
            <p className="text-[10px] sm:text-base md:text-xl lg:text-2xl text-muted-foreground/60 max-w-2xl mx-auto font-medium italic leading-tight px-4">
              O Fresh News é o protocolo de inteligência para quem constrói a próxima camada da web.
            </p>
            <div className="pt-4 flex justify-center">
              <Link href="/#subscribe" className="w-full max-w-[240px] md:max-w-none">
                <button className="w-full md:w-auto bg-primary text-white hover:bg-white hover:text-black px-6 md:px-16 py-3 md:py-8 rounded-full font-black uppercase tracking-tight md:tracking-[0.5em] text-[8px] md:text-[10px] transition-all shadow-2xl shadow-primary/40 whitespace-normal">
                  SINCRONIZAR <br className="md:hidden" /> AGORA
                </button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER Liquid Glass */}
      <footer className="bg-white/[0.01] backdrop-blur-3xl border-t border-white/5 py-12 md:py-24 text-center relative z-[110]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">FN</span>
            </div>
            <span className="font-black text-[8px] md:text-xs tracking-[0.4em] uppercase text-foreground/40 text-center md:text-left">Fresh News // Premium Intelligence Layer</span>
          </div>
          <div className="text-muted-foreground/5 text-[6px] md:text-[8px] font-black uppercase tracking-[0.5em] md:tracking-[1em] break-all">
            TERMINAL_SESSIONS_ID_{newsletter.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </footer>
    </div>
  )
}
