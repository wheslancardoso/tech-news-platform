import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getThemeConfig } from '@/lib/chameleon-theme'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { ChameleonArticleTrigger } from '@/components/chameleon-article-trigger'
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
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !newsletter) {
    notFound()
  }

  // Theme mutation based on category
  const category = newsletter.category || 'tech'
  const theme = getThemeConfig(category, newsletter.theme_config)

  // Extrair apenas o miolo do HTML
  let safeHtml = newsletter.html_content || '';
  const bodyMatch = safeHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    safeHtml = bodyMatch[1];
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col has-bottom-nav">
      {/* Trigger the Chameleon theme change for this article's category */}
      <ChameleonArticleTrigger category={category} />

      <SharedHeader isAdmin={isAdmin} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-10 max-w-3xl">

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
                    color: '#000',
                  }}
                >
                  INSCREVER-SE GRATUITAMENTE
                </button>
              </Link>
            </div>
          </article>
        </div>
      </main>

      <SharedFooter />
    </div>
  )
}
