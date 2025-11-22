'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ScrollLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function ScrollLink({ href, className, children, ...props }: ScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </a>
  )
}

