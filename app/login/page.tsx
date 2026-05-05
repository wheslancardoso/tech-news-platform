import { login } from '@/actions/auth'
import { Lock } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg aspect-square bg-primary/20 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-card p-12 rounded-[3.5rem] border-white/10 shadow-2xl relative z-10 text-center">
        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-4 mb-12">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">ÁREA RESTRITA</h1>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-black italic">Apenas para editores autorizados.</p>
        </div>
 
        <form action={login} className="space-y-8">
          <div className="space-y-2">
            <input
              name="password"
              type="password"
              placeholder="Senha de acesso"
              className="w-full h-16 px-8 glass-card rounded-2xl border-white/5 bg-white/5 text-center text-foreground placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
              required
            />
            {error === 'invalid_password' && (
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest pt-2">Acesso Negado: Senha Incorreta</p>
            )}
          </div>

          <button className="w-full h-16 bg-primary text-white hover:bg-white hover:text-black rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all shadow-2xl shadow-primary/20 active:scale-95">
            ACESSAR_PAINEL
          </button>
        </form>

        <div className="mt-12">
          <p className="text-[10px] text-muted-foreground/20 uppercase tracking-[0.6em] font-black italic">
            Binary BroadSheet // Security Layer
          </p>
        </div>
      </div>
    </div>
  )
}

