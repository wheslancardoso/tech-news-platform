import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updatePreferences } from '@/actions/preferences'
import { Button } from '@/components/ui/button'

interface PreferencesPageProps {
  params: Promise<{
    id: string
  }>
}

const CATEGORIES = ['💻 DEV', '🤖 IA', '🛡️ CIBERSEGURANÇA', '💰 MERCADO']

export default async function PreferencesPage({ params }: PreferencesPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !subscriber) {
    notFound()
  }

  async function handleSubmit(formData: FormData) {
    'use server'
    const prefs = formData.getAll('preferences') as string[]
    await updatePreferences(id, prefs)
  }

  return (
    <div className="bg-[#131313] min-h-screen text-[#e5e2e1] font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full border-2 border-[#474747] bg-[#1c1b1b] p-8 md:p-12">
        <header className="mb-10 border-b-2 border-[#474747] pb-6">
          <h1 className="text-3xl font-black tracking-tighter mb-2 text-white">SUAS PREFERÊNCIAS</h1>
          <p className="text-[#919191] text-sm uppercase tracking-widest font-bold">
            {subscriber.email}
          </p>
        </header>

        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-bold text-[#c6c6c6] uppercase tracking-widest mb-4">Escolha o que deseja receber:</p>
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-4 p-4 border-2 border-[#474747] hover:border-white transition-colors cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="preferences" 
                  value={cat} 
                  defaultChecked={subscriber.preferences?.includes(cat)}
                  className="w-5 h-5 rounded-none border-2 border-[#474747] bg-transparent text-white focus:ring-0 checked:bg-white checked:border-white accent-white"
                />
                <span className="font-bold uppercase tracking-wider text-sm group-hover:text-white transition-colors">
                  {cat}
                </span>
              </label>
            ))}
          </div>

          <Button type="submit" className="w-full bg-white text-black hover:bg-[#d4d4d4] rounded-none font-black uppercase tracking-widest h-14 text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
            Salvar Escolhas
          </Button>

          <p className="text-center text-[10px] text-[#474747] uppercase tracking-widest font-bold pt-4">
            Fresh News / Sem Hype / Só o que importa
          </p>
        </form>
      </div>
    </div>
  )
}
