'use client'

import { useEffect } from 'react'

/**
 * Utilitário para converter cores Hex para HSL aceitáveis pelo Tailwind / CSS Variables
 */
const hexToHsl = (hex: string): string => {
  // Remover o #
  hex = hex.replace('#', '')
  
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * ChameleonScrollObserver
 * Componente do lado do cliente que usa a Intersection Observer API para detectar a seção ativa
 * e transicionar dinamicamente as cores de destaque primário da página global.
 */
export function ChameleonScrollObserver() {
  useEffect(() => {
    // 1. Guardar valores padrões originais para restauração
    const originalBg = 'hsl(240, 10%, 3.9%)'
    const originalAccent = 'hsl(142.1, 70.6%, 45.3%)'
    const originalPrimary = 'hsl(142.1, 70.6%, 35%)'
    const originalFont = 'var(--font-geist-mono), Courier New, Courier, monospace'

    // Configurar a transição na tag HTML para ficar extremamente fluida
    document.documentElement.style.setProperty(
      'transition',
      'color 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    )

    const sections = document.querySelectorAll('section[data-theme-color]')
    if (sections.length === 0) return

    const observerOptions = {
      root: null, // viewport
      rootMargin: '-25% 0px -40% 0px', // Gatilho otimizado no terço central da tela
      threshold: 0.1
    }

    // Mapeamento enriquecido do Chameleon Engine
    const getThemeConfigByCategory = (categoryName: string) => {
      const upper = categoryName.toUpperCase()

      // 1. SEGURANÇA & CYBERSECURITY / TECH_HACKER (Brutalist Hacker)
      if (
        upper.includes('SEGURANÇA') ||
        upper.includes('SEC') ||
        upper.includes('HACK') ||
        upper.includes('DESENVOLVIMENTO') ||
        upper.includes('CODING')
      ) {
        return {
          bg: 'hsl(240, 10%, 2%)',
          accent: 'hsl(142.1, 70.6%, 45.3%)', // Verde terminal
          primary: 'hsl(346.8, 77.2%, 49.8%)', // Vermelho alarmante
          font: 'var(--font-geist-mono), Courier New, Courier, monospace',
          effects: ['scanlines', 'terminal_glow', 'glitch']
        }
      }

      // 2. IA / INTELIGÊNCIA ARTIFICIAL (Futurista Neural)
      if (upper.includes('IA') || upper.includes('INTELIGÊNCIA') || upper.includes('AI')) {
        return {
          bg: 'hsl(224, 25%, 5%)', // Deep Indigo
          accent: 'hsl(244.5, 97.3%, 80.8%)', // Lavanda brilhante
          primary: 'hsl(180, 70%, 50%)', // Ciano digital
          font: 'var(--font-geist-mono), Courier New, Courier, monospace',
          effects: ['glow', 'grainy_texture']
        }
      }

      // 3. ARTE DIGITAL / SYNTH / ELETRÔNICA (Neon Cyberpunk)
      if (
        upper.includes('SYNTH') ||
        upper.includes('ELETRONICA') ||
        upper.includes('TECHNO') ||
        upper.includes('ARTE')
      ) {
        return {
          bg: 'hsl(295, 20%, 4%)', // Roxo profundo
          accent: 'hsl(315, 90%, 65%)', // Pink neon
          primary: 'hsl(275, 80%, 55%)', // Lavanda vibrante
          font: 'Georgia, Times New Roman, Times, serif',
          effects: ['glow', 'neural_particles']
        }
      }

      // 4. BIG TECH & MERCADO (Corporate Slate)
      if (upper.includes('BIG TECH') || upper.includes('MERCADO') || upper.includes('NEGÓCIOS')) {
        return {
          bg: 'hsl(210, 15%, 4%)', // Dark Slate Blue
          accent: 'hsl(200, 85%, 55%)', // Azul futurista
          primary: 'hsl(200, 85%, 45%)',
          font: 'var(--font-geist-sans), Inter, Roboto, sans-serif',
          effects: ['glow']
        }
      }

      // 5. CULTURA URBANA / HIP-HOP / GEARHEAD (Industrial Raw)
      if (
        upper.includes('GEARHEAD') ||
        upper.includes('URBANA') ||
        upper.includes('HIP') ||
        upper.includes('RAP') ||
        upper.includes('HIP_HOP')
      ) {
        return {
          bg: 'hsl(12, 10%, 3%)', // Asfalto escuro
          accent: 'hsl(45, 93%, 47%)', // Amarelo industrial
          primary: 'hsl(25, 90%, 50%)', // Laranja queimado
          font: 'var(--font-geist-sans), Inter, Roboto, sans-serif',
          effects: ['street_glitch', 'grainy_texture']
        }
      }

      // 6. ROCK & INDIE (Xerox / Grunge Red)
      if (upper.includes('ROCK') || upper.includes('INDIE')) {
        return {
          bg: 'hsl(0, 10%, 2%)', // Preto asfalto escuro
          accent: 'hsl(0, 72%, 51%)', // Xerox Red
          primary: 'hsl(0, 72%, 40%)',
          font: 'var(--font-geist-mono), Courier New, Courier, monospace',
          effects: ['paper_texture', 'grainy_texture']
        }
      }

      // 7. CULTURA GERAL MÚSICA (Magazine Orange)
      if (upper.includes('CULTURA') || upper.includes('BRASIL') || upper.includes('BR')) {
        return {
          bg: 'hsl(24, 15%, 3%)', // Laranja/marrom profundo
          accent: 'hsl(24, 95%, 53%)', // Laranja
          primary: 'hsl(24, 95%, 43%)',
          font: 'Georgia, Times New Roman, Times, serif',
          effects: ['glow']
        }
      }

      // Tema Default
      return {
        bg: originalBg,
        accent: originalAccent,
        primary: originalPrimary,
        font: originalFont,
        effects: ['glow']
      }
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryName = entry.target.getAttribute('data-category-name') || ''
          const theme = getThemeConfigByCategory(categoryName)
          const root = document.documentElement

          // Transmutar dinamicamente as variáveis de design no root do documento
          root.style.setProperty('--theme-bg', theme.bg)
          root.style.setProperty('--theme-accent', theme.accent)
          root.style.setProperty('--theme-primary', theme.primary)
          root.style.setProperty('--theme-font', theme.font)
          root.style.setProperty('--primary', hexToHsl(entry.target.getAttribute('data-theme-color') || '#8b5cf6'))

          // Atualizar classes de efeitos no root do documento de forma limpa
          const currentEffects = Array.from(root.classList).filter(cls => cls.startsWith('effect-'))
          currentEffects.forEach(cls => root.classList.remove(cls))
          
          theme.effects.forEach((effect) => {
            root.classList.add(`effect-${effect}`)
          })

          console.log(`[CAMALEAO-ENGINE] Transmutação ativa para: ${categoryName}`, {
            bg: theme.bg,
            accent: theme.accent,
            font: theme.font,
            effects: theme.effects
          })
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    sections.forEach((section) => observer.observe(section))

    // Cleanup ao desmontar
    return () => {
      observer.disconnect()
      const root = document.documentElement
      root.style.setProperty('--theme-bg', originalBg)
      root.style.setProperty('--theme-accent', originalAccent)
      root.style.setProperty('--theme-primary', originalPrimary)
      root.style.setProperty('--theme-font', originalFont)
      root.style.setProperty('--primary', originalPrimary)
      
      const currentEffects = Array.from(root.classList).filter(cls => cls.startsWith('effect-'))
      currentEffects.forEach(cls => root.classList.remove(cls))
    }
  }, [])

  return null
}
