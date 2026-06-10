'use client'

import React, { useTransition } from 'react'
import { setActiveWorld } from '@/actions/world'
import { cn } from '@/lib/utils'

interface WorldSelectorProps {
  activeWorld: string
}

export function WorldSelector({ activeWorld }: WorldSelectorProps) {
  const [isPending, startTransition] = useTransition()

  const worlds = [
    {
      id: 'TECH',
      label: 'TECH',
      sub: 'CÓDIGO & IA',
      colorClass: 'bg-green-500 text-black border-black dark:border-white',
      activeColor: '#22c55e',
    },
    {
      id: 'MUSIC',
      label: 'MUSIC',
      sub: 'BEATS & NOISE',
      colorClass: 'bg-yellow-500 text-black border-black dark:border-white',
      activeColor: '#eab308',
    },
    {
      id: 'GEAR',
      label: 'GEAR',
      sub: 'RPM & GADGETS',
      colorClass: 'bg-amber-500 text-black border-black dark:border-white',
      activeColor: '#f59e0b',
    },
    {
      id: 'GAME',
      label: 'GAME',
      sub: 'ARCADE & PIXEL',
      colorClass: 'bg-purple-600 text-white border-black dark:border-white',
      activeColor: '#a855f7',
    },
  ]

  const handleSelect = (worldId: string) => {
    if (worldId === activeWorld || isPending) return

    startTransition(async () => {
      try {
        await setActiveWorld(worldId)
      } catch (err) {
        console.error('Falha ao alternar mundo do multiverso:', err)
      }
    })
  }

  return (
    <div className={cn(
      "flex flex-row items-stretch gap-1.5 p-1 bg-black/10 dark:bg-white/5 border border-black/20 dark:border-white/10 rounded-none",
      isPending && "opacity-70 pointer-events-none"
    )}>
      {worlds.map((w) => {
        const isActive = w.id === activeWorld
        return (
          <button
            key={w.id}
            onClick={() => handleSelect(w.id)}
            disabled={isPending}
            className={cn(
              "px-3.5 py-1.5 text-left flex flex-col justify-center rounded-none border-2 border-black dark:border-white font-mono transition-all relative select-none cursor-pointer",
              isActive 
                ? cn("translate-x-[2px] translate-y-[2px] shadow-none", w.colorClass) 
                : "bg-transparent text-muted-foreground hover:text-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]"
            )}
          >
            {/* Indicador de Transmissão / LED brutalista */}
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-1.5 h-1.5 rounded-none inline-block",
                isActive 
                  ? "bg-current animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                  : "bg-muted-foreground/30"
              )} />
              <span className="text-[10px] font-black tracking-widest">{w.label}</span>
            </div>
            <span className="text-[7px] block opacity-60 mt-0.5 tracking-tight font-sans">
              {w.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}
