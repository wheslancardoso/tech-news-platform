'use client'

import { useEffect } from 'react'
import { useChameleon } from '@/components/chameleon-provider'

/**
 * Hook-like component that triggers a Chameleon theme change 
 * when an article page mounts, and resets on unmount.
 */
export function ChameleonArticleTrigger({ category }: { category: string }) {
  const { setTheme, resetToPreferred } = useChameleon()

  useEffect(() => {
    // Temporarily set theme to article's category
    setTheme(category, false)

    // Reset to user's preferred theme when leaving
    return () => {
      resetToPreferred()
    }
  }, [category, setTheme, resetToPreferred])

  return null
}
