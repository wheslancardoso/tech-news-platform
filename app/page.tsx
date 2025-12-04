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

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  // Início da Query
  let query = supabase
    .from('newsletters')
    .select('*')
    .order('edition_number', { ascending: false })

  // Filtro condicional (se não for admin, só mostra publicados)
  if (!isAdmin) {
    query = query.eq('status', 'published')
  }

  // Aplicar limite após o filtro para garantir os 6 mais recentes
  query = query.limit(6)

  const { data: newsletters } = await query

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">TN</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">Tech News</span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-8 text-sm font-medium text-muted-foreground">
            <ScrollLink href="#archive" className="hidden md:block hover:text-black transition-colors">Edições</ScrollLink>
            <Link href="/about" className="hidden md:block hover:text-black transition-colors">Sobre</Link>
            {isAdmin && (
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  Sair 🚪
                </button>
              </form>
            )}
            <ScrollLink
              href="#subscribe"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-full px-6 bg-black text-white hover:bg-zinc-800")}
            >
              Inscrever-se
            </ScrollLink>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="subscribe" className="relative py-12 md:py-24 container mx-auto px-4 scroll-mt-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
              As notícias de tech que importam, <span className="text-muted-foreground">sem o hype.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Um resumo diário de 5 minutos com tudo que você precisa saber para começar o dia bem informado.
            </p>

            <div className="max-w-md mx-auto mt-10">
              {/* Formulário de Inscrição */}
              <SubscribeForm />
            </div>

            {/* Floating Dev Trigger (APENAS ADMIN) */}
            {isAdmin && (
              <form action={generateDraft} className="opacity-0 hover:opacity-100 transition-opacity absolute top-0 right-0 p-4">
                <Button type="submit" variant="ghost" size="sm" className="text-xs">
                  (Dev) Gerar Edição
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Archive Section */}
        <section id="archive" className="bg-slate-50 py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Edições Anteriores</h2>
              <Link href="/archive">
                <Button variant="outline" className="hidden md:flex">Ver arquivo completo</Button>
              </Link>
            </div>

            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed rounded-xl bg-white">
                <p className="text-muted-foreground">Nenhuma edição encontrada.</p>
                {!isAdmin && (
                  <p className="text-sm text-slate-400 mt-2">Volte amanhã para a primeira edição!</p>
                )}
                {isAdmin && (
                  <p className="text-sm text-slate-400 mt-2">Use o botão flutuante para gerar conteúdo.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsletters.map((news) => (
                  <NewsCard
                    key={news.id}
                    id={news.id}
                    edition={news.edition_number}
                    title={news.title}
                    date={news.created_at}
                    intro={news.summary_intro}
                    status={news.status}
                    isAdmin={isAdmin} // Passando status de admin
                  />
                ))}
              </div>
            )}

            <div className="mt-12 text-center md:hidden">
              <Link href="/archive">
                <Button variant="outline" className="w-full">Ver arquivo completo</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">TN</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Tech News</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Curadoria de notícias de tecnologia feita para desenvolvedores. Sem spam, apenas conteúdo.
            </p>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2025 Tech News API. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-black">Privacidade</span>
              <span className="cursor-pointer hover:text-black">Termos</span>
            </div>
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
