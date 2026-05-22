import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { useTheme, ThemeConfig } from '../lib/hooks/useTheme'
import React from 'react'

// Componente fictício para usar o hook no ciclo de vida do React
function TestComponent({ theme }: { theme: ThemeConfig | null | undefined }) {
  useTheme(theme)
  return <div data-testid="theme-test">Test Component</div>
}

describe('useTheme Hook', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.documentElement
    // Limpar as propriedades customizadas do root antes de cada teste
    root.style.removeProperty('--theme-bg')
    root.style.removeProperty('--theme-accent')
    root.style.removeProperty('--theme-primary')
    root.style.removeProperty('--theme-font')
    
    // Remover quaisquer classes de efeito residuais
    Array.from(root.classList).forEach(cls => {
      if (cls.startsWith('effect-')) {
        root.classList.remove(cls)
      }
    })
  })

  it('deve injetar valores padrão quando nenhum tema for provido', () => {
    render(<TestComponent theme={null} />)

    expect(root.style.getPropertyValue('--theme-bg')).toBe('hsl(240, 10%, 3.9%)')
    expect(root.style.getPropertyValue('--theme-accent')).toBe('hsl(142.1, 70.6%, 45.3%)')
    expect(root.style.getPropertyValue('--theme-primary')).toBe('hsl(142.1, 70.6%, 35%)')
    expect(root.style.getPropertyValue('--theme-font')).toContain('Courier New')
  })

  it('deve injetar tokens customizados quando um tema for provido', () => {
    const customTheme: ThemeConfig = {
      tokens: {
        bg: 'hsl(12, 10%, 3%)',
        accent: 'hsl(45, 93%, 47%)',
        primary: 'hsl(25, 90%, 50%)'
      },
      typography: 'Sans',
      effects: ['street_glitch', 'grainy_texture']
    }

    render(<TestComponent theme={customTheme} />)

    expect(root.style.getPropertyValue('--theme-bg')).toBe('hsl(12, 10%, 3%)')
    expect(root.style.getPropertyValue('--theme-accent')).toBe('hsl(45, 93%, 47%)')
    expect(root.style.getPropertyValue('--theme-primary')).toBe('hsl(25, 90%, 50%)')
    expect(root.style.getPropertyValue('--theme-font')).toContain('Inter')
    expect(root.classList.contains('effect-street_glitch')).toBe(true)
    expect(root.classList.contains('effect-grainy_texture')).toBe(true)
  })

  it('deve limpar as propriedades injetadas e classes de efeito ao desmontar', () => {
    const customTheme: ThemeConfig = {
      tokens: {
        bg: 'hsl(295, 20%, 4%)',
        accent: 'hsl(315, 90%, 65%)',
        primary: 'hsl(275, 80%, 55%)'
      },
      typography: 'Serif',
      effects: ['glow']
    }

    const { unmount } = render(<TestComponent theme={customTheme} />)

    // Valores injetados com sucesso
    expect(root.style.getPropertyValue('--theme-bg')).toBe('hsl(295, 20%, 4%)')
    expect(root.classList.contains('effect-glow')).toBe(true)

    // Desmontar o componente
    unmount()

    // Valores devem ser devidamente removidos ou restaurados na desmontagem
    expect(root.style.getPropertyValue('--theme-bg')).toBe('')
    expect(root.classList.contains('effect-glow')).toBe(false)
  })
})
