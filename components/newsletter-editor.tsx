'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateNewsletter } from '@/actions/admin'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface NewsletterContent {
    title: string
    intro: string
    quickTakes?: string[]
    categories: Array<{
        name: string
        items: Array<{
            headline: string
            story: string
            link: string
        }>
    }>
}

interface NewsletterEditorProps {
    id: string
    initialData: NewsletterContent
    editionNumber: number
}

export default function NewsletterEditor({ id, initialData, editionNumber }: NewsletterEditorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<NewsletterContent>(initialData)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateNewsletter(id, data)
            router.push(`/archive/${id}`)
            router.refresh()
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar. Verifique o console.')
        } finally {
            setLoading(false)
        }
    }

    const updateCategory = (index: number, field: string, value: string) => {
        const newCategories = [...data.categories]
        newCategories[index] = { ...newCategories[index], [field]: value }
        setData({ ...data, categories: newCategories })
    }

    const updateItem = (catIndex: number, itemIndex: number, field: string, value: string) => {
        const newCategories = [...data.categories]
        const newItems = [...newCategories[catIndex].items]
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
        newCategories[catIndex].items = newItems
        setData({ ...data, categories: newCategories })
    }

    const updateQuickTake = (index: number, value: string) => {
        const newQuickTakes = [...(data.quickTakes || [])]
        newQuickTakes[index] = value
        setData({ ...data, quickTakes: newQuickTakes })
    }

    return (
        <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-4 p-6 bg-card border border-border">
                <h2 className="text-xl font-bold">Informações Gerais</h2>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Introdução</label>
                    <Textarea
                        value={data.intro}
                        onChange={(e) => setData({ ...data, intro: e.target.value })}
                        className="min-h-[100px]"
                        required
                    />
                </div>
            </div>

            {/* Quick Takes */}
            <div className="space-y-4 p-6 bg-card border border-border">
                <h2 className="text-xl font-bold">⚡ Giro Tech (Quick Takes)</h2>
                {data.quickTakes?.map((take, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            value={take}
                            onChange={(e) => updateQuickTake(index, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {data.categories.map((category, catIndex) => (
                    <div key={catIndex} className="space-y-4 p-6 bg-card border border-border">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-bold">Categoria {catIndex + 1}</h2>
                            <Input
                                value={category.name}
                                onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
                                className="font-bold w-full max-w-md"
                            />
                        </div>

                        <div className="space-y-6 pl-4 border-l-2 border-border">
                            {category.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="space-y-3 bg-accent p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Notícia {itemIndex + 1}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Manchete</label>
                                        <Input
                                            value={item.headline}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'headline', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">História</label>
                                        <Textarea
                                            value={item.story}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'story', e.target.value)}
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Link Original</label>
                                        <Input
                                            value={item.link}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'link', e.target.value)}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-4 bg-background/80 backdrop-blur-xl p-4 border border-border">
                <Button type="submit" size="lg" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações & Regenerar HTML'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    )
}
