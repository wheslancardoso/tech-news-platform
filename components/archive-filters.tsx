'use client'

import { useState, useMemo, useCallback } from 'react'
import { NewsCard } from '@/components/news-card'
import { useChameleonSafe } from '@/components/chameleon-provider'
import { CATEGORY_KEYS, getThemeConfig } from '@/lib/chameleon-theme'
import { Search } from 'lucide-react'

interface Newsletter {
  id: string
  edition_number: number
  title: string
  created_at: string
  summary_intro?: string
  status?: 'draft' | 'published'
  category?: string
  theme_config?: Record<string, unknown>
  cover_url?: string
}

interface ArchiveFiltersProps {
  newsletters: Newsletter[]
  isAdmin: boolean
}

const ITEMS_PER_PAGE = 12

export function ArchiveFilters({ newsletters, isAdmin }: ArchiveFiltersProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const { theme } = useChameleonSafe()

  const filtered = useMemo(() => {
    let result = newsletters

    // Category filter
    if (activeCategory) {
      result = result.filter(n => {
        const cat = n.category?.toLowerCase() || 'tech'
        return cat === activeCategory || (activeCategory === 'seguranca' && cat === 'sec')
      })
    }

    // Status filter (admin only)
    if (isAdmin && statusFilter !== 'all') {
      result = result.filter(n => n.status === statusFilter)
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.summary_intro?.toLowerCase().includes(q) ||
        `#${n.edition_number}`.includes(q)
      )
    }

    return result
  }, [newsletters, activeCategory, statusFilter, search, isAdmin])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE)
  }, [])

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    newsletters.forEach(n => {
      const cat = n.category?.toLowerCase() || 'tech'
      stats[cat] = (stats[cat] || 0) + 1
    })
    return stats
  }, [newsletters])

  const mainCategories = ['tech', 'ia', 'seguranca', 'dev', 'music', 'gearhead', 'eletronica']

  return (
    <div>
      {/* ═══ SEARCH BAR ═══ */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-mono text-muted-foreground/50">&gt;</span>
          <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
        <input
          type="text"
          placeholder="buscar edição, título, tema..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
          className="w-full h-12 bg-card border-2 border-border pl-12 pr-4 text-sm text-foreground font-mono placeholder:text-muted-foreground/30 focus:outline-none focus:border-[var(--chameleon-accent)] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-wider"
          >
            LIMPAR
          </button>
        )}
      </div>

      {/* ═══ CATEGORY CHIPS ═══ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* All chip */}
        <button
          onClick={() => { setActiveCategory(null); setVisibleCount(ITEMS_PER_PAGE); }}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border-2 transition-all ${
            !activeCategory
              ? 'text-black border-transparent chip-active'
              : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
          }`}
          style={!activeCategory ? {
            background: theme.accent,
            borderColor: theme.accent,
            boxShadow: `0 0 12px ${theme.accent}30`,
          } : undefined}
        >
          [ALL] {newsletters.length}
        </button>

        {mainCategories.map(cat => {
          const catTheme = getThemeConfig(cat)
          const count = categoryStats[cat] || 0
          if (count === 0 && cat !== 'tech') return null

          const isActive = activeCategory === cat

          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(isActive ? null : cat); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase border-2 transition-all ${
                isActive
                  ? 'text-black border-transparent'
                  : 'text-muted-foreground border-border hover:border-current'
              }`}
              style={isActive ? {
                background: catTheme.accent,
                borderColor: catTheme.accent,
                color: '#000',
                boxShadow: `0 0 12px ${catTheme.accent}30`,
              } : {
                color: `${catTheme.accent}80`,
                borderColor: `${catTheme.accent}20`,
              }}
            >
              {catTheme.badgeLabel} {count > 0 && count}
            </button>
          )
        })}
      </div>

      {/* ═══ ADMIN STATUS FILTER ═══ */}
      {isAdmin && (
        <div className="flex items-center gap-3 mb-6 border-t border-dashed border-border pt-4">
          <span className="text-[9px] font-mono text-yellow-400/60 tracking-widest uppercase">STATUS:</span>
          {(['all', 'published', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border transition-colors ${
                statusFilter === s
                  ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'
                  : 'text-muted-foreground/50 border-border hover:text-muted-foreground'
              }`}
            >
              {s === 'all' ? 'TODOS' : s.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ═══ RESULTS COUNT ═══ */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-mono text-muted-foreground/50 tracking-widest">
          {filtered.length} RESULTADO{filtered.length !== 1 ? 'S' : ''}
          {search && ` PARA "${search.toUpperCase()}"`}
        </p>
      </div>

      {/* ═══ GRID ═══ */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border bg-card">
          <p className="text-muted-foreground font-mono text-sm">// SEM RESULTADOS</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {search
              ? `Nenhuma edição encontrada para "${search}".`
              : 'Nenhuma edição encontrada para esta categoria.'}
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory(null); }}
            className="mt-4 text-[10px] font-mono uppercase tracking-wider px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            LIMPAR FILTROS
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-border">
            {visible.map((news, index) => {
              const demoCategories = ['tech', 'ia', 'seguranca', 'dev', 'gearhead', 'eletronica']
              return (
                <NewsCard
                  key={news.id}
                  id={news.id}
                  edition={news.edition_number}
                  title={news.title}
                  date={news.created_at}
                  intro={news.summary_intro}
                  status={news.status}
                  isAdmin={isAdmin}
                  category={news.category || demoCategories[index % demoCategories.length]}
                  themeConfig={news.theme_config as Record<string, unknown> | undefined}
                  coverUrl={news.cover_url}
                />
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 text-[11px] font-bold uppercase tracking-widest border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
              >
                CARREGAR MAIS ({filtered.length - visibleCount} RESTANTES)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
