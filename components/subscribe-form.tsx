'use client'

import { useActionState } from 'react'
import { subscribe } from '@/actions/subscribe'
import { Loader2 } from 'lucide-react'

export function SubscribeForm() {
  const [state, action, isPending] = useActionState(subscribe, {
    message: '',
    success: false,
  })

  return (
    <div className="max-w-lg">
      <form action={action} className="flex flex-col sm:flex-row gap-[2px]">
        <div className="flex-grow">
          <input
            name="email"
            type="email"
            placeholder="seu@email.com"
            className="w-full h-12 bg-card border border-border px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(186,100%,50%)] transition-colors"
            defaultValue=""
            disabled={isPending}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-12 px-8 bg-[hsl(186,100%,50%)] text-black font-black text-xs tracking-widest uppercase hover:bg-[hsl(186,100%,60%)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'INSCREVER-SE'}
        </button>
      </form>

      {/* Feedback Visual */}
      <div className="h-6 mt-3">
        {state?.message && (
          <p
            className={`text-xs font-mono tracking-wider ${state.success ? 'text-[hsl(120,100%,50%)]' : 'text-red-400'}`}
          >
            {state.success ? '// ' : '!! '}{state.message}
          </p>
        )}
        {state?.errors?.email && (
          <p className="text-xs font-mono text-red-400 tracking-wider">
            !! {state.errors.email[0]}
          </p>
        )}
        {!state?.message && !state?.errors && (
          <p className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
            // 10.000+ leitores · cancelamento a qualquer momento
          </p>
        )}
      </div>
    </div>
  )
}
