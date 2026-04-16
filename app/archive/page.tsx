import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'

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
            <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-7 h-7 bg-[hsl(186,100%,50%)] flex items-center justify-center">
                            <span className="text-black font-black text-[10px] tracking-tighter">FN</span>
                        </div>
                        <span className="font-black text-lg tracking-[-0.06em] uppercase text-foreground">Fresh News</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-xs font-medium tracking-wider uppercase text-muted-foreground">
                        <Link href="/archive" className="hidden md:block text-foreground font-bold">Edições</Link>
                        <Link href="/about" className="hidden md:block hover:text-foreground transition-colors">Sobre</Link>
                        <Link
                            href="/#subscribe"
                            className="px-4 py-1.5 bg-[hsl(186,100%,50%)] text-black font-bold text-[11px] tracking-wider hover:bg-[hsl(186,100%,60%)] transition-colors"
                        >
                            INSCREVER-SE
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                <section className="py-12 md:py-20 container mx-auto px-4 md:px-6">
                    {/* Back link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 tracking-wider uppercase group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        VOLTAR
                    </Link>

                    <div className="mb-10">
                        <span className="text-[10px] font-mono text-[hsl(186,100%,50%)] tracking-widest uppercase block mb-2">// ARQUIVO</span>
                        <h1 className="text-2xl md:text-4xl font-black tracking-[-0.03em] text-foreground uppercase">Todas as Edições</h1>
                        <p className="text-muted-foreground text-sm mt-2 font-light">Explore o histórico completo do Fresh News.</p>
                    </div>

                    {!newsletters || newsletters.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-border bg-card">
                            <p className="text-muted-foreground font-mono text-sm">// SEM SINAL</p>
                            <p className="text-xs text-muted-foreground/60 mt-2">Nenhuma edição encontrada.</p>
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
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t-2 border-border py-8 bg-background">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/50 font-mono tracking-wider">
                    <p>© 2025 FRESH NEWS. TODOS OS DIREITOS RESERVADOS.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <span className="cursor-pointer hover:text-foreground transition-colors">PRIVACIDADE</span>
                        <span className="cursor-pointer hover:text-foreground transition-colors">TERMOS</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
