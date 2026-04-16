export type NicheCategory = 'tech' | 'seguranca' | 'ia' | 'dev' | 'gearhead' | 'eletronica' | 'hiphop' | 'indie' | 'mpb' | string;

export interface ThemeConfig {
  accent: string;
  badgeLabel: string;
  badgeStyle: string;
  borderStyle: string;
  titleStyle?: string;
}

export const getThemeConfig = (category?: NicheCategory, customConfig?: ThemeConfig): ThemeConfig => {
  if (customConfig && Object.keys(customConfig).length > 0) {
    return customConfig;
  }

  const normalized = category?.toLowerCase();

  switch (normalized) {
    case 'seguranca':
    case 'sec':
      return {
        accent: '#FF0000',
        badgeLabel: '[SEC]',
        badgeStyle: 'text-[#FF0000] border-l-2 border-[#FF0000] font-mono tracking-widest',
        borderStyle: 'border-l-[4px] border-l-[#FF0000]',
      };
    case 'ia':
    case 'ai':
      return {
        accent: '#00F0FF',
        badgeLabel: '[IA]',
        badgeStyle: 'text-black bg-[#00F0FF] font-bold shadow-[0_0_8px_rgba(0,240,255,0.6)] px-1',
        borderStyle: 'border-l-[4px] border-l-[#00F0FF]',
      };
    case 'dev':
      return {
        accent: '#00FF41',
        badgeLabel: '[DEV]',
        badgeStyle: 'text-[#00FF41] bg-[#051005] font-mono border border-[#00FF41]/30',
        borderStyle: 'border-l-[4px] border-l-[#00FF41]',
      };
    case 'gearhead':
    case 'auto':
      return {
        accent: '#E10600',
        badgeLabel: '[GEAR]',
        badgeStyle: 'text-[#E10600] font-black italic tracking-tighter',
        borderStyle: 'border-l-[4px] border-l-[#E10600]',
        titleStyle: 'italic',
      };
    // Music extensions
    case 'eletronica':
      return {
        accent: '#E040FB',
        badgeLabel: '[ELETRÔNICA]',
        badgeStyle: 'text-[#E040FB] font-bold tracking-widest',
        borderStyle: 'border-l-[4px] border-l-[#E040FB]',
      };
    case 'tech':
    default:
      // Padrão Digital Broadsheet
      return {
        accent: '#FFFFFF',
        badgeLabel: '[TECH]',
        badgeStyle: 'text-white bg-transparent border border-white/20',
        borderStyle: 'border-l-[4px] border-l-white/20',
      };
  }
}
