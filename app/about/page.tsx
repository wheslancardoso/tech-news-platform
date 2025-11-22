import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bot, ShieldCheck, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">TN</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">Tech News</span>
          </div>
          <nav className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Informação sem ruído.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            O Tech News é um projeto inovador de curadoria de conteúdo, unindo jornalismo e inteligência artificial para combater a sobrecarga de informação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Curadoria via IA</h3>
            <p className="text-sm text-muted-foreground">
              Utilizamos o GPT-4o para analisar centenas de feeds RSS e selecionar apenas o que realmente importa no mundo tech.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Contra Desinformação</h3>
            <p className="text-sm text-muted-foreground">
              Focamos em fatos e fontes verificadas, eliminando clickbaits e rumores infundados da sua leitura diária.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Resumos Objetivos</h3>
            <p className="text-sm text-muted-foreground">
              Em vez de apenas links, entregamos "stories" completas. Você se informa em 5 minutos, sem sair da nossa plataforma.
            </p>
          </div>
        </div>

        <div className="bg-black text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Projeto Acadêmico & Open Source</h2>
          <p className="text-zinc-300 mb-8 max-w-xl mx-auto">
            Este projeto foi desenvolvido como demonstração de arquitetura moderna web utilizando Next.js 15, Supabase e integração avançada com LLMs.
          </p>
          <Link href="/">
            <Button variant="secondary" size="lg" className="rounded-full px-8">
              Experimentar Agora
            </Button>
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t py-8 mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 Tech News API. Feito com ❤️ e código.
        </p>
      </footer>
    </div>
  )
}

