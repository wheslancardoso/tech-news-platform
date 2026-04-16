import { login } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm w-full p-8 bg-card border border-border text-center">
        <div className="w-12 h-12 border border-border bg-accent flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-black mb-1 text-foreground uppercase tracking-tight">Área Restrita</h1>
        <p className="text-xs font-mono text-muted-foreground mb-6 tracking-wider">// APENAS EDITORES AUTORIZADOS</p>

        <form action={login} className="space-y-4">
          <Input
            name="password"
            type="password"
            placeholder="Senha de acesso"
            className="text-center bg-background border-border text-foreground placeholder:text-muted-foreground/40 font-mono h-12 focus:border-[hsl(186,100%,50%)]"
            required
          />
          {error === 'invalid_password' && (
            <p className="text-xs font-mono text-red-400 tracking-wider">!! Senha incorreta.</p>
          )}
          <button
            type="submit"
            className="w-full h-12 bg-[hsl(186,100%,50%)] text-black font-black text-xs tracking-widest uppercase hover:bg-[hsl(186,100%,60%)] transition-colors"
          >
            ACESSAR PAINEL
          </button>
        </form>
      </div>
    </div>
  )
}
