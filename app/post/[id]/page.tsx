import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChameleonEffects } from '@/components/ChameleonEffects'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post || post.status !== 'approved') {
    notFound()
  }

  const theme = post.theme_config || {}
  
  const primary = theme.accent_color || theme.primary_color || 'hsl(var(--primary))'
  const bg = theme.accent_color ? (theme.primary_color || 'hsl(var(--background))') : (theme.background_color || 'hsl(var(--background))')
  const text = theme.text_color || 'hsl(var(--foreground))'

  // A Mágica do Chameleon Theme: Injetando as variáveis locais
  const cssVariables = {
    '--theme-primary': primary,
    '--theme-bg': bg,
    '--theme-text': text,
    '--theme-font': theme.font_style === 'Mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : theme.font_style === 'Serif' ? 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif' : 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
  } as React.CSSProperties

  return (
    <div style={cssVariables} className="min-h-screen bg-chameleon-bg text-chameleon-text font-chameleon transition-colors duration-1000 ease-out relative">
      <ChameleonEffects effects={theme.ui_effects || []} />
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 opacity-60 hover:opacity-100 transition-opacity font-medium">
          <ArrowLeft className="w-5 h-5" /> Voltar para o Feed
        </Link>
        
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6 text-sm font-bold tracking-widest uppercase opacity-80">
            <span className="text-chameleon-primary">{post.category || 'TECH NEWS'}</span>
          </div>
          <h1 className={`text-4xl md:text-6xl font-black leading-[1.1] mb-6 ${theme.ui_effects?.includes('terminal_cursor') ? 'animate-terminal-cursor' : ''}`}>
            {post.title}
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 leading-relaxed border-l-4 border-chameleon-primary pl-6">
            {post.summary}
          </p>
        </header>

        {post.content ? (
          <div className="prose prose-lg max-w-none opacity-90 prose-p:text-chameleon-text prose-headings:text-chameleon-text prose-a:text-chameleon-primary" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <div className="text-lg opacity-80 mb-12">
            <p>Conteúdo completo não disponível nativamente.</p>
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-chameleon-primary font-bold hover:underline">
              Ler artigo original completo &rarr;
            </a>
          </div>
        )}
        
        {post.whatsapp_summary && (
          <div className="mt-16 p-8 border border-chameleon-primary/20 rounded-2xl bg-chameleon-text/5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-chameleon-primary" />
            <p className="text-xs font-bold mb-3 opacity-60 uppercase tracking-widest">🧬 Resumo Sintetizado via IA</p>
            <p className="text-lg font-mono leading-relaxed">
              {post.whatsapp_summary}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
