'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function FloatingDevMenu() {
    const [isIngesting, setIsIngesting] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    async function handleIngest() {
        setIsIngesting(true)
        try {
            const res = await fetch('/api/cron?force=true')
            const data = await res.json()

            if (data.success) {
                toast.success(`Coleta concluída! ${data.stats?.inserted || 0} posts processados`)
            } else {
                toast.error(data.message || 'Erro na coleta')
            }
        } catch (error) {
            toast.error('Falha ao conectar com a API')
        } finally {
            setIsIngesting(false)
        }
    }

    async function handleGenerate() {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/generate', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                toast.success(`Edição #${data.edition} gerada com sucesso!`)
            } else {
                toast.error(data.message || 'Erro na geração')
            }
        } catch (error) {
            toast.error('Falha ao gerar newsletter')
        } finally {
            setIsGenerating(false)
        }
    }

    // Só mostra em desenvolvimento
    if (process.env.NODE_ENV === 'production') {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 shadow-lg transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
            >
                {isIngesting ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        Coletando...
                    </>
                ) : (
                    <>📥 Coletar Notícias</>
                )}
            </button>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg border border-transparent bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 shadow-lg transition hover:bg-zinc-200 disabled:opacity-50"
            >
                {isGenerating ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        Gerando...
                    </>
                ) : (
                    <>📰 Gerar Edição</>
                )}
            </button>
        </div>
    )
}
