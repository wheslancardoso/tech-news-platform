'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getThemeCSSVars, getThemeConfig, type ThemeConfig } from '@/lib/chameleon-theme'

const STORAGE_KEY = 'fn-preferred-category'
const DEFAULT_CATEGORY = 'ia'

interface ChameleonContextType {
  /** Current active category key */
  activeCategory: string
  /** Current theme config object */
  theme: ThemeConfig
  /** Change the global theme. If `persist` is true, saves as user preference. */
  setTheme: (category: string, persist?: boolean) => void
  /** Reset to user's preferred theme (from localStorage) */
  resetToPreferred: () => void
  /** The user's persisted preferred category */
  preferredCategory: string
}

const ChameleonContext = createContext<ChameleonContextType | null>(null)

export function useChameleon(): ChameleonContextType {
  const ctx = useContext(ChameleonContext)
  if (!ctx) {
    throw new Error('useChameleon must be used within <ChameleonProvider>')
  }
  return ctx
}

/**
 * Safe version that returns defaults when used outside provider.
 * Useful for server components or optional theming.
 */
export function useChameleonSafe(): ChameleonContextType {
  const ctx = useContext(ChameleonContext)
  if (!ctx) {
    return {
      activeCategory: DEFAULT_CATEGORY,
      theme: getThemeConfig(DEFAULT_CATEGORY),
      setTheme: () => {},
      resetToPreferred: () => {},
      preferredCategory: DEFAULT_CATEGORY,
    }
  }
  return ctx
}

function applyThemeToDom(category: string) {
  if (typeof document === 'undefined') return

  const vars = getThemeCSSVars(category)
  const root = document.documentElement

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Also set a data attribute for CSS selectors
  root.setAttribute('data-chameleon', category)
}

interface ChameleonProviderProps {
  children: ReactNode
  /** Optional initial category override (e.g., from article page) */
  initialCategory?: string
}

export function ChameleonProvider({ children, initialCategory }: ChameleonProviderProps) {
  const [preferredCategory, setPreferredCategory] = useState(DEFAULT_CATEGORY)
  const [activeCategory, setActiveCategory] = useState(initialCategory || DEFAULT_CATEGORY)

  // Load preferred category from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPreferredCategory(stored)
        // Only apply stored preference if no initial override
        if (!initialCategory) {
          setActiveCategory(stored)
          applyThemeToDom(stored)
        }
      } else {
        applyThemeToDom(initialCategory || DEFAULT_CATEGORY)
      }
    } catch {
      applyThemeToDom(initialCategory || DEFAULT_CATEGORY)
    }
  }, [initialCategory])

  const setTheme = useCallback((category: string, persist = false) => {
    setActiveCategory(category)
    applyThemeToDom(category)

    if (persist) {
      setPreferredCategory(category)
      try {
        localStorage.setItem(STORAGE_KEY, category)
      } catch {
        // localStorage unavailable
      }
    }
  }, [])

  const resetToPreferred = useCallback(() => {
    setActiveCategory(preferredCategory)
    applyThemeToDom(preferredCategory)
  }, [preferredCategory])

  const theme = getThemeConfig(activeCategory)

  return (
    <ChameleonContext.Provider
      value={{
        activeCategory,
        theme,
        setTheme,
        resetToPreferred,
        preferredCategory,
      }}
    >
      {children}
    </ChameleonContext.Provider>
  )
}
