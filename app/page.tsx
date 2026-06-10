import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { generateDraft } from '@/actions/generate'
import { handleLogout } from '@/actions/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SubscribeForm } from '@/components/subscribe-form'
import { cookies } from 'next/headers'
import { ScrollLink } from '@/components/scroll-link'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Logo } from '@/components/logo'
import { TerminalToggle } from '@/components/terminal-toggle'
import { WorldSelector } from '@/components/world-selector'

export const revalidate = 0

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : null

  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')
  const activeWorld = cookieStore.get('active_world')?.value || 'TECH'

  // Configuração adaptativa do Hero com base no mundo ativo do multiverso
  let heroTitle = (
    <>
      Sua Dose de <br />
      <span className="text-primary drop-shadow-[0_0_40px_rgba(124,58,237,0.4)] italic font-black">Inteligência Tech.</span>
    </>
  )
  let heroSubtitle = "Curadoria técnica de alta densidade para quem constrói o futuro. Sem ruído, sem distrações, apenas o core da inovação."
  let transmissionLabel = "Protocolo de Transmissão // v1.0"
  
  if (activeWorld === 'MUSIC') {
    heroTitle = (
      <>
        Batidas & Sons da <br />
        <span className="text-yellow-500 drop-shadow-[0_0_40px_rgba(234,179,8,0.4)] italic font-black">Contracultura.</span>
      </>
    )
    heroSubtitle = "Design sonoro visceral, resenhas de rock alternativo e a pulsação das batidas do techno e hip hop de rua."
    transmissionLabel = "Frequência Cultural // v1.0"
  } else if (activeWorld === 'GEAR') {
    heroTitle = (
      <>
        Engenharia Extrema <br />
        <span className="text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.4)] italic font-black">& Silício.</span>
      </>
    )
    heroSubtitle = "Aerodinâmica avançada de F1, benchmarks detalhados de hardware bruto e a arte eletrônica DIY de baixo nível."
    transmissionLabel = "Velocidade & Hardware // v1.0"
  } else if (activeWorld === 'GAME') {
    heroTitle = (
      <>
        Retro Arcade & <br />
        <span className="text-purple-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] italic font-black">Cultura Pixel.</span>
      </>
    )
    heroSubtitle = "Desenvolvimento de jogos indie, análises viscerais de consoles de próxima geração, retrogaming clássico e os segredos da cultura de pixels."
    transmissionLabel = "Linha de Varredura // v1.0"
  }

  // Início da Query filtrando pelo mundo ativo
  let query = supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'published')
    .eq('world', activeWorld)
    .order('edition_number', { ascending: false })

  if (selectedCategory) {
    query = query.eq('category', selectedCategory)
  }

  // Aplicar limite após o filtro
  query = query.limit(12)

  const { data: newsletters } = await query

  // Buscar todas as categorias disponíveis para montar o filtro do mundo ativo
  const { data: catData } = await supabase
    .from('newsletters')
    .select('category')
    .eq('world', activeWorld)
    .not('category', 'is', null)
  const availableCategories = Array.from(new Set(catData?.map(n => n.category) || []))

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/30">
      {/* Header Brutalista */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-7xl mx-auto glass-nav h-20 px-8 rounded-none flex items-center justify-between border-b-2 border-primary shadow-2xl">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-all active:scale-95 group">
            <Logo size={42} className="group-hover:rotate-6 transition-transform duration-500" />
            <span className="font-heading font-black text-2xl tracking-tighter text-foreground md:block">Fresh News</span>
          </Link>

          <nav className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-8 tech-label">
              <ScrollLink href="#archive" className="hover:text-primary transition-colors">Edições</ScrollLink>
              <Link href="/about" className="hover:text-primary transition-colors">Sobre</Link>
              {isAdmin && (
                <Link href="/admin/posts" className="text-primary hover:brightness-125">Console</Link>
              )}
            </div>

            <WorldSelector activeWorld={activeWorld} />

            <TerminalToggle />

            <ScrollLink
              href="#subscribe"
              className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] active:scale-95 border-2 border-black dark:border-white cursor-pointer"
            >
              Acessar Protocolo
            </ScrollLink>
            
            {isAdmin && (
              <form action={handleLogout} className="ml-2">
                <button type="submit" className="p-2 text-muted-foreground/40 hover:text-red-500 transition-colors">
                  <span className="sr-only">Sair</span>
                  🚪
                </button>
              </form>
            )}
          </nav>
        </header>
      </div>

      <main className="flex-grow pt-40">
        {/* Hero Section - Liquid Style */}
        <section id="subscribe" className="relative py-24 md:py-44 container mx-auto px-6 scroll-mt-32">
          <div className="max-w-6xl mx-auto relative text-center">
            {/* Elementos Decorativos Flutuantes */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[140px]"></div>

            <div className="space-y-12 relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 glass-card rounded-none border border-black dark:border-white">
                <span className="w-1.5 h-1.5 bg-primary rounded-none animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                <span className="tech-label opacity-80">{transmissionLabel}</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-heading font-bold tracking-tight text-foreground leading-[0.9] max-w-5xl mx-auto">
                {heroTitle}
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground/60 max-w-3xl mx-auto font-medium leading-relaxed">
                {heroSubtitle}
              </p>

              <div className="max-w-xl mx-auto mt-20 glass-card p-1.5 rounded-none shadow-2xl border-black dark:border-white border bg-white/[0.02]">
                <SubscribeForm />
              </div>
            </div>
          </div>
        </section>

        {/* Archive Section - Airy Grid */}
        <section id="archive" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-7xl font-heading font-bold tracking-tighter mb-4 uppercase">Arquivo Histórico</h2>
                <p className="tech-label">Acesso a Transmissões Anteriores</p>
              </div>
              
              {/* Category Filter - Pill Style */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link 
                    href="/" 
                    className={cn(
                      "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                      !selectedCategory ? "bg-primary text-white border-primary shadow-xl shadow-primary/30" : "glass-card border-white/5 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    TUDO
                  </Link>
                  {availableCategories.map(cat => (
                    <Link 
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className={cn(
                        "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                        selectedCategory === cat ? "bg-primary text-white border-primary shadow-xl shadow-primary/30" : "glass-card border-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {cat.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-40 glass-card rounded-[3.5rem] border-dashed border-white/5">
                <p className="text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">Nenhuma transmissão detectada na rede.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                {newsletters.map((news) => (
                  <NewsCard
                    key={news.id}
                    id={news.id}
                    edition={news.edition_number}
                    title={news.title}
                    date={news.created_at}
                    intro={news.summary_intro}
                    status={news.status}
                    isAdmin={isAdmin}
                    imageUrl={news.image_url}
                  />
                ))}
              </div>
            )}

            <div className="mt-28 text-center">
              <Link href="/archive" className="inline-flex items-center gap-4 px-12 py-5 glass-card rounded-full tech-label hover:text-primary transition-all border-white/5 bg-white/[0.01]">
                Explorar Arquivo Completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Liquid Glass */}
      <footer className="bg-white/[0.01] backdrop-blur-3xl border-t border-white/5 py-32 mt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <div className="col-span-1 md:col-span-2 space-y-12">
              <div className="flex items-center gap-4">
                <Logo size={40} />
                <span className="font-heading font-bold text-3xl tracking-tighter">Fresh News</span>
              </div>
              <p className="text-muted-foreground/60 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed">
                Destilando o ruído digital para entregar inteligência técnica de alta densidade. <br />
                Feito por engenheiros, para engenheiros.
              </p>
            </div>
            
            <div className="flex flex-col gap-10">
              <div className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase">Links // Protocol</div>
              <div className="flex flex-col gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                <Link href="/archive" className="hover:text-primary transition-colors">Arquivo Completo</Link>
                <Link href="/about" className="hover:text-primary transition-colors">Manifesto Técnico</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
              </div>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.6em] text-muted-foreground/10">
            <p>© 2026 Binary BroadSheet // Premium Intelligence</p>
            <p className="mt-6 md:mt-0">Protocol_Status: Fully_Encrypted</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
