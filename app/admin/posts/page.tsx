import { createAdminClient } from '@/lib/supabase/admin'
import { publishNewsletter, rejectNewsletter } from '@/actions/newsletters'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminPostsPage() {
  const supabase = createAdminClient()
  
  // Usando service role pra ler tudo sem depender do RLS
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar newsletters: {error.message}</div>
  }

  return (
    <div className="bg-[#131313] min-h-screen p-8 text-[#e5e2e1] font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b-2 border-[#474747] pb-6">
          <h1 className="text-5xl font-black tracking-tighter mb-2 text-white">INBOX DE CURADORIA</h1>
          <p className="text-[#c6c6c6] text-lg font-light">
            Avalie as notícias capturadas. O Cérebro de IA aguarda suas ordens para gerar as Zines Temáticas.
          </p>
        </header>

      {newsletters?.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-[#474747] bg-[#1c1b1b]">
          <p className="text-[#c6c6c6] font-medium text-lg uppercase tracking-widest">Nenhuma Zine pendente de aprovação no Cérebro. 🧠</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {newsletters?.map((newsletter) => {
            return (
            <div key={newsletter.id} className="bg-[#1c1b1b] border-2 border-[#474747] p-8 flex flex-col md:flex-row gap-8 items-start hover:border-white transition-colors relative overflow-hidden group">
              
              {/* Target DNA Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3" style={{ backgroundColor: '#ffffff' }} />

              <div className="flex-1 pl-4">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-xs font-bold bg-[#ffffff] text-[#000000] uppercase tracking-wider">
                    {newsletter.category || 'GERAL'}
                  </span>
                  <span className="px-3 py-1 text-xs font-mono border border-[#474747] text-[#c6c6c6]">
                    EDIÇÃO #{newsletter.edition_number}
                  </span>
                  <span className="text-xs text-[#919191] font-medium uppercase tracking-wider">
                    {new Date(newsletter.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 text-white leading-tight tracking-tight">
                  {newsletter.title}
                </h3>
                
                <p className="text-[#e5e2e1] mb-6 text-base leading-relaxed max-w-3xl italic">
                  "{newsletter.summary_intro}"
                </p>

                {/* Lista de Manchetes (Posts Agrupados) */}
                {newsletter.content_json?.categories?.length > 0 && (
                  <div className="bg-[#2a2a2a] p-4 border-l-4 border-[#474747] mb-4">
                    <p className="text-sm font-bold text-[#c6c6c6] mb-4 uppercase tracking-widest">Conteúdo da Edição:</p>
                    
                    <div className="space-y-6">
                      {newsletter.content_json.categories.map((cat: any, catIdx: number) => (
                        <div key={catIdx}>
                          <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-widest">{cat.name}</h4>
                          <ul className="space-y-3">
                            {cat.items?.map((item: any, idx: number) => (
                              <li key={idx} className="text-sm text-[#e5e2e1] pl-2 border-l-2 border-[#474747]">
                                <span className="font-bold text-white mr-2">{item.headline}</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#919191] hover:text-white hover:underline text-xs">
                                  [Ver Fonte]
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col gap-4 shrink-0 md:w-40 pt-2">
                <form action={publishNewsletter.bind(null, newsletter.id)}>
                  <Button type="submit" className="w-full bg-white text-black hover:bg-[#d4d4d4] rounded-none font-bold uppercase tracking-wider h-12">
                    <Check className="w-4 h-4 mr-2" /> Publicar
                  </Button>
                </form>
                <form action={rejectNewsletter.bind(null, newsletter.id)}>
                  <Button type="submit" variant="outline" className="w-full bg-transparent text-[#e5e2e1] border-2 border-[#474747] hover:bg-[#93000a] hover:text-white hover:border-[#93000a] rounded-none font-bold uppercase tracking-wider h-12">
                    <X className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
                </form>
              </div>
            </div>
          )})}
        </div>
      )}
      </div>
    </div>
  )
}
