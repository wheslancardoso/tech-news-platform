import Link from 'next/link'
import { Inbox, Mail, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-black tracking-tight text-slate-900">Torre de Controle</h2>
          <p className="text-xs text-slate-500 mt-1">Zine Camaleônica AI</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/posts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">
            <Inbox className="w-5 h-5" />
            Inbox Curadoria
          </Link>
          <Link href="/admin/newsletters" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium transition-colors">
            <Mail className="w-5 h-5" />
            Newsletters Drafts
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5" />
              Sair do Painel
            </Button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
