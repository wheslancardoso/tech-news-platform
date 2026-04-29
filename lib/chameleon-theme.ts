export type NicheCategory = 'tech' | 'seguranca' | 'sec' | 'ia' | 'ai' | 'dev' | 'music' | 'gearhead' | 'eletronica' | string;

export interface ThemeConfig {
  // Identity
  accent: string;
  accentAlt: string;
  accentHSL: string; // HSL values without hsl() wrapper, e.g. "186 100% 50%"
  badgeLabel: string;
  nicheLabel: string;
  icon: string;

  // Card Mutation
  borderStyle: string;
  badgeStyle: string;
  cardGlow: string;
  titleStyle?: string;

  // Reader Page Mutation
  headerGradient: string;
  ctaStyle: string;
  proseAccent: string;
  tagline: string;
}

// ─── THEME REGISTRY ───────────────────────────────────

const THEMES: Record<string, ThemeConfig> = {
  // ═══ DEFAULT: TECH ═══
  // Clean, neutral broadsheet
  tech: {
    accent: '#FFFFFF',
    accentAlt: '#888888',
    accentHSL: '0 0% 100%',
    badgeLabel: '[TECH]',
    nicheLabel: 'TECNOLOGIA',
    icon: '◆',
    borderStyle: 'border-l-[3px] border-l-white/20',
    badgeStyle: 'text-white border border-white/20 bg-transparent',
    cardGlow: '0 0 20px rgba(255,255,255,0.05)',
    headerGradient: 'from-white/5 to-transparent',
    ctaStyle: 'bg-white text-black hover:bg-white/90',
    proseAccent: '#FFFFFF',
    tagline: '// TRANSMISSÃO',
  },

  // ═══ INTELIGÊNCIA ARTIFICIAL ═══
  // Futuristic, neural, synthetic cyan
  ia: {
    accent: '#00F0FF',
    accentAlt: '#0080FF',
    accentHSL: '186 100% 50%',
    badgeLabel: '[IA]',
    nicheLabel: 'INTELIGÊNCIA ARTIFICIAL',
    icon: '◎',
    borderStyle: 'border-l-[3px] border-l-[#00F0FF]',
    badgeStyle: 'text-black bg-[#00F0FF] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]',
    cardGlow: '0 0 30px rgba(0,240,255,0.12), 0 0 60px rgba(0,240,255,0.04)',
    headerGradient: 'from-[#00F0FF]/10 to-transparent',
    ctaStyle: 'bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90',
    proseAccent: '#00F0FF',
    tagline: '// REDE NEURAL',
  },

  // ═══ SEGURANÇA ═══
  // Alert mode, red ops, tactical
  seguranca: {
    accent: '#FF0033',
    accentAlt: '#FF6600',
    accentHSL: '348 100% 50%',
    badgeLabel: '[SEC]',
    nicheLabel: 'SEGURANÇA',
    icon: '⬡',
    borderStyle: 'border-l-[3px] border-l-[#FF0033]',
    badgeStyle: 'text-[#FF0033] border border-[#FF0033]/40 bg-[#FF0033]/10 font-mono tracking-widest',
    cardGlow: '0 0 30px rgba(255,0,51,0.12), 0 0 60px rgba(255,0,51,0.04)',
    headerGradient: 'from-[#FF0033]/10 to-transparent',
    ctaStyle: 'bg-[#FF0033] text-white hover:bg-[#FF0033]/90',
    proseAccent: '#FF0033',
    tagline: '// OPERAÇÃO SEGURA',
  },

  // ═══ DESENVOLVIMENTO ═══
  // Terminal green, hacker, code-native
  dev: {
    accent: '#00FF41',
    accentAlt: '#00CC33',
    accentHSL: '135 100% 50%',
    badgeLabel: '[DEV]',
    nicheLabel: 'DESENVOLVIMENTO',
    icon: '▶',
    borderStyle: 'border-l-[3px] border-l-[#00FF41]',
    badgeStyle: 'text-[#00FF41] bg-[#00FF41]/10 font-mono border border-[#00FF41]/30',
    cardGlow: '0 0 30px rgba(0,255,65,0.12), 0 0 60px rgba(0,255,65,0.04)',
    headerGradient: 'from-[#00FF41]/10 to-transparent',
    ctaStyle: 'bg-[#00FF41] text-black hover:bg-[#00FF41]/90',
    proseAccent: '#00FF41',
    tagline: '// BUILD COMPLETO',
  },

  // ═══ MUSIC ═══
  // Vinyl vibes, warm purple/magenta
  music: {
    accent: '#FF00FF',
    accentAlt: '#CC00FF',
    accentHSL: '300 100% 50%',
    badgeLabel: '[MIX]',
    nicheLabel: 'MUSIC & CULTURE',
    icon: '♫',
    borderStyle: 'border-l-[3px] border-l-[#FF00FF]',
    badgeStyle: 'text-[#FF00FF] bg-[#FF00FF]/10 font-mono border border-[#FF00FF]/30',
    cardGlow: '0 0 30px rgba(255,0,255,0.12), 0 0 60px rgba(255,0,255,0.04)',
    headerGradient: 'from-[#FF00FF]/10 to-transparent',
    ctaStyle: 'bg-[#FF00FF] text-black hover:bg-[#FF00FF]/90',
    proseAccent: '#FF00FF',
    tagline: '// FREQUÊNCIA ABERTA',
  },

  // ═══ GEARHEAD ═══
  // Hardware, gadgets, racing orange
  gearhead: {
    accent: '#FF6600',
    accentAlt: '#FF9933',
    accentHSL: '24 100% 50%',
    badgeLabel: '[HW]',
    nicheLabel: 'HARDWARE & GADGETS',
    icon: '⚙',
    borderStyle: 'border-l-[3px] border-l-[#FF6600]',
    badgeStyle: 'text-[#FF6600] bg-[#FF6600]/10 font-mono border border-[#FF6600]/30',
    cardGlow: '0 0 30px rgba(255,102,0,0.12), 0 0 60px rgba(255,102,0,0.04)',
    headerGradient: 'from-[#FF6600]/10 to-transparent',
    ctaStyle: 'bg-[#FF6600] text-black hover:bg-[#FF6600]/90',
    proseAccent: '#FF6600',
    tagline: '// OVERCLOCK',
  },

  // ═══ ELETRÔNICA ═══
  // Circuits, amber/gold
  eletronica: {
    accent: '#FFD700',
    accentAlt: '#FFA500',
    accentHSL: '51 100% 50%',
    badgeLabel: '[ELE]',
    nicheLabel: 'ELETRÔNICA',
    icon: '⚡',
    borderStyle: 'border-l-[3px] border-l-[#FFD700]',
    badgeStyle: 'text-[#FFD700] bg-[#FFD700]/10 font-mono border border-[#FFD700]/30',
    cardGlow: '0 0 30px rgba(255,215,0,0.12), 0 0 60px rgba(255,215,0,0.04)',
    headerGradient: 'from-[#FFD700]/10 to-transparent',
    ctaStyle: 'bg-[#FFD700] text-black hover:bg-[#FFD700]/90',
    proseAccent: '#FFD700',
    tagline: '// CIRCUITO ATIVO',
  },
};

