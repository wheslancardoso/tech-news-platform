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
    <div className="min-h-screen bg-background font-sans flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b-2 border-editorial bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">FN</span>
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">Fresh News</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <ScrollLink href="#archive" className="hidden md:block hover:text-primary transition-colors">Edições</ScrollLink>
            <Link href="/about" className="hidden md:block hover:text-primary transition-colors">Sobre</Link>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Link href="/admin/posts" className="text-[10px] font-black flex items-center gap-2 px-3 py-1 bg-white text-black hover:bg-primary transition-colors">
                  INBOX 📥
                </Link>
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="text-[10px] font-black flex items-center gap-2 px-3 py-1 border border-white/20 text-white/50 hover:text-red-500 hover:border-red-500 transition-colors"
                  >
                    SAIR 🚪
                  </button>
                </form>
              </div>
            )}
            <ScrollLink
              href="#subscribe"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "px-6 font-black uppercase text-[12px]")}
            >
              Inscrever-se
            </ScrollLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="subscribe" className="relative py-16 md:py-32 container mx-auto px-4 scroll-mt-24 overflow-hidden border-b-2 border-editorial">
          <div className="absolute inset-0 -z-10 bg-scanlines opacity-20"></div>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,240,255,0.15),transparent_70%)]"></div>
          
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black tracking-[0.2em] uppercase mb-4 animate-pulse">
              System Online // 2026 Edition
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] uppercase italic">
              Notícias Tech <span className="text-primary">Sem Hype.</span><br />
              <span className="text-muted-foreground/30">Deep Dive Only.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-tight border-l-4 border-primary pl-6 text-left">
              O feed de autoridade para engenheiros que desprezam o óbvio e buscam a essência técnica.
            </p>

            <div className="max-w-md mx-auto mt-12 bg-surface-container p-1 border-2 border-editorial">
              <SubscribeForm />
            </div>
          </div>
        </section>

        {/* Archive Section (Newsletters) */}
        <section id="archive" className="py-24 min-h-[50vh]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8 border-b-2 border-editorial pb-6">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Edições</h2>
                <p className="text-primary font-bold text-xs tracking-widest uppercase">// Histórico de Inteligência</p>
              </div>
              
              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <Link 
                    href="/" 
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-2",
                      !selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30"
                    )}
                  >
                    ALL
                  </Link>
                  {availableCategories.map(cat => (
                    <Link 
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-2",
                        selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-white/10 hover:border-white/30"
                      )}
                    >
                      {cat.replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-white/10 bg-surface-container">
                <p className="text-muted-foreground font-black uppercase tracking-tighter">Nenhuma edição detectada na rede.</p>
                {isAdmin && (
                  <p className="text-[10px] text-primary mt-4 font-bold uppercase tracking-widest animate-pulse">Aguardando geração via console de admin...</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-editorial">
                {newsletters.map((news) => (
                  <div key={news.id} className="border-r-2 border-b-2 border-editorial">
                    <NewsCard
                      id={news.id}
                      edition={news.edition_number}
                      title={news.title}
                      date={news.created_at}
                      intro={news.summary_intro}
                      status={news.status}
                      isAdmin={isAdmin}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t-2 border-editorial py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">FN</span>
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">Fresh News</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm font-medium leading-relaxed uppercase">
                Curadoria de autoridade técnica. <br />
                Feito para quem constrói o futuro, não para quem apenas o comenta.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end gap-4">
              <div className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mb-2">Navigation // Protocol</div>
              <div className="flex gap-8 text-xs font-black uppercase tracking-widest">
                <ScrollLink href="#archive" className="hover:text-primary transition-colors">Arquivo</ScrollLink>
                <Link href="/about" className="hover:text-primary transition-colors">Privacidade</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Termos</Link>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            <p>© 2026 Fresh News Zine. Binary Edition // All Rights Reserved.</p>
            <p className="mt-4 md:mt-0">Built with deep engineering</p>
          </div>
        </div>
      </footer>
      {/* Floating Dev Trigger (APENAS ADMIN) */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <form action={generateDraft}>
            <Button type="submit" variant="secondary" className="shadow-lg opacity-75 hover:opacity-100 transition-opacity">
              ⚡ (Dev) Gerar Edição
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
