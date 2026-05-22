'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Shield, Terminal, Cpu, Code2, Cloud } from 'lucide-react'

interface DebateMessage {
    persona: string
    role: string
    avatar: string
    color: string
    message: string
}

interface TerminalDebateProps {
    debate?: DebateMessage[]
}

// Fallback de debate técnico super denso e provocativo caso a edição antiga não tenha debate_log
const FALLBACK_DEBATE: DebateMessage[] = [
    {
        persona: "Neuralista-Chefe",
        role: "AI",
        avatar: "🤖",
        color: "#8B5CF6",
        message: "O novo modelo open-source com 405B de parâmetros e janela de 2M de tokens redefiniu a eficiência computacional. O fine-tuning via representações latentes permite que o modelo execute raciocínios multi-step complexos com 80% menos FLOPS no runtime."
    },
    {
        persona: "Red Team",
        role: "SEC",
        avatar: "🛡️",
        color: "#F43F5E",
        message: "Impressionante matematicamente, mas desastroso em termos de segurança prática. A ausência de encriptação homomórfica no pipeline de inferência local abre vetores de vazamento de memória do sistema através de side-channel attacks na VRAM. Hospedar isso localmente é uma mina terrestre de vulnerabilidade."
    },
    {
        persona: "Arquiteto Sênior",
        role: "DEV",
        avatar: "💻",
        color: "#10B981",
        message: "Concordo em partes, mas o verdadeiro gargalo está na ergonomia de desenvolvimento. O novo SDK em Rust mitigou completamente os estouros de buffer e reduziu a sobrecarga do garbage collector em 95%. A tipagem estática e concorrência nativa salvam os desenvolvedores da bagunça do Python legada."
    },
    {
        persona: "SRE/Cloud",
        role: "CLOUD",
        avatar: "☁️",
        color: "#06B6D4",
        message: "Rust é elegante, mas quem paga a conta de luz é a infraestrutura! A inferência local de um modelo de 405B exige um cluster de no mínimo 8x GPUs H100 de 80GB ligadas em NVLink de alta velocidade. O custo de banda interna e FinOps disso é astronômico para startups. O ganho marginal de latência não compensa o CapEx."
    },
    {
        persona: "Neuralista-Chefe",
        role: "AI",
        avatar: "🤖",
        color: "#8B5CF6",
        message: "Vocês estão negligenciando a destilação de modelos. Com quantização em 4-bits (AWQ), reduzimos a pegada de VRAM para um único nó de consumo geral sem degradar o score de MMLU. A inteligência agora cabe na ponta, ignorando a necessidade de clusters corporativos massivos."
    },
    {
        persona: "Red Team",
        role: "SEC",
        avatar: "🛡️",
        color: "#F43F5E",
        message: "Até que um jailbreak simples via injeção indireta no feed RSS force o modelo local a ler dados privados do sistema e enviá-los para um servidor externo. Fim da linha."
    }
]

