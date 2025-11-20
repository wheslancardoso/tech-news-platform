import { createClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/news-card'
import { generateDraft } from '@/actions/generate'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const revalidate = 0 // Garante que a página sempre busque dados novos

export default async function Home() {
  const supabase = await createClient()

  // Busca newsletters publicadas (ou drafts para teste, já que só temos drafts no mock)
  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('*')
    .order('edition_number', { ascending: false })

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header Minimalista */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full" />
            <span className="font-bold text-xl tracking-tight">The News</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary">Arquivo</a>
            <a href="#" className="hover:text-primary">Sobre</a>
            <Button size="sm">Assinar</Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Tecnologia, simplificada.
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a 10.000+ desenvolvedores que recebem nosso resumo diário de 5 minutos.
          </p>
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <form action={generateDraft}> 
               {/* Botão de teste para gerar draft */}
               <Button type="submit" variant="outline">
                 (Dev) Gerar Nova Edição Mock
               </Button>
            </form>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Grid de Edições */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Edições Anteriores</h2>
          
          {!newsletters || newsletters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma edição encontrada. Clique no botão de teste acima para gerar uma.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((news) => (
                <NewsCard
                  key={news.id}
                  id={news.id}
                  edition={news.edition_number}
                  title={news.title}
                  date={news.created_at} // Usando created_at pois published_at pode ser null no draft
                  intro={news.summary_intro}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 The News Platform. Construído com Next.js 15 & Supabase.
        </div>
      </footer>
    </div>
  )
}
