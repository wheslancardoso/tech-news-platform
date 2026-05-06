'use client'

interface ChameleonEffectsProps {
  effects: string[]
}

export function ChameleonEffects({ effects }: ChameleonEffectsProps) {
  if (!effects || effects.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Glow de Fundo Localizado */}
      {effects.includes('glow') && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-[600px] z-0 bg-[radial-gradient(circle_at_center,var(--theme-primary)_0%,transparent_70%)] opacity-20 blur-[100px]" />
      )}
      
      {/* Efeito de Glitch Localizado */}
      {(effects.includes('glitch') || effects.includes('glitch_effect')) && (
        <div className="absolute inset-0 z-10 opacity-[0.05] mix-blend-overlay bg-scanlines animate-chameleon-glitch" />
      )}
      
      {/* Partículas / Texturas Específicas */}
      {effects.includes('neural_particles') && (
        <div className="absolute inset-0 z-10 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
      )}
      
      {/* Brilho de Terminal (Retro-Future) */}
      {effects.includes('terminal_glow') && (
        <div className="absolute inset-0 z-20 shadow-[inset_0_0_150px_rgba(var(--theme-primary-rgb),0.3)] opacity-50 mix-blend-screen border-2 border-[var(--theme-primary)]/20" />
      )}
      
      {/* Scanlines Dinâmicas */}
      {effects.includes('scanlines') && (
        <div className="absolute inset-0 z-10 bg-scanlines opacity-20" />
      )}
      
      {/* Textura de Grão */}
      {effects.includes('grainy_texture') && (
        <div className="absolute inset-0 z-10 bg-grainy opacity-[0.08] mix-blend-multiply" />
      )}
      
      {/* Grade de Computação em Nuvem */}
      {effects.includes('cloud_compute_grid') && (
        <div className="absolute inset-0 z-0 bg-compute-grid opacity-[0.05]" />
      )}
      
      {/* Linha de Varredura (Scanline Beam) */}
      {effects.includes('scanlines') && (
        <div className="absolute top-0 left-0 w-full h-4 bg-[var(--theme-primary)]/10 z-30 blur-md" style={{ animation: 'scanline 4s linear infinite' }} />
      )}

      {/* Blur Overlay */}
      {effects.includes('blur_overlay') && (
        <div className="absolute inset-0 z-0 backdrop-blur-[2px] bg-black/10" />
      )}

      {/* Pulsing Borders */}
      {effects.includes('pulsing_borders') && (
        <div className="absolute inset-0 z-40 border-2 border-[var(--theme-primary)]/30 animate-pulse rounded-inherit" />
      )}

      {/* Terminal Cursor Effect */}
      {effects.includes('terminal_cursor') && (
        <div className="absolute bottom-4 right-4 z-50 animate-terminal-cursor text-[var(--theme-primary)] font-mono text-xs opacity-50" />
      )}

      {/* Glassmorphism Extra */}
      {effects.includes('glassmorphism') && (
        <div className="absolute inset-0 z-0 bg-white/[0.02] backdrop-blur-[10px] border border-white/10" />
      )}
    </div>
  )
}
