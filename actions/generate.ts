'use server'

import { generateNewsletterService } from '@/lib/services/newsletter'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

export async function generateDraft(formData?: FormData) {
  try {
    await generateNewsletterService()
    revalidatePath('/')
  } catch (error) {
    console.error('Erro ao gerar draft via Action:', error)
  }
}

export async function generateImagePromptAction(text: string) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a Brutalist Art Director for a high-end tech magazine. 
          Your task is to transform a technical summary into a visually stunning, cinematic IMAGE PROMPT for DALL-E 3.
          
          AESTHETIC RULES:
          - Style: Digital Brutalism / Neo-Industrial / Cyberpunk High-Tech.
          - Colors: High contrast, deep blacks, neon accents (Cyan, Matrix Green, or Cyber Purple).
          - Composition: Macro shots, 3D isometric renders, or abstract data visualizations.
          - Textures: Brushed metal, glowing circuitry, frosted glass, raw concrete.
          - NO CLICHES: Avoid friendly robots or generic office settings. 
          - TONE: Serious, professional, avant-garde.
          
          RETURN ONLY THE PROMPT IN ENGLISH.`
        },
        {
          role: 'user',
          content: `Technical Summary: ${text}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    })

    return { 
      success: true, 
      prompt: response.choices[0]?.message?.content?.trim() || '' 
    }
  } catch (error: any) {
    console.error('Erro ao gerar prompt de imagem:', error)
    return { success: false, error: error.message }
  }
}
