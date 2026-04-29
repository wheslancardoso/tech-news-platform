import { cookies } from 'next/headers'
import Link from 'next/link'
import { Bot, ShieldCheck, Zap } from 'lucide-react'
import { SharedHeader } from '@/components/shared-header'
import { SharedFooter } from '@/components/shared-footer'

export default async function AboutPage() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.has('admin_session')

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col has-bottom-nav">
      <SharedHeader isAdmin={isAdmin} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
          <div className="mb-16">
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-widest uppercase block mb-3">// SOBRE</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-foreground mb-6 uppercase leading-[0.95]">
              Informação<br/>sem ruído.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              O Fresh News é um projeto de curadoria de conteúdo, unindo jornalismo e inteligência artificial para combater a sobrecarga de informação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-[2px] bg-border mb-16">
            <div className="bg-card p-8 text-center">
              <div className="w-12 h-12 border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="font-black text-lg mb-2 text-foreground uppercase tracking-tight">Curadoria via IA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos o GPT-4o para analisar centenas de feeds RSS e selecionar apenas o que realmente importa no mundo tech.
              </p>
            </div>

            <div className="bg-card p-8 text-center">
              <div className="w-12 h-12 border border-[hsl(120,100%,50%)]/30 bg-[hsl(120,100%,50%)]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[hsl(120,100%,50%)]" />
              </div>
              <h3 className="font-black text-lg mb-2 text-foreground uppercase tracking-tight">Anti-Desinformação</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Focamos em fatos e fontes verificadas, eliminando clickbaits e rumores infundados da sua leitura diária.
              </p>
            </div>

            <div className="bg-card p-8 text-center">
              <div className="w-12 h-12 border border-[hsl(40,100%,50%)]/30 bg-[hsl(40,100%,50%)]/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-[hsl(40,100%,50%)]" />
              </div>
              <h3 className="font-black text-lg mb-2 text-foreground uppercase tracking-tight">5min Briefings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Em vez de apenas links, entregamos stories completas. Você se informa em 5 minutos, sem sair da plataforma.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border p-8 md:p-12 text-center">
            <span className="text-[10px] font-mono text-[hsl(var(--primary))] tracking-widest uppercase block mb-4">// OPEN SOURCE</span>
            <h2 className="text-2xl font-black mb-4 text-foreground uppercase tracking-tight">Projeto Acadêmico &amp; Open Source</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Desenvolvido como demonstração de arquitetura moderna web com Next.js, Supabase e integração avançada com LLMs.
            </p>
            <Link href="/">
              <button className="px-8 py-3 bg-[hsl(var(--primary))] text-black font-black text-xs tracking-widest uppercase hover:opacity-90 transition-opacity">
                EXPERIMENTAR AGORA
              </button>
            </Link>
          </div>
        </div>
      </main>

      <SharedFooter />
    </div>
  )
}
