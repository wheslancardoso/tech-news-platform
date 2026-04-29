import { cookies } from 'next/headers'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'
import { PreferencesClient } from '@/components/preferences-client'

export const dynamic = 'force-dynamic'

export default async function PreferencesPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col has-bottom-nav">
      <SharedHeader isAdmin={isAdmin} />

      <main className="flex-grow">
        <section className="py-10 md:py-16 container mx-auto px-4 md:px-6 max-w-5xl">
          {/* ═══ HERO ═══ */}
          <div className="mb-10">
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-widest uppercase block mb-2">
              // PREFERÊNCIAS
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-[-0.04em] text-foreground uppercase leading-[0.95] mb-3">
              Ajuste sua<br/>Frequência
            </h1>
            <p className="text-muted-foreground text-sm font-light max-w-lg">
              Personalize como o Fresh News se apresenta pra você. 
              O tema muda, a identidade se adapta — a informação permanece.
            </p>
          </div>

          {/* ═══ EDITORIAL DIVIDER ═══ */}
          <div className="editorial-rule mb-10" />

          {/* ═══ PREFERENCES UI ═══ */}
          <PreferencesClient />
        </section>
      </main>

      <SharedFooter />
    </div>
  )
}
