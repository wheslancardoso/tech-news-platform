import Link from 'next/link'

export function SharedFooter() {
  return (
    <footer className="border-t-2 border-border py-12 bg-background">
      {/* Chameleon accent line */}
      <div className="chameleon-accent-bar w-full mb-0 -mt-12 mb-12" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[hsl(var(--primary))] flex items-center justify-center">
                <span className="text-black font-black text-[8px]">FN</span>
              </div>
              <span className="font-black text-sm tracking-[-0.04em] uppercase text-foreground">
                Fresh News
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Curadoria de notícias de tecnologia feita com IA para desenvolvedores. Sem spam, apenas o essencial.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            <Link href="/archive" className="hover:text-foreground transition-colors">
              → ARQUIVO
            </Link>
            <Link href="/preferences" className="hover:text-foreground transition-colors">
              → PREFERÊNCIAS
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              → SOBRE
            </Link>
          </nav>

          <div className="text-right space-y-1">
            <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">// FEITO NO CAOS</p>
            <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">// EST. 2025</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground/50 font-mono tracking-wider">
          <p>© 2025 FRESH NEWS. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="cursor-pointer hover:text-foreground transition-colors">PRIVACIDADE</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">TERMOS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
