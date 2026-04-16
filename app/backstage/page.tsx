import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BackstageClient from '@/components/backstage-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BackstagePage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  if (!isAdmin) {
    redirect('/login')
  }

  const supabase = await createClient()

  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('id, title, edition_number, created_at, category, theme_config, cover_url, status')
    .order('edition_number', { ascending: false })
    .limit(50)

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
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-yellow-400 tracking-widest uppercase border border-yellow-400/30 px-2 py-0.5 bg-yellow-400/10">
              ADMIN
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-10">
          {/* Back + Title */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-6 tracking-wider uppercase group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            VOLTAR
          </Link>

          <div className="border-4 border-border p-6 mb-8 bg-card">
            <div className="flex items-center gap-4 mb-3">
              <span className="font-mono text-[hsl(186,100%,50%)] text-sm">$</span>
              <h1 className="text-3xl md:text-5xl font-black uppercase text-foreground tracking-[-0.04em]">
                BACKSTAGE
              </h1>
            </div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              // GERADOR DE ARTES // CLIENT-SIDE RENDERER // 1080×1080 JPG
            </p>
          </div>

          {/* Instruções */}
          <div className="mb-8 font-mono text-xs text-muted-foreground/60 space-y-1 border-l-2 border-border pl-4">
            <p className="uppercase tracking-wider">// INSTRUÇÕES</p>
            <p>→ Clique em &quot;GERAR CARD [JPG]&quot; para baixar o cover da edição</p>
            <p>→ Upload de imagem é opcional (usa gradient se vazio)</p>
            <p>→ Processamento 100% no navegador (Client-Side)</p>
            <p>→ Formato: 1080×1080px JPG — Pronto para Instagram</p>
          </div>

          <BackstageClient newsletters={newsletters || []} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8 bg-background">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/50 font-mono tracking-wider">
          <p>© 2025 FRESH NEWS. BACKSTAGE SYSTEM.</p>
        </div>
      </footer>
    </div>
  )
}
