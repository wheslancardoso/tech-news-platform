'use client';

import { useEffect } from 'react';

export interface ThemeTokens {
  bg?: string;
  accent?: string;
  primary?: string;
}

export interface ThemeConfig {
  icon?: string;
  tokens?: ThemeTokens;
  effects?: string[];
  typography?: 'Mono' | 'Sans' | 'Serif';
}

// Fallbacks padrões e Brutalistas
const DEFAULT_THEME: ThemeConfig = {
  tokens: {
    bg: 'hsl(240, 10%, 3.9%)', // Preto absoluto brutalista
    accent: 'hsl(142.1, 70.6%, 45.3%)', // Verde hacker padrão
    primary: 'hsl(142.1, 70.6%, 35%)',
  },
  typography: 'Mono',
  effects: [],
};

const FONT_MAP = {
  Mono: 'var(--font-geist-mono), Courier New, Courier, monospace',
  Sans: 'var(--font-geist-sans), Inter, Roboto, sans-serif',
  Serif: 'Georgia, Times New Roman, Times, serif',
};

export function useTheme(themeConfig?: ThemeConfig | null) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config = themeConfig || DEFAULT_THEME;
    const tokens = config.tokens || DEFAULT_THEME.tokens!;
    const typography = config.typography || 'Mono';

    const root = document.documentElement;

    // 1. Armazenar valores originais para restauração posterior (cleanup)
    const originalBg = root.style.getPropertyValue('--theme-bg');
    const originalAccent = root.style.getPropertyValue('--theme-accent');
    const originalPrimary = root.style.getPropertyValue('--theme-primary');
    const originalFont = root.style.getPropertyValue('--theme-font');

    // 2. Injetar novos tokens nas variáveis CSS globais
    if (tokens.bg) {
      root.style.setProperty('--theme-bg', tokens.bg);
    }
    if (tokens.accent) {
      root.style.setProperty('--theme-accent', tokens.accent);
    }
    if (tokens.primary) {
      root.style.setProperty('--theme-primary', tokens.primary);
    }

    // Mapear tipografia
    const fontValue = FONT_MAP[typography] || FONT_MAP.Mono;
    root.style.setProperty('--theme-font', fontValue);

    // Adicionar classes utilitárias baseadas em efeitos para animações
    const effects = config.effects || [];
    effects.forEach((effect) => {
      root.classList.add(`effect-${effect}`);
    });

    // Cleanup: restaurar estado original ao desmontar componente
    return () => {
      if (originalBg) root.style.setProperty('--theme-bg', originalBg);
      else root.style.removeProperty('--theme-bg');

      if (originalAccent) root.style.setProperty('--theme-accent', originalAccent);
      else root.style.removeProperty('--theme-accent');

      if (originalPrimary) root.style.setProperty('--theme-primary', originalPrimary);
      else root.style.removeProperty('--theme-primary');

      if (originalFont) root.style.setProperty('--theme-font', originalFont);
      else root.style.removeProperty('--theme-font');

      effects.forEach((effect) => {
        root.classList.remove(`effect-${effect}`);
      });
    };
  }, [themeConfig]);
}
