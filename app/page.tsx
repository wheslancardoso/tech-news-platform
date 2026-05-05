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

export const revalidate = 0

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : null

  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  // Início da Query
  let query = supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'published')
    .order('edition_number', { ascending: false })

  if (selectedCategory) {
    query = query.eq('category', selectedCategory)
  }

  // Aplicar limite após o filtro
  query = query.limit(12)

  const { data: newsletters } = await query

  // Buscar todas as categorias disponíveis para montar o filtro
  const { data: catData } = await supabase.from('newsletters').select('category').not('category', 'is', null)
  const availableCategories = Array.from(new Set(catData?.map(n => n.category) || []))


  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col selection:bg-primary/30">
      {/* Header Liquid Glass */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-7xl mx-auto glass-nav h-20 px-8 rounded-full flex items-center justify-between border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm tracking-tighter">FN</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-foreground uppercase italic hidden md:block">Fresh News</span>
          </Link>

          <nav className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mr-4">
              <ScrollLink href="#archive" className="hover:text-primary transition-colors">Edições</ScrollLink>
              <Link href="/about" className="hover:text-primary transition-colors">Sobre</Link>
              {isAdmin && (
                <Link href="/admin/posts" className="text-primary hover:brightness-125">ADMIN_INBOX</Link>
              )}
            </div>

            <ScrollLink
              href="#subscribe"
              className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
            >
              Assinar Zine
            </ScrollLink>
            
            {isAdmin && (
              <form action={handleLogout} className="ml-2">
                <button type="submit" className="p-2 hover:text-red-500 transition-colors">
                  <span className="sr-only">Sair</span>
                  🚪
                </button>
              </form>
            )}
          </nav>
        </header>
      </div>

      <main className="flex-grow pt-32">
        {/* Hero Section - Liquid Style */}
        <section id="subscribe" className="relative py-24 md:py-44 container mx-auto px-6 scroll-mt-32">
          <div className="max-w-6xl mx-auto relative">
            {/* Elementos Decorativos Flutuantes */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px]"></div>

            <div className="text-center space-y-12 relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full border-white/10">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Protocolo_Ativo // 2026</span>
              </div>
              
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground leading-[0.85] uppercase italic">
                Sua Dose de <br />
                <span className="text-primary drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Inteligência Tech.</span>
              </h1>

              <p className="text-xl md:text-3xl text-muted-foreground/80 max-w-3xl mx-auto font-medium leading-tight text-center">
                Curadoria técnica de alta densidade para quem constrói o futuro. Sem ruído, sem distrações, apenas o core.
              </p>

              <div className="max-w-2xl mx-auto mt-16 glass-card p-2 rounded-[2.5rem] shadow-2xl">
                <SubscribeForm />
              </div>
            </div>
          </div>
        </section>

        {/* Archive Section - Airy Grid */}
        <section id="archive" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Edições_Passadas</h2>
                <p className="text-primary font-black text-xs tracking-[0.4em] uppercase">Arquivo de Transmissões Técnicas</p>
              </div>
              
              {/* Category Filter - Pill Style */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Link 
                    href="/" 
                    className={cn(
                      "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                      !selectedCategory ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "glass-card border-white/5 text-muted-foreground hover:border-white/20"
                    )}
                  >
                    ALL_TRANS
                  </Link>
                  {availableCategories.map(cat => (
                    <Link 
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                        selectedCategory === cat ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "glass-card border-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      {cat.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-40 glass-card rounded-[3rem] border-dashed border-white/10">
                <p className="text-muted-foreground font-black uppercase tracking-widest">Nenhuma transmissão detectada na rede.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
                  />
                ))}
              </div>
            )}

            <div className="mt-24 text-center">
              <Link href="/archive" className="inline-flex items-center gap-3 px-10 py-4 glass-card rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary transition-all">
                Explorar_Arquivo_Completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Liquid Glass */}
      <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/5 py-32 mt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            <div className="col-span-1 md:col-span-2 space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">FN</span>
                </div>
                <span className="font-black text-2xl tracking-tighter uppercase italic">Fresh News</span>
              </div>
              <p className="text-muted-foreground text-lg md:text-2xl font-medium max-w-2xl leading-tight">
                Destilando o ruído digital para entregar inteligência técnica de alta densidade. Feito por engenheiros, para engenheiros.
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="text-[10px] font-black tracking-[0.4em] text-primary uppercase underline underline-offset-8">Links // Protocol</div>
              <div className="flex flex-col gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Link href="/archive" className="hover:text-white transition-colors">Arquivo Completo</Link>
                <Link href="/about" className="hover:text-white transition-colors">Manifesto Técnico</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
              </div>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20">
            <p>© 2026 Binary BroadSheet // Premium Intelligence</p>
            <p className="mt-6 md:mt-0">Protocol_Status: Fully_Encrypted</p>
          </div>
        </div>
      </footer>

      {/* Floating Dev Trigger (APENAS ADMIN) */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-[100]">
          <form action={generateDraft}>
            <Button type="submit" variant="secondary" className="glass-card rounded-full shadow-lg opacity-75 hover:opacity-100 transition-opacity">
              ⚡ (Dev) Gerar Edição
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
