import { createAdminClient } from '@/lib/supabase/admin'
import { NewsCard } from '@/components/news-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollLink } from '@/components/scroll-link'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { TerminalToggle } from '@/components/terminal-toggle'
import { ArrowRight } from 'lucide-react'
import { WorldSelector } from '@/components/world-selector'

export const revalidate = 0

interface ArchiveIndexPageProps {
  searchParams: Promise<{
    subscriber?: string
  }>
}

export default async function ArchiveIndexPage({ searchParams }: ArchiveIndexPageProps) {
    const { subscriber: subscriberId } = await searchParams
    const supabase = createAdminClient()
    const cookieStore = await cookies()
    const isAdmin = cookieStore.has('admin_session')
    const activeWorld = cookieStore.get('active_world')?.value || 'TECH'

    let subscriber = null
    let affinityPosts: any[] = []

    if (subscriberId) {
        const { data: subData } = await supabase
            .from('subscribers')
            .select('*')
            .eq('id', subscriberId)
            .single()
        
        if (subData) {
            subscriber = subData
            
            // Buscar posts aprovados pertencentes ao mundo ativo
            const { data: postsData } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'approved')
                .eq('world', activeWorld)
                .order('score', { ascending: false })
            
            if (postsData) {
                const preferences = subData.preferences || []
                
                // Ordenar por afinidade: categorias selecionadas vêm primeiro, depois desempata por score
                affinityPosts = [...postsData].sort((a, b) => {
                    const aPref = preferences.includes(a.category) ? 1 : 0
                    const bPref = preferences.includes(b.category) ? 1 : 0
                    
                    if (aPref !== bPref) {
                        return bPref - aPref
                    }
                    return (b.score || 0) - (a.score || 0)
                })
            }
        }
    } else {
        // Se não houver subscriber logado, busca posts do mundo ativo para exibição geral
        const { data: postsData } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'approved')
            .eq('world', activeWorld)
            .order('score', { ascending: false })
            .limit(10)
        if (postsData) {
            affinityPosts = postsData
        }
    }

    let query = supabase
        .from('newsletters')
        .select('*')
        .eq('world', activeWorld)
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
                <header className="max-w-7xl mx-auto glass-nav h-20 px-8 rounded-none flex items-center justify-between border-b-2 border-primary shadow-2xl">
                    <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-primary rounded-none flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/30">
                            <span className="text-white font-black text-sm tracking-tighter">FN</span>
                        </div>
                        <span className="font-black text-xl tracking-tighter text-foreground uppercase italic hidden md:block">Fresh News</span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mr-4">
                            <Link href="/archive" className="text-primary">Edições</Link>
                            <Link href="/about" className="hover:text-primary transition-colors">Sobre</Link>
                        </div>
                        
                        <WorldSelector activeWorld={activeWorld} />

                        <TerminalToggle />
                        
                        <Link
                            href="/#subscribe"
                            className="bg-primary text-white hover:bg-white hover:text-black px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 border border-primary/50 cursor-pointer"
                        >
                            Assinar Zine
                        </Link>
                    </nav>
                </header>
            </div>

            <main className="flex-grow pt-36">
                {/* Hero do Arquivo - Glass Style */}
                <section className="relative py-12 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="glass-card p-12 md:p-20 rounded-none border-4 border-double border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-scanlines opacity-5"></div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
                                <div className="space-y-6 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-none border border-primary/20">
                                        <span className="w-2 h-2 bg-primary rounded-none animate-pulse"></span>
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
                                <div className="glass-card p-6 rounded-none border-2 border-white/10 text-center">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">TOTAL_LOGS</div>
                                    <div className="text-4xl font-black text-primary">{newsletters?.length || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ZINE PESSOAL // FEED DE AFINIDADES */}
                <section className="max-w-7xl mx-auto px-6 py-10">
                    {/* Alerta Brutalista de Preferências */}
                    <div role="alert" className={cn(
                        "p-6 md:p-8 rounded-none border-2 mb-16 relative overflow-hidden",
                        subscriber 
                            ? "border-emerald-500 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-emerald-400"
                            : "border-white/10 bg-white/[0.01] text-muted-foreground"
                    )}>
                        <div className="absolute inset-0 bg-scanlines opacity-5 pointer-events-none"></div>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-none animate-pulse",
                                        subscriber ? "bg-emerald-500" : "bg-neutral-500"
                                    )}></span>
                                    <span className="text-[10px] font-black tracking-widest uppercase font-mono">
                                        {subscriber ? "MOTOR_DE_AFINIDADES_ATIVO // PROTOCOLO_ZINE" : "MOTOR_DE_AFINIDADES_INATIVO // NAVEGAÇÃO_PADRÃO"}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-foreground font-mono">
                                    {subscriber ? "Zine Personalizado // Feed de Afinidades" : "Afinidades Desabilitadas // Feed Global"}
                                </h3>
                                <p className="text-xs max-w-3xl leading-relaxed text-muted-foreground">
                                    {subscriber ? (
                                        <>
                                            Sua transmissão está sendo reordenada dinamicamente com base nas preferências registradas para o assinante <span className="text-foreground underline select-all">{subscriber.email}</span>. Categorias selecionadas e com maior score aparecem primeiro.
                                        </>
                                    ) : (
                                        "Assine o portal Fresh News ou use seu link exclusivo de assinante para desbloquear o algoritmo Chameleon Engine e reorganizar as transmissões e visual em tempo real de acordo com as suas preferências."
                                    )}
                                </p>
                                {subscriber && subscriber.preferences && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground self-center">FILTROS:</span>
                                        {subscriber.preferences.length === 0 ? (
                                            <span className="px-2.5 py-0.5 border border-white/10 text-[9px] font-black uppercase text-muted-foreground rounded-none bg-white/[0.02]">
                                                TODOS_OS_INTERESSES
                                            </span>
                                        ) : (
                                            subscriber.preferences.map((pref: string) => (
                                                <span key={pref} className="px-2.5 py-0.5 border border-emerald-500/30 text-[9px] font-black uppercase text-emerald-400 rounded-none bg-emerald-950/30">
                                                    {pref}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {subscriber ? (
                                <Link
                                    href={`/preferencias/${subscriber.id}`}
                                    className="bg-emerald-950/20 border border-emerald-500 hover:bg-emerald-500 hover:text-black text-emerald-400 px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 self-start md:self-center font-mono cursor-pointer"
                                >
                                    [ AJUSTAR_INTERESSES ]
                                </Link>
                            ) : (
                                <Link
                                    href="/#subscribe"
                                    className="bg-white/5 border border-white/20 hover:bg-white hover:text-black text-white px-6 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 self-start md:self-center font-mono cursor-pointer"
                                >
                                    [ ASSINAR_PORTAL ]
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Título do Feed */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-white/10 pb-6 mb-12 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-none"></span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-primary font-mono">// TRANSMISSÕES_AVULSAS</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-foreground font-mono">
                                Feed de Afinidades
                            </h2>
                        </div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest md:max-w-xs md:text-right font-mono">
                            Artigos técnicos individuais ordenados sob medida
                        </p>
                    </div>

                    {/* Grid de Posts Individuais do Feed */}
                    {!affinityPosts || affinityPosts.length === 0 ? (
                        <div className="p-20 text-center border border-dashed border-white/10 rounded-none bg-white/[0.01]">
                            <p className="text-muted-foreground font-black text-sm uppercase tracking-widest font-mono">
                                [SINAL_DE_AFINIDADE_VAZIO] // Nenhum post avulso curado nesta frequência.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                            {affinityPosts.map((post) => {
                                const isPreferred = subscriber?.preferences?.includes(post.category);
                                let catColor = "border-cyan-500/20 text-cyan-400 bg-cyan-950/10";
                                if (post.category === "TECH_HACKER" || post.category === "SEGURANÇA") {
                                    catColor = "border-red-500/20 text-red-400 bg-red-950/10";
                                } else if (post.category === "SYNTH_AESTHETICS") {
                                    catColor = "border-purple-500/20 text-purple-400 bg-purple-950/10";
                                } else if (post.category === "GEARHEAD") {
                                    catColor = "border-yellow-500/20 text-yellow-400 bg-yellow-950/10";
                                } else if (post.category === "IA") {
                                    catColor = "border-emerald-500/20 text-emerald-400 bg-emerald-950/10";
                                }

                                return (
                                    <div 
                                        key={post.id}
                                        data-testid="post-card"
                                        className={cn(
                                            "p-6 md:p-8 rounded-none border bg-black/40 flex flex-col justify-between transition-all group relative overflow-hidden h-full",
                                            isPreferred 
                                                ? "border-emerald-500/40 hover:border-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                                                : "border-white/5 hover:border-primary/50"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none"></div>
                                        
                                        <div className="space-y-4">
                                            {/* Cabeçalho do Card */}
                                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                                <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest border rounded-none font-mono", catColor)}>
                                                    {post.category}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {isPreferred && (
                                                        <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 tracking-wider rounded-none font-mono">
                                                            AFINIDADE_ALTA
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] font-black text-muted-foreground/60 tracking-wider font-mono">
                                                        SCORE: {post.score}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Título */}
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic leading-tight group-hover:text-primary transition-colors font-mono">
                                                <Link 
                                                    href={`/post/${post.id}`} 
                                                    className="hover:underline decoration-2 underline-offset-4"
                                                >
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            {/* Resumo */}
                                            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-4">
                                                {post.summary || post.content}
                                            </p>
                                        </div>

                                        {/* Footer do Card */}
                                        <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 font-mono">
                                            <span>FONTE: {post.source || "web"}</span>
                                            <Link 
                                                href={`/post/${post.id}`} 
                                                className="inline-flex items-center gap-1.5 text-primary hover:text-white transition-colors group-hover:gap-3"
                                            >
                                                LER_POST <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* HISTÓRICO DE EDIÇÕES COMPLETAS */}
                <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-white/10 pb-6 mb-12 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-none"></span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-primary font-mono">// TRANSMISSÕES_COMPLETAS</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-foreground font-mono">
                                Edições Arquivadas
                            </h2>
                        </div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest md:max-w-xs md:text-right font-mono">
                            Logs históricos completos compilados e publicados
                        </p>
                    </div>

                    {!newsletters || newsletters.length === 0 ? (
                        <div className="p-32 text-center glass-card rounded-none border-dashed border-white/10 relative overflow-hidden">
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
                                    imageUrl={news.image_url}
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
                                <div className="w-8 h-8 bg-primary rounded-none flex items-center justify-center">
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
