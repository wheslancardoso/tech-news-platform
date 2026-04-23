'use client'

interface ChameleonEffectsProps {
  effects: string[]
}

export function ChameleonEffects({ effects }: ChameleonEffectsProps) {
  if (!effects || effects.length === 0) return null;

  return (
    <>
      {effects.includes('glitch') && (
        <div className="pointer-events-none fixed inset-0 z-50 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      )}
      {effects.includes('scanlines') && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px]" />
      )}
      {effects.includes('alert_borders') && (
        <div className="pointer-events-none fixed inset-0 z-50 border-[8px] border-chameleon-primary opacity-60" />
      )}
      {effects.includes('glow') && (
        <div className="pointer-events-none fixed top-0 left-0 w-full h-[500px] z-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--theme-primary)_0%,transparent_70%)] opacity-15" />
      )}
    </>
  )
}
