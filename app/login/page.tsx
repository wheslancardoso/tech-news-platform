import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm border text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Área Restrita</h1>
        <p className="text-muted-foreground mb-6">Apenas para editores autorizados.</p>

        <form action={login} className="space-y-4">
          <Input
            name="password"
            type="password"
            placeholder="Senha de acesso"
            className="text-center"
            required
          />
          {error === 'invalid_password' && (
            <p className="text-sm text-red-500 font-medium">Senha incorreta.</p>
          )}
          <Button className="w-full bg-black text-white hover:bg-zinc-800">
            Acessar Painel
          </Button>
        </form>
      </div>
    </div>
  )
}

