'use client'

import { useState, useRef } from 'react'
import { FileText, Send, Zap, Copy, Check, ImageIcon, Link as LinkIcon, Upload, Loader2, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import { updateNewsletter, uploadImageAction } from '@/actions/newsletter'
import { generateImagePromptAction } from '@/actions/generate'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { compressAndConvertToWebP } from '@/lib/utils/image-compression'
import { cleanAISummary } from '@/lib/utils/text-cleanup'

interface NewsletterCardProps {
  draft: any
}

export function NewsletterCard({ draft }: NewsletterCardProps) {
  const [imageUrl, setImageUrl] = useState(draft.image_url || '')
  const [imagePrompt, setImagePrompt] = useState(draft.image_prompt || '')
  
  // Limpa artefatos de markdown no carregamento inicial
  const initialContent = draft.content_json || {}
  if (initialContent.intro) initialContent.intro = cleanAISummary(initialContent.intro)
  if (initialContent.categories) {
    initialContent.categories.forEach((cat: any) => {
      cat.items?.forEach((item: any) => {
        if (item.summary) item.summary = cleanAISummary(item.summary)
        if (item.story) item.story = cleanAISummary(item.story)
      })
    })
  }

  const [contentJson, setContentJson] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [generatingItemIdx, setGeneratingItemIdx] = useState<string | null>(null)
  const [showItems, setShowItems] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateNewsletter(draft.id, { 
      image_url: imageUrl, 
      image_prompt: imagePrompt,
      content_json: contentJson
    })
    setIsSaving(false)
    
    if (result.success) {
      toast.success('Edição atualizada com sucesso!')
    } else {
      toast.error('Erro ao salvar: ' + result.error)
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
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
      
      // 2. Upload via Server Action (Bypass RLS com Service Role)
      const base64 = await blobToBase64(compressedBlob)
      const fileName = `edition-${draft.edition_number}-${Date.now()}.webp`
      
      const result = await uploadImageAction(base64, fileName, 'image/webp')

      if (!result.success) {
        console.error('Erro retornado pela Action:', result.error)
        throw new Error(result.error)
      }

      const publicUrl = result.publicUrl!
      setImageUrl(publicUrl)
      
      // 3. Salva automaticamente a nova URL no Banco
      const dbResult = await updateNewsletter(draft.id, { image_url: publicUrl })
      
      if (dbResult.success) {
        toast.success(`Upload concluído! Imagem otimizada (${compressedSizeKB}KB).`, { id: toastId })
      } else {
        toast.error('Imagem enviada, mas houve erro ao salvar no banco.', { id: toastId })
      }
      
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error('Falha no upload: ' + error.message, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleItemFileUpload = async (catIdx: number, itemIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const MAX_SIZE = 10 * 1024 * 1024 
    if (file.size > MAX_SIZE) {
      toast.error('O arquivo é muito grande!')
      return
    }

    const toastId = toast.loading('Processando imagem do item...')
    
    try {
      const compressedBlob = await compressAndConvertToWebP(file, 0.7, 800)
      const base64 = await blobToBase64(compressedBlob)
      const fileName = `item-${draft.edition_number}-${catIdx}-${itemIdx}-${Date.now()}.webp`
      
      const result = await uploadImageAction(base64, fileName, 'image/webp')

      if (!result.success) throw new Error(result.error)

      const publicUrl = result.publicUrl!

      updateItemData(catIdx, itemIdx, { imageUrl: publicUrl })
      toast.success('Imagem do item enviada com sucesso!', { id: toastId })
      
    } catch (error: any) {
      toast.error('Falha no upload do item: ' + error.message, { id: toastId })
    }
  }

  const updateItemData = (catIdx: number, itemIdx: number, newData: any) => {
    const newContent = { ...contentJson }
    if (newContent.categories?.[catIdx]?.items?.[itemIdx]) {
      const item = newContent.categories[catIdx].items[itemIdx]
      // Garantir que o theme existe para o prompt
      if (newData.image_prompt !== undefined) {
        if (!item.theme) item.theme = {}
        item.theme.image_prompt = newData.image_prompt
      }
      // Imagem na raiz do item para o template
      if (newData.imageUrl !== undefined) {
        item.imageUrl = newData.imageUrl
      }
      setContentJson(newContent)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imagePrompt)
    setCopied(true)
    toast.success('Prompt copiado para o clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateGlobalPrompt = async () => {
    setIsGeneratingPrompt(true)
    const toastId = toast.loading('Analisando edição para criar prompt visual...')
    
    try {
      // Coletar contexto da edição
      const titles = contentJson.categories?.flatMap((c: any) => c.items.map((i: any) => i.title)).join(', ')
      const context = `Edition #${draft.edition_number}: ${draft.title}. Main topics: ${titles}`
      
      const result = await generateImagePromptAction(context)
      if (result.success) {
        setImagePrompt(result.prompt)
        toast.success('Prompt global gerado!', { id: toastId })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error('Erro ao gerar prompt: ' + error.message, { id: toastId })
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleGenerateItemPrompt = async (catIdx: number, itemIdx: number) => {
    const item = contentJson.categories[catIdx].items[itemIdx]
    const textToAnalyze = item.summary || item.story || item.title
    
    setGeneratingItemIdx(`${catIdx}-${itemIdx}`)
    const toastId = toast.loading('Gerando prompt para esta notícia...')

    try {
      const result = await generateImagePromptAction(textToAnalyze)
      if (result.success) {
        updateItemData(catIdx, itemIdx, { image_prompt: result.prompt })
        toast.success('Prompt individual gerado!', { id: toastId })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message, { id: toastId })
    } finally {
      setGeneratingItemIdx(null)
    }
  }

  return (
    <div className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden shadow-xl">
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
            <div className="flex items-center gap-3">
              <button 
                onClick={handleGenerateGlobalPrompt}
                disabled={isGeneratingPrompt}
                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2"
              >
                {isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Gerar com IA
              </button>
              <button 
                onClick={copyToClipboard}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar Prompt'}
              </button>
            </div>
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

      <div className="flex items-center justify-between relative z-10 border-t border-white/5 pt-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowItems(!showItems)}
            className="flex items-center gap-3 tech-label text-primary hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            {showItems ? 'Ocultar Notícias' : 'Curar Imagens Individualmente'}
            {showItems ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button className="flex items-center gap-3 tech-label text-muted-foreground/40 cursor-not-allowed">
            <Send className="w-4 h-4" />
            Disparar via Resend
          </button>
        </div>
      </div>

      {/* Seção de Notícias Individuais */}
      {showItems && contentJson.categories && (
        <div className="mt-8 space-y-8 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="tech-label text-muted-foreground/40 uppercase tracking-[0.3em] text-[10px]">Protocolo de Curadoria Individual</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          {contentJson.categories.map((category: any, catIdx: number) => (
            <div key={catIdx} className="space-y-4">
              <h4 className="tech-label text-primary flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                {category.name}
              </h4>
              <div className="grid gap-6">
                {category.items.map((item: any, itemIdx: number) => (
                  <div key={itemIdx} className="glass-card p-6 rounded-2xl border-white/5 bg-white/[0.01] transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={item.title || item.headline || ''}
                          onChange={(e) => updateItemData(catIdx, itemIdx, { title: e.target.value })}
                          className="w-full bg-transparent text-lg font-bold text-foreground/80 leading-tight border-none p-0 focus:ring-0 placeholder:opacity-30"
                          placeholder="Título da Notícia..."
                        />
                      </div>
                      {item.relevance_score && (
                        <div className="px-2 py-1 bg-primary/10 rounded text-[10px] font-black text-primary border border-primary/20">
                          {item.relevance_score}%
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-3">
                        <label className="tech-label text-muted-foreground text-[9px] uppercase tracking-wider">Resumo Técnico (n8n)</label>
                        <textarea 
                          value={item.summary || item.story || ''}
                          onChange={(e) => updateItemData(catIdx, itemIdx, { summary: e.target.value })}
                          className="w-full h-32 bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-muted-foreground focus:border-primary/30 outline-none transition-all resize-none"
                          placeholder="Resumo gerado pelo especialista..."
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="tech-label text-muted-foreground text-[9px] uppercase tracking-wider">Prompt de Imagem</label>
                          <button 
                            onClick={() => handleGenerateItemPrompt(catIdx, itemIdx)}
                            disabled={generatingItemIdx === `${catIdx}-${itemIdx}`}
                            className="text-[9px] font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
                          >
                            {generatingItemIdx === `${catIdx}-${itemIdx}` ? <Loader2 className="w-2 h-2 animate-spin" /> : <Wand2 className="w-2 h-2" />}
                            Auto-Gerar
                          </button>
                        </div>
                        <textarea 
                          value={item.image_prompt || item.theme?.image_prompt || ''}
                          onChange={(e) => updateItemData(catIdx, itemIdx, { image_prompt: e.target.value })}
                          className="w-full h-32 bg-black/20 border border-white/5 rounded-xl p-3 text-[10px] text-muted-foreground/60 font-mono focus:border-primary/30 outline-none transition-all resize-none"
                          placeholder="Prompt para geração..."
                        />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                        <label className="tech-label text-muted-foreground text-[9px] uppercase tracking-wider">WhatsApp Summary</label>
                        <textarea 
                          value={item.whatsapp_summary || ''}
                          onChange={(e) => updateItemData(catIdx, itemIdx, { whatsapp_summary: e.target.value })}
                          className="w-full h-20 bg-black/20 border border-white/5 rounded-xl p-3 text-[10px] text-muted-foreground/60 focus:border-primary/30 outline-none transition-all resize-none"
                          placeholder="Versão cirúrgica para WhatsApp..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="tech-label text-muted-foreground text-[9px] uppercase tracking-wider">Imagem do Item</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={item.imageUrl || ''}
                            onChange={(e) => updateItemData(catIdx, itemIdx, { imageUrl: e.target.value })}
                            className="flex-1 bg-black/20 border border-white/5 rounded-xl p-3 text-[10px] text-foreground focus:border-primary/30 outline-none transition-all"
                            placeholder="URL..."
                          />
                          <input 
                            type="file"
                            onChange={(e) => handleItemFileUpload(catIdx, itemIdx, e)}
                            accept="image/*"
                            className="hidden"
                            ref={el => { itemFileInputRefs.current[`${catIdx}-${itemIdx}`] = el }}
                          />
                          <Button 
                            type="button"
                            onClick={() => itemFileInputRefs.current[`${catIdx}-${itemIdx}`]?.click()}
                            className="rounded-xl h-[42px] px-3 bg-primary/10 hover:bg-primary/20 border border-primary/20"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {item.imageUrl && (
                          <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-white/5">
                            <img src={item.imageUrl} alt="Item Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
