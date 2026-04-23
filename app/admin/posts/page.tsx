import { createAdminClient } from '@/lib/supabase/admin'
import { approvePost, rejectPost } from '@/actions/posts'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminPostsPage() {
  const supabase = createAdminClient()
  
  // Usando service role pra ler tudo sem depender do RLS (mas pegando apenas pending)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'pending')
    .order('score', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar posts: {error.message}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inbox de Curadoria</h1>
      <p className="text-slate-500 mb-8">
        Avalie as notícias capturadas. Posts aprovados seguirão o DNA visual estabelecido pela IA.
      </p>

      {posts?.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500 font-medium text-lg">Nenhum post pendente de curadoria. 🎉</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                    Score: {post.score}
                  </span>
                  {post.theme_config && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-full flex items-center gap-2 border border-emerald-200">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: post.theme_config.primary_color || '#000' }}></span>
                      DNA Gerado
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{post.source}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-slate-900">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                    {post.title}
                  </a>
                </h3>
                
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  {post.summary}
                </p>

                {post.whatsapp_summary && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
                    <p className="text-sm font-mono text-green-900 break-words flex gap-2">
                      <span className="opacity-75">📱</span> <span>{post.whatsapp_summary}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col gap-3 shrink-0 md:w-32">
                <form action={approvePost.bind(null, post.id)}>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-emerald-600 gap-2 transition-colors">
                    <Check className="w-4 h-4" /> Aprovar
                  </Button>
                </form>
                <form action={rejectPost.bind(null, post.id)}>
                  <Button type="submit" variant="outline" className="w-full text-slate-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200 gap-2 transition-colors">
                    <X className="w-4 h-4" /> Rejeitar
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
