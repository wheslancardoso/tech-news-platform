import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cookies } from 'next/headers'
import NewsletterEditor from '@/components/newsletter-editor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditNewsletterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Verificar se é admin via Cookie
    const cookieStore = await cookies()
    const isAdmin = cookieStore.has('admin_session')

    if (!isAdmin) {
        redirect('/login')
    }

    // Buscar newsletter
    const { data: newsletter, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !newsletter) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Home
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Edição #{newsletter.edition_number}</h1>
                <p className="text-muted-foreground">Ajuste o conteúdo estruturado. O HTML será regenerado automaticamente.</p>
            </div>

            <NewsletterEditor
                id={newsletter.id}
                initialData={newsletter.content_json as any}
                editionNumber={newsletter.edition_number}
            />
        </div>
    )
}
