'use client'

import { useState, useRef } from 'react'
import { FileText, Send, Zap, Copy, Check, ImageIcon, Link as LinkIcon, Upload, Loader2 } from 'lucide-react'
import { updateNewsletter } from '@/actions/newsletter'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { compressAndConvertToWebP } from '@/lib/utils/image-compression'

interface NewsletterCardProps {
  draft: any
}

export function NewsletterCard({ draft }: NewsletterCardProps) {
  const [imageUrl, setImageUrl] = useState(draft.image_url || '')
  const [imagePrompt, setImagePrompt] = useState(draft.image_prompt || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateNewsletter(draft.id, { 
      image_url: imageUrl, 
      image_prompt: imagePrompt 
    })
    setIsSaving(false)
    
    if (result.success) {
      toast.success('Edição atualizada com sucesso!')
    } else {
      toast.error('Erro ao salvar: ' + result.error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limite de 10MB para evitar travamentos no navegador
    const MAX_SIZE = 10 * 1024 * 1024 
    if (file.size > MAX_SIZE) {
      toast.error('O arquivo original é muito grande! Tente um abaixo de 10MB.')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Comprimindo e enviando imagem...')

    try {
      // 1. Ultra-Compressão e Conversão para WebP (Params otimizados para KB)
      const compressedBlob = await compressAndConvertToWebP(file, 0.6, 1000)
      
      const originalSize = (file.size / 1024 / 1024).toFixed(2)
      const compressedSizeKB = (compressedBlob.size / 1024).toFixed(0)
      console.log(`[Compression] Original: ${originalSize}MB | WebP: ${compressedSizeKB}KB`)
      
      // 2. Upload para o Supabase Storage
      const fileName = `edition-${draft.edition_number}-${Date.now()}.webp`
      const { data, error } = await supabase.storage
        .from('newsletters')
        .upload(fileName, compressedBlob, {
          contentType: 'image/webp',
          upsert: true
        })

      if (error) throw error

      // 3. Obter URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('newsletters')
        .getPublicUrl(fileName)

      setImageUrl(publicUrl)
      toast.success(`Imagem otimizada: ${compressedSizeKB}KB!`, { id: toastId })
      
      // Salva automaticamente a nova URL
      await updateNewsletter(draft.id, { image_url: publicUrl })
      
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error('Falha no upload: ' + error.message, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imagePrompt)
    setCopied(true)
    toast.success('Prompt copiado para o clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-primary/10 transition-all"></div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <span className="px-5 py-2 tech-label bg-primary text-white rounded-full shadow-lg shadow-primary/20">
            EDIÇÃO #{draft.edition_number}
          </span>
          <span className="px-5 py-2 tech-label glass-card border-white/10 text-muted-foreground rounded-full">
            {new Date(draft.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isUploading}
          variant="outline"
          className="rounded-full px-8 tech-label border-primary/20 hover:bg-primary/10"
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <h3 className="text-3xl md:text-4xl font-black mb-6 text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors relative z-10">
        {draft.title}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 relative z-10">
        {/* Lado Esquerdo: Prompt */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="tech-label text-primary flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Prompt Sugerido (IA)
            </label>
            <button 
              onClick={copyToClipboard}
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado' : 'Copiar Prompt'}
            </button>
          </div>
          <textarea 
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-muted-foreground focus:border-primary/50 outline-none transition-all resize-none font-mono"
            placeholder="Aguardando geração de prompt..."
          />
        </div>

        {/* Lado Direito: URL e Upload */}
        <div className="space-y-4">
          <label className="tech-label text-primary flex items-center gap-2">
            <LinkIcon className="w-3 h-3" /> Imagem da Capa (WebP Otimizado)
          </label>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input 
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs text-foreground focus:border-primary/50 outline-none transition-all"
                placeholder="URL da imagem..."
              />
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <Button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-2xl aspect-square h-[52px] p-0 bg-primary/10 hover:bg-primary/20 border border-primary/20"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </Button>
          </div>
          
          {imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group/img bg-zinc-950">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                <span className="tech-label text-white">Preview Final (Otimizado)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10 border-t border-white/5 pt-8">
        <button className="flex items-center gap-3 tech-label text-primary hover:text-white transition-colors">
          <FileText className="w-4 h-4" />
          Visualizar rascunho
        </button>
        <button className="flex items-center gap-3 tech-label text-muted-foreground/40 cursor-not-allowed">
          <Send className="w-4 h-4" />
          Disparar via Resend
        </button>
      </div>
    </div>
  )
}
