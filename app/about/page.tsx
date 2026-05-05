import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bot, ShieldCheck, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header Liquid Glass */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6">
        <header className="max-w-5xl mx-auto glass-nav h-20 px-8 rounded-full flex items-center justify-between border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm tracking-tighter">FN</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-foreground uppercase italic hidden md:block">Fresh News</span>
          </Link>
          <nav className="flex items-center">
            <Link href="/">
              <button className="px-6 py-2.5 glass-card rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                RETURN_TO_HOME
              </button>
            </Link>
          </nav>
        </header>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-44 pb-32">
        {/* Manifesto Intro */}
        <div className="mb-44 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          
          <div className="relative z-10 text-center md:text-left space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 glass-card rounded-full border-white/10">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary">PROTOCOL_MANIFESTO // VERSION_1.0</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85]">
              Informação <br />
              Sem <span className="text-primary drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">Ruído.</span>
            </h1>
            
            <p className="text-xl md:text-3xl font-medium text-muted-foreground/80 max-w-3xl leading-tight border-l-4 border-primary pl-10 py-4 italic">
              O Fresh News é destilado para quem constrói. Unimos inteligência artificial cirúrgica e rigor editorial para combater o caos da sobrecarga de informação.
            </p>
          </div>
        </div>

        {/* Core Pillars Grid - Glass Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-44">
          <div className="glass-card p-12 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-2">
            <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="font-black text-2xl mb-6 uppercase tracking-tighter italic">CÉREBRO_IA</h3>
            <p className="text-muted-foreground font-medium leading-relaxed uppercase text-xs tracking-wider">
              Utilizamos modelos de fronteira para analisar centenas de fontes técnicas, filtrando o hype e extraindo o que realmente impacta o código e o mercado.
            </p>
          </div>

          <div className="glass-card p-12 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-2">
            <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-black text-2xl mb-6 uppercase tracking-tighter italic">ZERO_CLICKBAIT</h3>
            <p className="text-muted-foreground font-medium leading-relaxed uppercase text-xs tracking-wider">
              Focamos em protocolos verificados e fatos de engenharia. Eliminamos rumores e sensacionalismo da sua fila de leitura.
            </p>
          </div>

          <div className="glass-card p-12 rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group hover:-translate-y-2">
            <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-black text-2xl mb-6 uppercase tracking-tighter italic">DEEP_DIVE</h3>
            <p className="text-muted-foreground font-medium leading-relaxed uppercase text-xs tracking-wider">
              Em vez de apenas links genéricos, entregamos análises técnicas profundas. Você se informa em minutos, sem sair do contexto.
            </p>
          </div>
        </div>

        {/* CTA Section - Floating Glass */}
        <div className="glass-card p-12 md:p-24 rounded-[4rem] text-center relative overflow-hidden border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-scanlines opacity-5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"></div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-10 uppercase italic tracking-tighter relative z-10">
            Projeto <span className="text-primary">Open Source</span> <br />
            & Acadêmico
          </h2>
          <p className="text-muted-foreground font-medium mb-16 max-w-2xl mx-auto leading-relaxed uppercase text-xs md:text-sm tracking-[0.3em] relative z-10">
            Desenvolvido como demonstração de arquitetura moderna: Next.js 15, Supabase e integração avançada com LLMs de alta densidade.
          </p>
          
          <Link href="/" className="relative z-10">
            <button className="bg-primary text-white hover:bg-white hover:text-black px-14 py-6 rounded-full font-black uppercase tracking-[0.4em] transition-all text-[10px] shadow-2xl shadow-primary/30">
              EXPERIMENTAR_PROTOCOLO
            </button>
          </Link>
        </div>
      </main>

      <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/5 py-24 text-center">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-[10px]">FN</span>
            </div>
            <span className="font-black text-xs tracking-[0.4em] uppercase text-foreground italic">Fresh News // 2026</span>
          </div>
          <p className="text-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.6em]">
            MADE_WITH_HEART_AND_CODE
          </p>
        </div>
      </footer>
    </div>
  )
}
