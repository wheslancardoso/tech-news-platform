import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { ArchiveFilters } from '@/components/archive-filters'
import { Layers, Tag, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 0

export default async function ArchiveIndexPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  let query = supabase
    .from('newsletters')
    .select('*')
    .order('edition_number', { ascending: false })
    .limit(200)

  if (!isAdmin) {
    query = query.eq('status', 'published')
  }

  const { data: newsletters } = await query

  // Stats
  const totalEditions = newsletters?.length || 0
  const categories = new Set(newsletters?.map(n => n.category || 'tech'))
  const lastUpdate = newsletters?.[0]?.created_at
    ? format(new Date(newsletters[0].created_at), "dd.MM.yy", { locale: ptBR })
    : '—'

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col has-bottom-nav">
      <SharedHeader isAdmin={isAdmin} />

      <main className="flex-grow">
        <section className="py-10 md:py-16 container mx-auto px-4 md:px-6">

          {/* ═══ HERO ═══ */}
          <div className="mb-8">
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-widest uppercase block mb-2">
              // ARQUIVO
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-foreground uppercase leading-[0.95] mb-3">
              Todas as<br/>Transmissões
            </h1>
            <p className="text-muted-foreground text-sm font-light max-w-lg">
              Explore o histórico completo do Fresh News. Filtre por categoria, busque por tema ou navegue pelas edições.
            </p>
          </div>

          {/* ═══ STATS STRIP ═══ */}
          <div className="grid grid-cols-3 gap-[2px] bg-border mb-8">
            <div className="bg-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-foreground">{totalEditions}</p>
                <p className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">EDIÇÕES</p>
              </div>
            </div>

            <div className="bg-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Tag className="w-4 h-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-foreground">{categories.size}</p>
                <p className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">CATEGORIAS</p>
              </div>
            </div>

            <div className="bg-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black text-foreground">{lastUpdate}</p>
                <p className="text-[9px] font-mono text-muted-foreground/50 tracking-widest uppercase">ÚLTIMA ATT</p>
              </div>
            </div>
          </div>

          {/* ═══ EDITORIAL DIVIDER ═══ */}
          <div className="editorial-rule mb-8" />

          {/* ═══ FILTERS + GRID ═══ */}
          <ArchiveFilters newsletters={newsletters || []} isAdmin={isAdmin} />

        </section>
      </main>

      <SharedFooter />
    </div>
  )
}
