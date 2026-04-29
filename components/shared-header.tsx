'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { handleLogout } from '@/actions/admin'
import { useChameleonSafe } from '@/components/chameleon-provider'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

interface SharedHeaderProps {
  isAdmin?: boolean
}

const NAV_ITEMS = [
  { href: '/', label: 'Feed' },
  { href: '/archive', label: 'Arquivo' },
  { href: '/preferences', label: 'Pref' },
  { href: '/about', label: 'Sobre' },
]

export function SharedHeader({ isAdmin = false }: SharedHeaderProps) {
  const pathname = usePathname()
  const { theme } = useChameleonSafe()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{ background: theme.accent }}
            >
              <span className="text-black font-black text-[10px] tracking-tighter">FN</span>
            </div>
            <span className="font-black text-lg tracking-[-0.06em] uppercase text-foreground">
              Fresh News
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={isActive(item.href) ? { color: theme.accent } : undefined}
              >
                {item.label}
                {isActive(item.href) && (
                  <div
                    className="h-[2px] mt-0.5 w-full"
                    style={{ background: theme.accent }}
                  />
                )}
              </Link>
            ))}

            {/* Admin badge */}
            {isAdmin && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[9px] font-mono text-yellow-400 tracking-widest uppercase border border-yellow-400/30 px-2 py-0.5 bg-yellow-400/10">
                  ADMIN
                </span>
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="text-[10px] px-2 py-1 border border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors uppercase tracking-wider"
                  >
                    SAIR
                  </button>
                </form>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/#subscribe"
              className="ml-4 px-4 py-1.5 text-black font-bold text-[11px] tracking-wider hover:opacity-90 transition-opacity"
              style={{ background: theme.accent }}
            >
              INSCREVER-SE
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${
                    isActive(item.href)
                      ? 'text-foreground bg-card'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  }`}
                  style={isActive(item.href) ? {
                    borderLeft: `3px solid ${theme.accent}`,
                    color: theme.accent,
                  } : { borderLeft: '3px solid transparent' }}
                >
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <div className="border-t border-border mt-2 pt-3 flex items-center justify-between px-4">
                  <span className="text-[9px] font-mono text-yellow-400 tracking-widest uppercase">
                    ADMIN MODE
                  </span>
                  <form action={handleLogout}>
                    <button
                      type="submit"
                      className="text-[10px] px-3 py-1 border border-red-400/30 text-red-400 uppercase tracking-wider"
                    >
                      SAIR
                    </button>
                  </form>
                </div>
              )}

              <Link
                href="/#subscribe"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 text-center text-black font-bold text-sm tracking-wider uppercase"
                style={{ background: theme.accent }}
              >
                INSCREVER-SE
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
