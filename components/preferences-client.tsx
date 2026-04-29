'use client'

import { useState, useEffect } from 'react'
import { useChameleon } from '@/components/chameleon-provider'
import { getAllThemes, getThemeConfig, type ThemeConfig } from '@/lib/chameleon-theme'
import { ArrowRight, Check, Monitor, Eye, Waves } from 'lucide-react'

const NOISE_KEY = 'fn-noise-enabled'
const SCANLINE_KEY = 'fn-scanline-intensity'

export function PreferencesClient() {
  const { activeCategory, preferredCategory, setTheme } = useChameleon()
  const allThemes = getAllThemes()

  // Appearance
  const [noiseEnabled, setNoiseEnabled] = useState(true)
  const [scanlineIntensity, setScanlineIntensity] = useState(50)

  // Load from localStorage
  useEffect(() => {
    try {
      const noise = localStorage.getItem(NOISE_KEY)
      if (noise !== null) setNoiseEnabled(noise === 'true')

      const scanline = localStorage.getItem(SCANLINE_KEY)
      if (scanline !== null) setScanlineIntensity(Number(scanline))
    } catch {
      // localStorage unavailable
    }
  }, [])

  // Apply noise toggle
  useEffect(() => {
    const body = document.body
    if (noiseEnabled) {
      body.classList.add('noise-overlay')
    } else {
      body.classList.remove('noise-overlay')
    }
    try { localStorage.setItem(NOISE_KEY, String(noiseEnabled)) } catch {}
  }, [noiseEnabled])

  // Apply scanline intensity
  useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', `${scanlineIntensity / 100}`)
    try { localStorage.setItem(SCANLINE_KEY, String(scanlineIntensity)) } catch {}
  }, [scanlineIntensity])

  const currentTheme = getThemeConfig(activeCategory)

  return (
    <div className="space-y-12">
      {/* ═══ SECTION 1: CATEGORIA FAVORITA ═══ */}
      <section>
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase block mb-2" style={{ color: currentTheme.accent }}>
            // IDENTIDADE VISUAL
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-[-0.03em] text-foreground uppercase">
            Categoria Favorita
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-light">
            Escolha uma categoria e o Fresh News adapta toda a sua identidade visual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[2px] bg-border">
          {allThemes.map(({ key, config }) => {
            const isSelected = preferredCategory === key

            return (
              <button
                key={key}
                onClick={() => setTheme(key, true)}
                className={`bg-card p-6 text-left transition-all group relative overflow-hidden ${
                  isSelected ? 'ring-2' : 'hover:bg-card/80'
                }`}
                style={isSelected ? {
                  borderLeft: `4px solid ${config.accent}`,
                  boxShadow: `inset 0 0 40px ${config.accent}08, ${config.cardGlow}`,
                  outline: `2px solid ${config.accent}`,
                  outlineOffset: '-2px',
                } : {
                  borderLeft: '4px solid transparent',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${config.accent}08 0%, transparent 60%)`,
                  }}
                />

                {/* Selected check */}
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center"
                    style={{ background: config.accent }}
                  >
                    <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                  </div>
                )}

                {/* Icon + Badge */}
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                    style={{
                      color: config.accent,
                      border: `1px solid ${config.accent}30`,
                      background: `${config.accent}10`,
                    }}
                  >
                    {config.icon} {config.badgeLabel}
                  </span>
                </div>

                {/* Name */}
                <h3
                  className="font-black text-base uppercase tracking-tight mb-1 transition-colors relative z-10"
                  style={{ color: isSelected ? config.accent : undefined }}
                >
                  {config.nicheLabel}
                </h3>

                {/* Tagline */}
                <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest uppercase relative z-10">
                  {config.tagline}
                </p>

                {/* Mini preview bar */}
                <div className="mt-4 flex gap-1 relative z-10">
                  <div className="h-1 flex-grow" style={{ background: config.accent }} />
                  <div className="h-1 w-8" style={{ background: config.accentAlt }} />
                  <div className="h-1 w-4" style={{ background: `${config.accent}40` }} />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══ SECTION 2: APARÊNCIA ═══ */}
      <section>
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase block mb-2" style={{ color: currentTheme.accent }}>
            // CONFIGURAÇÕES VISUAIS
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-[-0.03em] text-foreground uppercase">
            Aparência
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-border">
          {/* Dark mode (locked) */}
          <div className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-border flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground uppercase tracking-tight">Tema Escuro</p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">LOCKED — IDENTIDADE CORE</p>
                </div>
              </div>
              <div className="w-10 h-5 bg-[hsl(var(--primary))] flex items-center justify-end px-0.5">
                <div className="w-4 h-4 bg-black" />
              </div>
            </div>
          </div>

          {/* Noise toggle */}
          <div className="bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-border flex items-center justify-center">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground uppercase tracking-tight">Noise Overlay</p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">TEXTURA GRANULADA SUTIL</p>
                </div>
              </div>
              <button
                onClick={() => setNoiseEnabled(!noiseEnabled)}
                className={`w-10 h-5 flex items-center px-0.5 transition-colors ${
                  noiseEnabled ? 'bg-[hsl(var(--primary))] justify-end' : 'bg-muted justify-start'
                }`}
              >
                <div className={`w-4 h-4 ${noiseEnabled ? 'bg-black' : 'bg-muted-foreground'}`} />
              </button>
            </div>
          </div>

          {/* Scanline intensity */}
          <div className="bg-card p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-border flex items-center justify-center">
                <Waves className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground uppercase tracking-tight">Scanline Effect</p>
                <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">
                  INTENSIDADE: {scanlineIntensity}%
                </p>
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={scanlineIntensity}
                onChange={(e) => setScanlineIntensity(Number(e.target.value))}
                className="w-full h-1 bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[hsl(var(--primary))]"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[9px] font-mono text-muted-foreground/30 tracking-widest">OFF</span>
                <span className="text-[9px] font-mono text-muted-foreground/30 tracking-widest">MÁXIMO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: LIVE PREVIEW ═══ */}
      <section>
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase block mb-2" style={{ color: currentTheme.accent }}>
            // PREVIEW AO VIVO
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-[-0.03em] text-foreground uppercase">
            Resultado
          </h2>
        </div>

        <div className="bg-card border border-border overflow-hidden">
          {/* Preview card mimicking a newsletter */}
          <div
            className="p-6 relative"
            style={{ borderLeft: `3px solid ${currentTheme.accent}` }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.accent}06 0%, transparent 50%)`,
                boxShadow: currentTheme.cardGlow,
              }}
            />

            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 uppercase"
                style={{
                  color: currentTheme.accent,
                  border: `1px solid ${currentTheme.accent}30`,
                  background: `${currentTheme.accent}10`,
                }}
              >
                {currentTheme.icon} {currentTheme.badgeLabel}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                22.04.26
              </span>
            </div>

            <h3 className="text-lg font-black leading-tight tracking-[-0.02em] mb-2 text-foreground relative z-10">
              Exemplo de newsletter no tema {currentTheme.nicheLabel}
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
              É assim que os cards e links aparecerão com a identidade visual que você escolheu. A cor de destaque permeia toda a interface.
            </p>

            <div className="mt-4 relative z-10">
              <span
                className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1"
                style={{ color: currentTheme.accent }}
              >
                Ler edição
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Bottom accent bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${currentTheme.accent}, ${currentTheme.accentAlt})` }}
            />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: NOTIFICATIONS (future) ═══ */}
      <section className="opacity-50 pointer-events-none">
        <div className="mb-6">
          <span className="text-[10px] font-mono tracking-widest uppercase block mb-2 text-muted-foreground/30">
            // EM BREVE
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-[-0.03em] text-foreground/50 uppercase">
            Notificações
          </h2>
          <p className="text-sm text-muted-foreground/30 mt-1 font-light">
            Em breve: configure frequência de envio e categorias por email.
          </p>
        </div>

        <div className="bg-card border border-dashed border-border p-8 text-center">
          <p className="text-[10px] font-mono text-muted-foreground/30 tracking-widest uppercase">
            // FEATURE EM DESENVOLVIMENTO
          </p>
        </div>
      </section>
    </div>
  )
}
