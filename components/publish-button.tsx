'use client'

import { useState } from 'react'
import { publishNewsletter } from '@/actions/publish'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PublishButtonProps {
  id: string
  status: 'draft' | 'published'
}

export function PublishButton({ id, status }: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false)

  if (status === 'published') return null

  const handlePublish = async (e: React.MouseEvent) => {
    e.preventDefault() // Evita abrir o link do card
    e.stopPropagation()

    if (!confirm('Tem certeza que deseja enviar esta newsletter para todos os assinantes?')) return

    setIsPublishing(true)
    try {
      const result = await publishNewsletter(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(`Erro: ${result.message}`)
      }
    } catch (error) {
      toast.error('Erro inesperado ao publicar.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className="h-8 px-3 bg-white/90 backdrop-blur border shadow-sm hover:bg-white"
      onClick={handlePublish}
      disabled={isPublishing}
    >
      {isPublishing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
      ) : (
        <Send className="w-3.5 h-3.5 mr-2" />
      )}
      {isPublishing ? 'Enviando...' : 'Publicar'}
    </Button>
  )
}

