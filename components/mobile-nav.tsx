'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Archive, Settings, Info } from 'lucide-react'
import { useChameleonSafe } from '@/components/chameleon-provider'

const NAV_ITEMS = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/archive', label: 'Arquivo', icon: Archive },
  { href: '/preferences', label: 'Pref', icon: Settings },
  { href: '/about', label: 'Sobre', icon: Info },
]

export function MobileNav() {
  const pathname = usePathname()
  const { theme } = useChameleonSafe()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Don't show on admin pages
  if (pathname.startsWith('/backstage') || pathname.startsWith('/login')) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors relative ${
                active ? 'text-foreground' : 'text-muted-foreground'
              }`}
              style={active ? { color: theme.accent } : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px]"
                  style={{ background: theme.accent }}
                />
              )}
              <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[9px] font-bold tracking-wider uppercase">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iPhones */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  )
}
