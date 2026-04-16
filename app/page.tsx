import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { generateDraft } from '@/actions/generate'
import { handleLogout } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { SubscribeForm } from '@/components/subscribe-form'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  let query = supabase
    .from('newsletters')
    .select('*')
    .order('edition_number', { ascending: false })

  if (!isAdmin) {
    query = query.eq('status', 'published')
  }

  query = query.limit(6)
  const { data: newsletters } = await query

  const latestEdition = newsletters?.[0]?.edition_number || 0

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">

      {/* ═══ HEADER ═══ */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-[hsl(186,100%,50%)] flex items-center justify-center">
              <span className="text-black font-black text-[10px] tracking-tighter">FN</span>
            </div>
            <span className="font-black text-lg tracking-[-0.06em] uppercase text-foreground">Fresh News</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            <Link href="#archive" className="hidden md:block hover:text-foreground transition-colors">Edições</Link>
            <Link href="/about" className="hidden md:block hover:text-foreground transition-colors">Sobre</Link>
            {isAdmin && (
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="text-[10px] flex items-center gap-1 px-3 py-1 border border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
                >
                  SAIR
                </button>
              </form>
            )}
            <Link
              href="#subscribe"
              className="px-4 py-1.5 bg-[hsl(186,100%,50%)] text-black font-bold text-[11px] tracking-wider hover:bg-[hsl(186,100%,60%)] transition-colors"
            >
              INSCREVER-SE
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">

        {/* ═══ HERO SECTION ═══ */}
        <section id="subscribe" className="relative py-16 md:py-28 overflow-hidden scanline">
          {/* Subtle grid bg */}
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-30" />
          
          {/* Gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(186,100%,50%)] to-transparent opacity-60" />

          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* Edition tag */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 bg-[hsl(186,100%,50%)] pulse-live" />
                <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase">
                  ED_Nº{latestEdition > 0 ? latestEdition : '---'} · LIVE_CURATION
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] text-foreground mb-6">
                AS NOTÍCIAS<br/>
                DE TECH QUE<br/>
                <span className="text-[hsl(186,100%,50%)]">IMPORTAM.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-10 font-light">
                Curadoria diária com IA. Sem hype, sem clickbait — o essencial em 5 minutos
                para devs, hackers e entusiastas de tecnologia.
              </p>

              {/* Subscribe form */}
              <SubscribeForm />

              {/* Floating Dev Trigger (APENAS ADMIN) */}
              {isAdmin && (
                <form action={generateDraft} className="opacity-0 hover:opacity-100 transition-opacity absolute top-4 right-4">
                  <Button type="submit" variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    (Dev) Gerar Edição
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ═══ ARCHIVE SECTION ═══ */}
        <section id="archive" className="py-16 md:py-24 border-t-2 border-border">
          <div className="container mx-auto px-4 md:px-6">
            {/* Section header */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[10px] font-mono text-[hsl(186,100%,50%)] tracking-widest uppercase block mb-2">// TRANSMISSÕES</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-foreground uppercase">Edições Anteriores</h2>
              </div>
              <Link href="/archive" className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider group">
                Ver arquivo completo
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-border bg-card">
                <p className="text-muted-foreground font-mono text-sm">// SEM SINAL</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {isAdmin ? 'Use o botão flutuante para gerar conteúdo.' : 'Aguardando a primeira transmissão...'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-border">
                {newsletters.map((news, index) => {
                  const demoCategories = ['tech', 'ia', 'seguranca', 'dev', 'gearhead', 'eletronica'];
                  return (
                    <NewsCard
                      key={news.id}
                      id={news.id}
                      edition={news.edition_number}
                      title={news.title}
                      date={news.created_at}
                      intro={news.summary_intro}
                      status={news.status}
                      isAdmin={isAdmin}
                      category={news.category || demoCategories[index % demoCategories.length]}
                      themeConfig={news.theme_config}
                    />
                  )
                })}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link href="/archive">
                <Button variant="outline" className="w-full text-xs uppercase tracking-wider border-border text-muted-foreground hover:text-foreground hover:border-foreground">
                  Ver arquivo completo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t-2 border-border py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[hsl(186,100%,50%)] flex items-center justify-center">
                  <span className="text-black font-black text-[8px]">FN</span>
                </div>
                <span className="font-black text-sm tracking-[-0.04em] uppercase text-foreground">Fresh News</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Curadoria de notícias de tecnologia feita com IA para desenvolvedores. Sem spam, apenas o essencial.
              </p>
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">// FEITO NO CAOS</p>
              <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">// EST. 2025</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/50 font-mono tracking-wider">
            <p>© 2025 FRESH NEWS. TODOS OS DIREITOS RESERVADOS.</p>
            <div className="flex gap-6 mt-3 md:mt-0">
              <span className="cursor-pointer hover:text-foreground transition-colors">PRIVACIDADE</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">TERMOS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Dev Trigger (APENAS ADMIN) */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <form action={generateDraft}>
            <Button type="submit" variant="secondary" className="shadow-lg opacity-75 hover:opacity-100 transition-opacity text-xs border border-border">
              ⚡ Gerar Edição
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
