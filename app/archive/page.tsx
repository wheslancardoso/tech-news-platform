import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollLink } from '@/components/scroll-link'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { cookies } from 'next/headers'

export const revalidate = 0

export default async function ArchiveIndexPage() {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const isAdmin = cookieStore.has('admin_session')

    let query = supabase
        .from('newsletters')
        .select('*')
        .order('edition_number', { ascending: false })
        .limit(100)

    if (!isAdmin) {
        query = query.eq('status', 'published')
    }

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
                        <Link href="/archive" className="hidden md:block hover:text-black transition-colors text-black font-semibold">Edições</Link>
                        <Link href="/about" className="hidden md:block hover:text-black transition-colors">Sobre</Link>
                        <Link
                            href="/#subscribe"
                            className={cn(buttonVariants({ variant: "default", size: "sm" }), "rounded-full px-6 bg-black text-white hover:bg-zinc-800")}
                        >
                            Inscrever-se
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-grow bg-slate-50">
                <section className="py-12 md:py-20 container mx-auto px-4">
                    <div className="mb-12 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Arquivo de Edições</h1>
                        <p className="text-muted-foreground mt-2">Explore todas as edições passadas do Tech News.</p>
                    </div>

                    {!newsletters || newsletters.length === 0 ? (
                        <div className="text-center py-24 border-2 border-dashed rounded-xl bg-white">
                            <p className="text-muted-foreground">Nenhuma edição encontrada.</p>
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
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    )}
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
        </div>
    )
}
