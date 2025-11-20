import { unsubscribeUser } from '@/actions/unsubscribe'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm border text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${success ? 'bg-green-100' : 'bg-red-100'}`}>
          {success ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-slate-900">
          {success ? 'Inscrição Cancelada' : 'Ops, algo deu errado'}
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          {success 
            ? 'Que pena ver você partir! Seu e-mail foi removido da nossa lista de envio.' 
            : message}
        </p>

        <Link href="/">
          <Button className="w-full bg-black text-white hover:bg-zinc-800 h-12 text-base">
            {success ? 'Inscrever-se Novamente' : 'Voltar para Home'}
          </Button>
        </Link>
      </div>
    </div>
  )
}

