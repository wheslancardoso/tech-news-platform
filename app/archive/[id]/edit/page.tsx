import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateNewsletter } from '@/actions/admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatHtmlForEditor(html: string) {
    if (!html) return '';
    // Adiciona quebras de linha estratégicas para facilitar a leitura
    return html
        .replace(/>/g, '>\n') // Quebra linha após cada tag
        .replace(/</g, '\n<') // Quebra linha antes de cada tag
        .replace(/\n\n/g, '\n') // Remove duplicações
        .trim();
}

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

    // Server Action para o formulário
    async function saveAction(formData: FormData) {
        'use server'

        const title = formData.get('title') as string
        const summary_intro = formData.get('summary_intro') as string
        const html_content = formData.get('html_content') as string

        await updateNewsletter(id, { title, summary_intro, html_content })
        redirect(`/archive/${id}`)
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Home
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Editar Edição #{newsletter.edition_number}</h1>
                <p className="text-muted-foreground">Ajuste o conteúdo antes de publicar.</p>
            </div>

            <form action={saveAction} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Título</label>
                    <Input
                        id="title"
                        name="title"
                        defaultValue={newsletter.title}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="summary_intro" className="text-sm font-medium">Introdução (Resumo)</label>
                    <Textarea
                        id="summary_intro"
                        name="summary_intro"
                        defaultValue={newsletter.summary_intro || ''}
                        className="min-h-[100px]"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="html_content" className="text-sm font-medium">Conteúdo HTML (Email)</label>
                    <div className="text-xs text-muted-foreground mb-2">
                        ⚠️ Cuidado ao editar o HTML diretamente. Mantenha a estrutura de tabelas para compatibilidade com email clients.
                    </div>
                    <Textarea
                        id="html_content"
                        name="html_content"
                        defaultValue={formatHtmlForEditor(newsletter.html_content || '')}
                        className="min-h-[500px] font-mono text-xs"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" size="lg">
                        Salvar Alterações
                    </Button>
                    <Link href={`/archive/${id}`}>
                        <Button variant="outline" size="lg">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
