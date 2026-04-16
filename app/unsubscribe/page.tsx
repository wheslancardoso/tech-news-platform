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
    <div className="min-h-screen flex items-center justify-center bg-background font-sans">
      <div className="max-w-sm w-full p-8 bg-card border border-border text-center">
        <div className={`w-14 h-14 flex items-center justify-center mx-auto mb-6 border ${success ? 'border-[hsl(120,100%,50%)]/30 bg-[hsl(120,100%,50%)]/10' : 'border-red-500/30 bg-red-500/10'}`}>
          {success ? (
            <CheckCircle2 className="w-7 h-7 text-[hsl(120,100%,50%)]" />
          ) : (
            <XCircle className="w-7 h-7 text-red-400" />
          )}
        </div>
        
        <h1 className="text-xl font-black mb-2 text-foreground uppercase tracking-tight">
          {success ? 'Inscrição Cancelada' : 'Ops, algo errado'}
        </h1>
        
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {success 
            ? 'Que pena ver você partir! Seu e-mail foi removido da nossa lista de envio.' 
            : message}
        </p>

        <Link href="/">
          <button className="w-full h-12 bg-[hsl(186,100%,50%)] text-black font-black text-xs tracking-widest uppercase hover:bg-[hsl(186,100%,60%)] transition-colors">
            {success ? 'INSCREVER-SE NOVAMENTE' : 'VOLTAR PARA HOME'}
          </button>
        </Link>
      </div>
    </div>
  )
}
