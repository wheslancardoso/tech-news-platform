import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ArchivePageProps {
  params: Promise<{
    id: string
  }>
}

const getCategoryColor = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes('IA') || upper.includes('INTELIGÊNCIA')) return '#00F0FF';
  if (upper.includes('DEV') || upper.includes('ENGENHARIA') || upper.includes('CODING')) return '#00FF41';
  if (upper.includes('SEC') || upper.includes('CIBER') || upper.includes('HACKER')) return '#FF0000';
  if (upper.includes('STARTUP') || upper.includes('BUSINESS') || upper.includes('MERCADO')) return '#E10600';
  return '#ffffff';
};

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !newsletter) {
    notFound()
  }

  const content = newsletter.content_json;

  return (
    <div className="bg-[#131313] min-h-screen text-[#e5e2e1] font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* HEADER EDITORIAL */}
      <header className="border-b-2 border-[#474747] bg-[#0e0e0e] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-none">
              <span className="text-black font-black text-sm tracking-tighter">FN</span>
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase">Fresh News</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
            <Link href="/" className="text-[#919191] hover:text-white transition-colors">Voltar à Home</Link>
            <Link href="/#subscribe" className="bg-white text-black hover:bg-[#d4d4d4] px-6 py-3 rounded-none transition-colors border-2 border-transparent">
              Assinar Zine
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        
        {/* INFO DA EDIÇÃO */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="px-3 py-1 text-xs font-bold bg-[#ffffff] text-[#000000] uppercase tracking-widest">
            EDIÇÃO #{newsletter.edition_number}
          </span>
          <span className="px-3 py-1 text-xs font-mono border border-[#474747] text-[#c6c6c6] uppercase tracking-widest">
            {format(new Date(newsletter.created_at), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* TÍTULO & INTRODUÇÃO */}
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-white leading-tight">
          {content.title}
        </h1>
        <p className="text-xl md:text-2xl font-light italic text-[#b9cacb] mb-16 leading-relaxed border-l-4 border-[#474747] pl-6">
          "{content.intro}"
        </p>

        {/* QUICK TAKES */}
        {content.quickTakes && content.quickTakes.length > 0 && (
          <div className="bg-[#1c1b1b] border-2 border-[#474747] p-8 mb-16">
            <h2 className="text-white font-black text-lg mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="text-2xl">⚡</span> Giro Tech
            </h2>
            <ul className="space-y-4">
              {content.quickTakes.map((take: string, idx: number) => (
                <li key={idx} className="text-[#e5e2e1] text-lg font-medium leading-relaxed flex items-start">
                  <span className="text-[#474747] mr-3 font-bold">/</span>
                  {take}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CATEGORIAS (BLOCOS PRINCIPAIS) */}
        <div className="space-y-20">
          {content.categories?.map((cat: any, catIdx: number) => {
            const catColor = getCategoryColor(cat.name);
            return (
              <section key={catIdx} className="relative">
                {/* Linha Decorativa da Categoria */}
                <div className="h-1 w-full mb-8" style={{ backgroundColor: catColor }} />
                
                <h2 
                  className="text-3xl font-black mb-10 uppercase tracking-widest"
                  style={{ color: catColor }}
                >
                  {cat.name}
                </h2>

                <div className="space-y-12">
                  {cat.items?.map((item: any, itemIdx: number) => (
                    <article key={itemIdx} className="group relative pl-6 border-l-2 border-[#353534] hover:border-white transition-colors">
                      {/* Efeito Hover Camaleão */}
                      <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: catColor }} />
                      
                      <h3 className="text-2xl font-bold mb-4 text-white leading-snug group-hover:underline decoration-2 underline-offset-4">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.headline}
                        </a>
                      </h3>
                      
                      <p className="text-[#919191] text-lg leading-relaxed mb-6 font-medium">
                        {item.story}
                      </p>
                      
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-bold uppercase tracking-widest transition-colors hover:text-white"
                        style={{ color: catColor }}
                      >
                        Ler matéria completa <span className="ml-2 font-mono">-&gt;</span>
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ASSINATURA FINAL */}
        <div className="mt-24 pt-12 border-t-2 border-[#474747] text-center">
          <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">O Fim da Edição</h3>
          <p className="text-[#919191] text-lg mb-8 max-w-xl mx-auto">
            Esta Zine foi destilada de fontes ruidosas. Assine para receber conteúdo cirúrgico direto no seu WhatsApp ou E-mail.
          </p>
          <Link href="/#subscribe" className="inline-flex bg-white text-black hover:bg-[#d4d4d4] px-10 py-5 font-black uppercase tracking-widest text-lg transition-colors rounded-none">
            Receber Próximas Edições
          </Link>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0e0e0e] border-t-2 border-[#474747] py-12 mt-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white flex items-center justify-center rounded-none">
              <span className="text-black font-black text-[10px]">FN</span>
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-white">Fresh News</span>
          </div>
          <p className="text-[#474747] text-xs font-mono uppercase tracking-widest">
            © 2026 / Sem Hype, Só O Que Importa.
          </p>
        </div>
      </footer>
    </div>
  )
}
