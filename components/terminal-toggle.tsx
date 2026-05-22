'use client'

import { useEffect, useState } from 'react'
import { Terminal } from 'lucide-react'

export function TerminalToggle() {
    const [isCrt, setIsCrt] = useState(false)

    useEffect(() => {
        // Verifica se a preferência está salva no localStorage ou se o HTML já tem a classe
        const savedCrt = localStorage.getItem('hacker-mode-theme') === 'true'
        const hasClass = document.documentElement.classList.contains('theme-crt')
        
        if (savedCrt || hasClass) {
            document.documentElement.classList.add('theme-crt')
            setIsCrt(true)
        }
    }, [])

    const toggleCrt = () => {
        const nextState = !isCrt
        setIsCrt(nextState)
        
        if (nextState) {
            document.documentElement.classList.add('theme-crt')
            localStorage.setItem('hacker-mode-theme', 'true')
        } else {
            document.documentElement.classList.remove('theme-crt')
            localStorage.setItem('hacker-mode-theme', 'false')
        }
    }

    return (
        <button
            onClick={toggleCrt}
            title={isCrt ? 'Voltar para Modo Premium' : 'Ativar Modo Hacker (CLI)'}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 relative group
                ${isCrt 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'glass-card border-white/5 text-muted-foreground/60 hover:text-primary hover:border-primary/20 hover:bg-primary/5'
                }`}
            aria-label="Alternar Modo Hacker CRT"
        >
            <Terminal className={`w-4 h-4 transition-transform group-hover:scale-110 ${isCrt ? 'animate-pulse' : ''}`} />
            
            {/* Tooltip brutalista */}
            <span className="absolute -bottom-10 right-0 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-bold tracking-wider text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                {isCrt ? 'MODO: TERMINAL' : 'HACKER MODE'}
            </span>
        </button>
    )
}
