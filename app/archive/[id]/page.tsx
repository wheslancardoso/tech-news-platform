import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getThemeConfig } from '@/lib/chameleon-theme'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ArchivePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('title, summary_intro')
    .eq('id', id)
    .single()

  if (!newsletter) return { title: 'Fresh News' }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: `${newsletter.title} — FRESH NEWS`,
    description: newsletter.summary_intro || 'Newsletter de tecnologia curada com IA.',
    openGraph: {
      title: newsletter.title,
      description: newsletter.summary_intro || undefined,
      images: [`${baseUrl}/api/og/${id}`],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: newsletter.title,
      description: newsletter.summary_intro || undefined,
      images: [`${baseUrl}/api/og/${id}`],
    },
  }
}

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

  // Theme mutation based on category
  const theme = getThemeConfig(newsletter.category, newsletter.theme_config)

  // Extrair apenas o miolo do HTML
  let safeHtml = newsletter.html_content || '';
  const bodyMatch = safeHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    safeHtml = bodyMatch[1];
  }

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
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wider uppercase text-muted-foreground">
            <Link href="/#archive" className="hover:text-foreground transition-colors">Edições</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Sobre</Link>
            <Link
              href="/#subscribe"
              className="px-4 py-1.5 text-black font-bold text-[11px] tracking-wider transition-colors"
              style={{ background: theme.accent }}
            >
              INSCREVER-SE
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8 tracking-wider uppercase group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            VOLTAR
          </Link>

          <article className="bg-card border border-border overflow-hidden">
            {/* ═══ NICHE HEADER — Mutates per category ═══ */}
            <div
              className={`p-8 md:p-12 pb-8 relative bg-gradient-to-b ${theme.headerGradient}`}
              style={{ borderBottom: `2px solid ${theme.accent}30` }}
            >
              {/* Niche tagline */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                  style={{
                    color: theme.accent,
                    border: `1px solid ${theme.accent}30`,
                    background: `${theme.accent}10`,
                  }}
                >
                  {theme.icon} {theme.badgeLabel}
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: `${theme.accent}80` }}>
                  {theme.tagline}
                </span>
              </div>

              {/* Edition + Date */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                  style={{ color: theme.accent }}
                >
                  EDIÇÃO #{newsletter.edition_number}
                </span>
                <span className="text-xs font-mono text-muted-foreground tracking-wider">
                  {format(new Date(newsletter.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
              </div>

              {/* Title — accent on hover */}
              <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground leading-tight">
                {newsletter.title}
              </h1>

              {/* Niche label */}
              <div className="mt-6 flex items-center gap-2">
                <div className="h-[1px] flex-grow" style={{ background: `${theme.accent}20` }} />
                <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground/40">
                  {theme.nicheLabel}
                </span>
                <div className="h-[1px] flex-grow" style={{ background: `${theme.accent}20` }} />
              </div>
            </div>

            {/* ═══ ARTICLE BODY ═══ */}
            <div className="p-8 md:p-12 pt-8">
              <div
                className="email-renderer-full prose prose-invert max-w-none
                  prose-headings:text-foreground prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-strong:text-foreground
                  prose-img:border prose-img:border-border
                  prose-code:bg-card prose-code:px-1
                  prose-pre:bg-[hsl(0,0%,7%)] prose-pre:border prose-pre:border-border
                  prose-blockquote:text-muted-foreground
                  prose-li:text-muted-foreground
                  prose-hr:border-border
                "
                style={{
                  // Dynamic accent for links and blockquote border
                  ['--tw-prose-links' as string]: theme.proseAccent,
                  ['--tw-prose-quote-borders' as string]: theme.proseAccent,
                  ['--tw-prose-code' as string]: theme.accent,
                }}
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            </div>

            {/* ═══ CTA — Accent-colored ═══ */}
            <div
              className="p-8 md:p-12 text-center"
              style={{ borderTop: `2px solid ${theme.accent}20` }}
            >
              <p className="text-[10px] font-mono tracking-widest uppercase mb-3" style={{ color: theme.accent }}>
                {theme.tagline.replace('//', '//')} ENCERRADA
              </p>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">Gostou desta edição?</h3>
              <p className="text-muted-foreground mb-6 text-sm">Receba conteúdo como este toda manhã na sua caixa de entrada.</p>
              <Link href="/#subscribe">
                <button
                  className="px-8 py-3 font-black text-xs tracking-widest uppercase transition-colors"
                  style={{
                    background: theme.accent,
                    color: theme.accent === '#FFFFFF' ? '#000' : '#000',
                  }}
                >
                  INSCREVER-SE GRATUITAMENTE
                </button>
              </Link>
            </div>
          </article>
        </div>
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
