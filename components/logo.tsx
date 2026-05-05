import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 36 }: LogoProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glass-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Organic 'N' Shape */}
        <path
          d="M30 75V25C30 25 30 20 35 20C40 20 60 55 65 65C70 75 70 80 75 80C80 80 80 75 80 75V25"
          stroke="url(#logo-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glass-glow)"
          className="transition-all duration-500"
        />
        
        {/* Liquid Drop Detail */}
        <circle 
          cx="30" cy="75" r="6" 
          fill="url(#logo-gradient)" 
          className="animate-pulse"
        />
      </svg>
    </div>
  )
}