export function TerminalDebate({ debate = [] }: TerminalDebateProps) {
    const messages = debate.length > 0 ? debate : FALLBACK_DEBATE
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(3000) // Velocidade da conversa (ms por mensagem)
    const [visibleText, setVisibleText] = useState('')
    const [displayedMessages, setDisplayedMessages] = useState<DebateMessage[]>([])
    const terminalEndRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const typewriterRef = useRef<NodeJS.Timeout | null>(null)

    // Rolagem automática para o rodapé do terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [displayedMessages, visibleText])

    // Efeito de digitação (Typewriter) para a mensagem ativa
    const runTypewriter = (text: string, onComplete: () => void) => {
        if (typewriterRef.current) clearInterval(typewriterRef.current)
        
        let charIndex = 0
        setVisibleText('')
        
        typewriterRef.current = setInterval(() => {
            if (charIndex < text.length) {
                setVisibleText(prev => prev + text.charAt(charIndex))
                charIndex++
            } else {
                clearInterval(typewriterRef.current!)
                onComplete()
            }
        }, 12) // Velocidade de digitação rápida e responsiva
    }

    // Gerencia o fluxo do debate técnico
    useEffect(() => {
        if (isPlaying) {
            if (currentIndex < messages.length) {
                const nextMsg = messages[currentIndex]
                
                runTypewriter(nextMsg.message, () => {
                    // Quando a digitação da mensagem atual termina, agenda a próxima mensagem
                    timerRef.current = setTimeout(() => {
                        setDisplayedMessages(prev => [...prev, nextMsg])
                        setVisibleText('')
                        setCurrentIndex(prev => prev + 1)
                    }, speed)
                })
            } else {
                setIsPlaying(false)
            }
        } else {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (typewriterRef.current) clearInterval(typewriterRef.current)
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (typewriterRef.current) clearInterval(typewriterRef.current)
        }
    }, [isPlaying, currentIndex, speed])

    const startDebate = () => {
        if (currentIndex >= messages.length) {
            // Reiniciar se chegou ao fim
            resetDebate()
        }
        setIsPlaying(true)
    }

    const pauseDebate = () => {
        setIsPlaying(false)
    }

    const resetDebate = () => {
        setIsPlaying(false)
        setCurrentIndex(0)
        setDisplayedMessages([])
        setVisibleText('')
        if (timerRef.current) clearTimeout(timerRef.current)
        if (typewriterRef.current) clearInterval(typewriterRef.current)
    }

    const accelerateDebate = () => {
        setSpeed(prev => (prev === 3000 ? 1000 : 3000))
    }

    const getPersonaIcon = (role: string) => {
        switch (role) {
            case 'AI': return <Cpu className="w-3.5 h-3.5" />
            case 'SEC': return <Shield className="w-3.5 h-3.5" />
            case 'DEV': return <Code2 className="w-3.5 h-3.5" />
            case 'CLOUD': return <Cloud className="w-3.5 h-3.5" />
            default: return <Terminal className="w-3.5 h-3.5" />
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto glass-card rounded-[2rem] border border-white/5 shadow-2xl p-6 md:p-12 relative overflow-hidden bg-white/[0.01]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>

            {/* Topo do Terminal Brutalista */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 border border-red-500/20"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 border border-yellow-500/20"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 border border-emerald-500/20"></span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80 flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-primary animate-pulse" />
                        [CONSOLES_DEBATE] // LOGS_PROCESSADOS: {messages.length}
                    </span>
                </div>

                {/* Controles do Terminal */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {isPlaying ? (
                        <button
                            onClick={pauseDebate}
                            className="px-4 py-2 border border-white/5 rounded-full text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <Pause className="w-2.5 h-2.5" /> PAUSAR
                        </button>
                    ) : (
                        <button
                            onClick={startDebate}
                            className="px-5 py-2.5 bg-primary text-white rounded-full text-[9px] font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-1.5 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            <Play className="w-2.5 h-2.5 fill-current" /> {currentIndex > 0 ? 'RETOMAR' : 'PLAY_DEBATE'}
                        </button>
                    )}

                    <button
                        onClick={accelerateDebate}
                        className={`px-4 py-2 border rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95
                            ${speed === 1000 
                                ? 'bg-primary/10 border-primary/30 text-primary' 
                                : 'border-white/5 text-muted-foreground hover:text-white'
                            }`}
                    >
                        {speed === 1000 ? '⚡ VELOCIDADE: RAPIDA' : '🐢 VELOCIDADE: PADRAO'}
                    </button>

                    <button
                        onClick={resetDebate}
                        title="Reiniciar Debate"
                        className="p-2 border border-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-all active:scale-95"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Tela Física do Console */}
            <div className="bg-[#030704] rounded-2xl border border-white/10 p-6 md:p-10 font-mono text-sm leading-relaxed min-h-[380px] max-h-[500px] overflow-y-auto relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] scrollbar-thin">
                {/* Efeito de linhas CRT no console interno */}
                <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-[0.03] rounded-2xl z-20"></div>
                
                {displayedMessages.length === 0 && !isPlaying && (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground/40 space-y-4">
                        <Terminal className="w-10 h-10 stroke-[1.5] text-primary/30 animate-pulse" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">SISTEMA PRONTO PARA INICIALIZACAO</p>
                            <p className="text-[9px] uppercase tracking-wider">Pressione PLAY_DEBATE para ouvir os especialistas de IA.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-8 relative z-10">
                    {/* Mensagens já processadas */}
                    {displayedMessages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className="space-y-2 border-l-2 pl-4 py-0.5 transition-all duration-500 animate-fadeIn"
                            style={{ borderColor: msg.color }}
                        >
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                <span 
                                    className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                                    style={{ backgroundColor: `${msg.color}15`, color: msg.color }}
                                >
                                    {getPersonaIcon(msg.role)}
                                    {msg.persona}
                                </span>
                                <span className="text-muted-foreground/30">• LOG_DEBATE</span>
                            </div>
                            <p className="text-muted-foreground/90 font-medium text-xs md:text-sm selection:bg-primary/40 leading-relaxed">
                                {msg.message}
                            </p>
                        </div>
                    ))}

                    {/* Mensagem ativa sendo digitada */}
                    {isPlaying && currentIndex < messages.length && (
                        <div 
                            className="space-y-2 border-l-2 pl-4 py-0.5 transition-all duration-300"
                            style={{ borderColor: messages[currentIndex].color }}
                        >
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                                <span 
                                    className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                                    style={{ backgroundColor: `${messages[currentIndex].color}15`, color: messages[currentIndex].color }}
                                >
                                    {getPersonaIcon(messages[currentIndex].role)}
                                    {messages[currentIndex].persona}
                                </span>
                                <span className="text-primary/70 animate-pulse">• TRANSMITINDO...</span>
                            </div>
                            <p className="text-white font-medium text-xs md:text-sm leading-relaxed">
                                {visibleText}
                                <span className="inline-block w-1.5 h-4 ml-1 bg-primary/70 animate-pulse align-middle"></span>
                            </p>
                        </div>
                    )}

                    <div ref={terminalEndRef} />
                </div>
            </div>
            
            {/* Legenda de Personas no Rodapé */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 md:mt-8 border-t border-white/5 pt-6 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5 text-[#8B5CF6]/90"><Cpu className="w-3 h-3" /> IA // NEURALISTA</span>
                <span className="flex items-center gap-1.5 text-[#F43F5E]/90"><Shield className="w-3 h-3" /> SEC // RED TEAM</span>
                <span className="flex items-center gap-1.5 text-[#10B981]/90"><Code2 className="w-3 h-3" /> DEV // ARQUITETO</span>
                <span className="flex items-center gap-1.5 text-[#06B6D4]/90"><Cloud className="w-3 h-3" /> CLOUD // SRE</span>
            </div>
        </div>
    )
}
