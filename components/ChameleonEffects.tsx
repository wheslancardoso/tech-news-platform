'use client'

interface ChameleonEffectsProps {
  effects: string[]
}

export function ChameleonEffects({ effects }: ChameleonEffectsProps) {
  if (!effects || effects.length === 0) return null;

  return (
    <>
      {/* Background & Overlay Effects */}
      {effects.includes('glow') && (
        <div className="pointer-events-none fixed top-0 left-0 w-full h-[500px] z-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--theme-primary)_0%,transparent_70%)] opacity-15" />
      )}
      {(effects.includes('glitch') || effects.includes('glitch_effect')) && (
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay bg-scanlines animate-chameleon-glitch" />
      )}
      {effects.includes('neural_particles') && (
        <div className="pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
      )}
      {effects.includes('terminal_glow') && (
        <div className="pointer-events-none fixed inset-0 z-40 shadow-[inset_0_0_120px_var(--theme-primary)] opacity-40 mix-blend-screen" />
      )}
      {effects.includes('glassmorphism') && (
        <div className="pointer-events-none fixed inset-0 z-30 backdrop-blur-[1px] bg-white/5" />
      )}
      {effects.includes('pulsing_borders') && (
        <div className="pointer-events-none fixed inset-0 z-50 border-[4px] border-chameleon-primary opacity-60 animate-pulse" />
      )}
      {effects.includes('scanlines') && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-scanlines opacity-10" />
      )}
      {effects.includes('grainy_texture') && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-grainy opacity-[0.05] mix-blend-multiply" />
      )}
      {effects.includes('cloud_compute_grid') && (
        <div className="pointer-events-none fixed inset-0 z-0 bg-compute-grid opacity-[0.03]" />
      )}
      
      {/* Scanline Animation */}
      {effects.includes('scanlines') && (
        <div className="pointer-events-none fixed top-0 left-0 w-full h-2 bg-chameleon-primary/20 z-50 blur-sm" style={{ animation: 'scanline 8s linear infinite' }} />
      )}
    </>
  )
}
