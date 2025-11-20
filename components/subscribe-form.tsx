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
    <div className="max-w-md mx-auto mt-10">
      <form action={action} className="flex gap-2">
        <div className="flex-grow">
          <Input
            name="email"
            type="email"
            placeholder="Seu melhor e-mail"
            className="h-12 rounded-lg border-slate-300 text-base px-4 focus-visible:ring-black"
            defaultValue=""
            disabled={isPending}
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-8 rounded-lg bg-black text-white hover:bg-zinc-800 font-medium min-w-[140px]"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Inscrever-se'}
        </Button>
      </form>
      
      {/* Feedback Visual */}
      <div className="h-6 mt-2 text-left">
        {state?.message && (
          <p
            className={`text-sm font-medium ${
              state.success ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {state.message}
          </p>
        )}
        {state?.errors?.email && (
          <p className="text-sm text-red-500 font-medium">
            {state.errors.email[0]}
          </p>
        )}
        {!state?.message && !state?.errors && (
          <p className="text-xs text-muted-foreground mt-1">
             Junte-se a 10.000+ leitores inteligentes. Cancelamento a qualquer momento.
          </p>
        )}
      </div>
    </div>
  )
}

