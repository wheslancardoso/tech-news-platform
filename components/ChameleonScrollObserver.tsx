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
    // 1. Guardar a cor padrão original do primary
    const originalPrimary = '275 80% 55%' // #8B5CF6 (Premium Violet)
    
    // 2. Configurar a transição na tag HTML para ficar suave
    document.documentElement.style.setProperty('transition', 'color 1s ease, background-color 1s ease, border-color 1s ease, box-shadow 1s ease')

    const sections = document.querySelectorAll('section[data-theme-color]')
    
    if (sections.length === 0) return

    const observerOptions = {
      root: null, // viewport
      rootMargin: '-30% 0px -45% 0px', // Gatilho de foco no terço central da tela
      threshold: 0.1 // 10% da seção visível
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const hexColor = entry.target.getAttribute('data-theme-color')
          
          if (hexColor) {
            const hslColor = hexToHsl(hexColor)
            // Atualiza a variável primária do Tailwind
            document.documentElement.style.setProperty('--primary', hslColor)
            console.log(`[CAMALEAO-UI] Foco na seção: ${entry.target.getAttribute('data-category-name')}, cor alterada para: ${hslColor}`)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    
    sections.forEach((section) => observer.observe(section))

    // Cleanup ao desmontar
    return () => {
      observer.disconnect()
      document.documentElement.style.setProperty('--primary', originalPrimary)
    }
  }, [])

  return null
}
