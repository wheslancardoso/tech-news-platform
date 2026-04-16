import Link from 'next/link'
import { ArrowLeft, Bot, ShieldCheck, Zap } from 'lucide-react'

export default function AboutPage() {
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
          <nav className="flex items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              VOLTAR
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
          <div className="mb-16">
            <span className="text-[10px] font-mono text-[hsl(186,100%,50%)] tracking-widest uppercase block mb-3">// SOBRE</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-foreground mb-6 uppercase leading-[0.95]">
              Informação<br/>sem ruído.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              O Fresh News é um projeto de curadoria de conteúdo, unindo jornalismo e inteligência artificial para combater a sobrecarga de informação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-[2px] bg-border mb-16">
            <div className="bg-card p-8 text-center">
              <div className="w-12 h-12 border border-[hsl(186,100%,50%)]/30 bg-[hsl(186,100%,50%)]/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-[hsl(186,100%,50%)]" />
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
            <span className="text-[10px] font-mono text-[hsl(186,100%,50%)] tracking-widest uppercase block mb-4">// OPEN SOURCE</span>
            <h2 className="text-2xl font-black mb-4 text-foreground uppercase tracking-tight">Projeto Acadêmico &amp; Open Source</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Desenvolvido como demonstração de arquitetura moderna web com Next.js, Supabase e integração avançada com LLMs.
            </p>
            <Link href="/">
              <button className="px-8 py-3 bg-[hsl(186,100%,50%)] text-black font-black text-xs tracking-widest uppercase hover:bg-[hsl(186,100%,60%)] transition-colors">
                EXPERIMENTAR AGORA
              </button>
            </Link>
          </div>
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
