import Link from 'next/link'
import { Inbox, Mail, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row p-4 md:p-8 gap-8">
      <aside className="w-full md:w-80 glass-card rounded-[2.5rem] border-white/5 flex flex-col p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
        
        <div className="mb-12 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Logo size={32} />
            <h2 className="text-xl font-heading font-bold tracking-tighter text-foreground">Admin Console</h2>
          </div>
          <p className="tech-label">SISTEMA DE GESTÃO · v1.2</p>
        </div>
        
        <nav className="flex-1 space-y-4 relative z-10">
          <Link href="/admin/posts" className="flex items-center gap-4 px-6 py-4 rounded-2xl glass-card border-white/0 hover:border-white/10 hover:bg-white/5 tech-label transition-all group">
            <Inbox className="w-5 h-5 group-hover:text-primary transition-colors" />
            Inbox Curadoria
          </Link>
          <Link href="/admin/newsletters" className="flex items-center gap-4 px-6 py-4 rounded-2xl glass-card border-white/0 hover:border-white/10 hover:bg-white/5 tech-label transition-all group">
            <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
            Edições Pendentes
          </Link>
        </nav>
        
        <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
          <form action={logout}>
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl glass-card border-white/0 hover:border-red-500/20 hover:bg-red-500/5 text-red-500/40 hover:text-red-500 font-bold text-[10px] uppercase tracking-[0.3em] transition-all">
              <LogOut className="w-5 h-5" />
              Encerrar Sessão
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 glass-card rounded-[3rem] border-white/5 p-8 md:p-20 overflow-y-auto shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[150px]"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
