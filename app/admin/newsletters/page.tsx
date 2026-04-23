import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminNewslettersPage() {
  const supabase = createAdminClient()
  
  const { data: drafts, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-4 text-red-500 border border-red-200 bg-red-50 rounded-lg">Erro: {error.message}</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Newsletters (Drafts)</h1>
      <p className="text-slate-500 mb-8">
        Visualize e gerencie os rascunhos diários antes de aprovar o disparo pelo Resend.
      </p>

      {drafts?.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-slate-500 font-medium text-lg">Nenhum rascunho de newsletter no momento. 📭</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts?.map((draft) => (
            <div key={draft.id} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  Edição #{draft.edition_number}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  Criada em {new Date(draft.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-800">{draft.title}</h3>
              {draft.summary_intro && (
                <p className="text-slate-600 mb-4">{draft.summary_intro}</p>
              )}
              {/* O botão de disparo e a action de envio serão configurados na Fase 5 */}
              <div className="text-sm text-slate-400 border-t border-slate-100 pt-3 mt-4">
                Aguardando infraestrutura da Fase 5 (Resend) para habilitar disparo.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
