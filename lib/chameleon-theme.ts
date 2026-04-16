export type NicheCategory = 'tech' | 'seguranca' | 'sec' | 'ia' | 'ai' | 'dev' | string;

export interface ThemeConfig {
  // Identity
  accent: string;
  accentAlt: string;
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

// Utility: get accent color as CSS hsl-compatible value
export function getAccentCSS(category?: string): string {
  const theme = getThemeConfig(category);
  return theme.accent;
}

// Export all theme keys for reference
export const CATEGORY_KEYS = Object.keys(THEMES).filter(k => !['sec', 'ai'].includes(k));