// Aliases
THEMES['sec'] = THEMES['seguranca'];
THEMES['ai'] = THEMES['ia'];

// ─── PUBLIC API ────────────────────────────────────────

export function getThemeConfig(category?: string, customConfig?: Partial<ThemeConfig>): ThemeConfig {
  // If custom config has all required fields, use it directly
  if (customConfig && customConfig.accent && customConfig.badgeLabel) {
    return { ...THEMES['tech'], ...customConfig };
  }

  const normalized = category?.toLowerCase().trim() || 'tech';
  const baseTheme = THEMES[normalized] || THEMES['tech'];

  // Allow partial overrides from DB
  if (customConfig && Object.keys(customConfig).length > 0) {
    return { ...baseTheme, ...customConfig };
  }

  return baseTheme;
}

/**
 * Returns CSS custom properties that mutate the entire UI identity.
 * Inject these into document.documentElement.style for global theming.
 */
export function getThemeCSSVars(category?: string): Record<string, string> {
  const theme = getThemeConfig(category);

  return {
    '--primary': theme.accentHSL,
    '--primary-foreground': theme.accent === '#FFFFFF' ? '0 0% 5%' : '0 0% 5%',
    '--ring': theme.accentHSL,
    '--chart-1': theme.accentHSL,
    // Accent-tinted surfaces for interactive elements
    '--chameleon-accent': theme.accent,
    '--chameleon-accent-alt': theme.accentAlt,
    '--chameleon-glow': theme.cardGlow,
    '--chameleon-hsl': theme.accentHSL,
  };
}

/**
 * Returns the default (IA/Cyan) CSS vars — used as baseline.
 */
export function getDefaultCSSVars(): Record<string, string> {
  return getThemeCSSVars('ia');
}

// Utility: get accent color as CSS hsl-compatible value
export function getAccentCSS(category?: string): string {
  const theme = getThemeConfig(category);
  return theme.accent;
}

// Export all theme keys for reference (unique categories only)
export const CATEGORY_KEYS = Object.keys(THEMES).filter(k => !['sec', 'ai'].includes(k));

// Export theme registry for preferences UI
export function getAllThemes(): { key: string; config: ThemeConfig }[] {
  return CATEGORY_KEYS.map(key => ({ key, config: THEMES[key] }));
}
