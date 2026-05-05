import { unsubscribeUser } from '@/actions/unsubscribe'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

interface UnsubscribePageProps {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams
  let success = false
  let message = ''

  if (token) {
    const result = await unsubscribeUser(token)
    success = result.success
    message = result.message
  } else {
    message = 'Link inválido.'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square rounded-full blur-[160px] pointer-events-none transition-colors duration-1000 ${success ? 'bg-primary/20' : 'bg-red-500/10'}`}></div>

      <div className="max-w-md w-full glass-card p-12 rounded-[3.5rem] border-white/10 shadow-2xl relative z-10 text-center">
        <div className={`w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-xl border-white/10 ${success ? 'text-emerald-400' : 'text-red-400'}`}>
          {success ? (
            <CheckCircle2 className="w-10 h-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          ) : (
            <XCircle className="w-10 h-10 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
          )}
        </div>
        
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            {success ? 'INSCRIÇÃO_CANCELADA' : 'ERRO_DE_PROTOCOLO'}
          </h1>
          
          <p className="text-muted-foreground/80 text-lg font-medium leading-tight italic">
            {success 
              ? 'Que pena ver você partir! Seu e-mail foi removido da nossa lista de envio.' 
              : message}
          </p>
        </div>
 
        <Link href="/">
          <button className="w-full h-16 bg-primary text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all shadow-2xl shadow-primary/20 active:scale-95">
            {success ? 'INSCREVER-SE_NOVAMENTE' : 'VOLTAR_AO_TERMINAL'}
          </button>
        </Link>

        <div className="mt-12">
          <p className="text-[10px] text-muted-foreground/20 uppercase tracking-[0.6em] font-black italic">
            Fresh News // Protocol // 2026
          </p>
        </div>
      </div>
    </div>
  )
}
