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
                            <Link href="/archive" className="text-primary">Edições</Link>
                            <Link href="/about" className="hover:text-primary transition-colors">Sobre</Link>
                        </div>
                        <Link
                            href="/#subscribe"
                            className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                        >
                            Assinar Zine
                        </Link>
                    </nav>
                </header>
            </div>

            <main className="flex-grow pt-32">
                {/* Hero do Arquivo - Glass Style */}
                <section className="relative py-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="glass-card p-12 md:p-20 rounded-[3rem] border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-scanlines opacity-5"></div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
                                <div className="space-y-6 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-black tracking-widest uppercase text-primary">Intelligence_Log</span>
                                    </div>
                                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85]">
                                        Arquivo <br />
                                        <span className="text-primary">Histórico</span>
                                    </h1>
                                    <p className="text-muted-foreground text-sm md:text-lg font-bold uppercase tracking-[0.3em] max-w-2xl">
                                        Explorando o log de transmissões técnicas // Vol. 001 - Atual
                                    </p>
                                </div>
                                <div className="glass-card p-6 rounded-3xl border-white/10 text-center">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">TOTAL_LOGS</div>
                                    <div className="text-4xl font-black text-primary">{newsletters?.length || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-20">
                    {!newsletters || newsletters.length === 0 ? (
                        <div className="p-32 text-center glass-card rounded-[3rem] border-dashed border-white/10 relative overflow-hidden">
                            <p className="text-muted-foreground font-black text-xl uppercase tracking-tighter">Database_Empty: Nenhuma transmissão arquivada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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

            {/* Footer Liquid Glass */}
            <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/5 py-32 mt-32">
                <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="max-w-md space-y-8">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-white font-black text-xs">FN</span>
                                </div>
                                <span className="font-black text-xl tracking-tighter uppercase italic text-foreground">Fresh News</span>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium leading-tight uppercase tracking-wider">
                                Destilando o ruído digital para entregar inteligência técnica de alta densidade. Sem hype, apenas protocolos.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-24 mx-auto md:mx-0">
                            <div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 underline underline-offset-8">// NETWORK</h4>
                                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <li><Link href="/about" className="hover:text-white transition-colors">Manifesto</Link></li>
                                    <li><Link href="/archive" className="hover:text-white transition-colors">Arquivo</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 underline underline-offset-8">// CONTACT</h4>
                                <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    <li><a href="#" className="hover:text-white transition-colors">X / Twitter</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.5em]">
                            © 2026 Binary BroadSheet // Premium Intelligence
                        </p>
                        </div>
                    </div>
            </footer>
        </div>
    )
}
