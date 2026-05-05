'use client'

import { useActionState } from 'react'
import { subscribe } from '@/actions/subscribe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export function SubscribeForm() {
  const [state, action, isPending] = useActionState(subscribe, {
    message: '',
    success: false,
  })

  return (
    <div className="max-w-md mx-auto">
      <form action={action} className="flex flex-col gap-6">
        
        <div className="text-left text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
          // CONFIG_PREFERENCES (Opcional)
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {['💻 DEV', '🤖 IA', '🛡️ SEC', '💰 BIZ'].map(cat => (
            <label key={cat} className="group relative flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 border-white/10 px-4 py-2 cursor-pointer hover:border-primary transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary">
              <input type="checkbox" name="preferences" value={cat} className="sr-only" />
              <span>{cat}</span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex-grow">
            <Input
              name="email"
              type="email"
              placeholder="USUARIO@NETWORK.COM"
              className="h-14 bg-surface-container-high border-2 border-editorial text-base px-6 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/30 font-black uppercase tracking-tighter"
              defaultValue=""
              disabled={isPending}
              required
            />
          </div>
          <div className="flex-grow">
            <Input
              name="phone"
              type="tel"
              placeholder="+55 WHATSAPP_ID"
              className="h-14 bg-surface-container-high border-2 border-editorial text-base px-6 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/30 font-black uppercase tracking-tighter"
              defaultValue=""
              disabled={isPending}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-8 bg-primary text-primary-foreground hover:bg-white hover:text-black font-black uppercase tracking-[0.2em] transition-all active:scale-95 text-xs"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sincronizar Acesso 🚀'}
          </Button>
        </div>
      </form>

      {/* Feedback Visual */}
      <div className="mt-6 text-left min-h-[24px]">
        {state?.message && (
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${state.success ? 'text-primary' : 'text-red-500'
              }`}
          >
            &gt; {state.message}
          </p>
        )}
        {state?.errors?.email && (
          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">
            &gt; ERR_EMAIL_INVALID: {state.errors.email[0]}
          </p>
        )}
        {!state?.message && !state?.errors && (
          <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
            // Protocolo de privacidade ativo. Sem spam. Apenas inteligência técnica.
          </p>
        )}
      </div>
    </div>
  )
}

