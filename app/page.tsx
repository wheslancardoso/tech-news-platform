import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { generateDraft } from '@/actions/generate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

export const revalidate = 0 

export default async function Home() {
  const supabase = await createClient()

  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('*')
    .order('edition_number', { ascending: false })

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">TN</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">The News</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#archive" className="hover:text-black transition-colors">Edições</a>
            <a href="#" className="hover:text-black transition-colors">Sobre</a>
            <Button size="sm" className="bg-black text-white hover:bg-zinc-800 rounded-full px-6">
              Inscrever-se
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
              As notícias de tech que importam, <span className="text-muted-foreground">sem o hype.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Um resumo diário de 5 minutos com tudo que você precisa saber para começar o dia bem informado.
            </p>

            <div className="max-w-md mx-auto mt-10">
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="h-12 rounded-lg border-slate-300 text-base px-4 focus-visible:ring-black"
                />
                <Button size="lg" className="h-12 px-8 rounded-lg bg-black text-white hover:bg-zinc-800 font-medium">
                  Inscrever-se
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Junte-se a 10.000+ leitores inteligentes. Cancelamento a qualquer momento.
              </p>
            </div>

            {/* Hidden Dev Trigger */}
            <form action={generateDraft} className="opacity-0 hover:opacity-100 transition-opacity absolute top-0 right-0 p-4">
               <Button type="submit" variant="ghost" size="sm" className="text-xs">
                 (Dev) Gerar Edição
               </Button>
            </form>
          </div>
        </section>

        {/* Archive Section */}
        <section id="archive" className="bg-slate-50 py-20 border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Edições Anteriores</h2>
              <Button variant="outline" className="hidden md:flex">Ver arquivo completo</Button>
            </div>
            
            {!newsletters || newsletters.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed rounded-xl bg-white">
                <p className="text-muted-foreground">Nenhuma edição encontrada.</p>
                <p className="text-sm text-slate-400 mt-2">Use o botão oculto no canto superior direito para gerar conteúdo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsletters.map((news) => (
                  <NewsCard
                    key={news.id}
                    id={news.id}
                    edition={news.edition_number}
                    title={news.title}
                    date={news.created_at}
                    intro={news.summary_intro}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center md:hidden">
               <Button variant="outline" className="w-full">Ver arquivo completo</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">TN</span>
                </div>
                <span className="font-bold text-lg tracking-tight">The News</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Curadoria de notícias de tecnologia feita para desenvolvedores e entusiastas. Sem spam, apenas conteúdo.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-black">Últimas Edições</a></li>
                <li><a href="#" className="hover:text-black">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-black">Patrocine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Social</h4>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-black"><Twitter size={20} /></a>
                <a href="#" className="text-muted-foreground hover:text-black"><Instagram size={20} /></a>
                <a href="#" className="text-muted-foreground hover:text-black"><Linkedin size={20} /></a>
                <a href="#" className="text-muted-foreground hover:text-black"><Facebook size={20} /></a>
              </div>
            </div>
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2025 The News Platform. Todos os direitos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-black">Privacidade</a>
              <a href="#" className="hover:text-black">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
