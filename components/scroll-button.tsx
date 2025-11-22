'use client'

import { Button } from '@/components/ui/button'

export function ScrollButton() {
  const scrollToSubscribe = () => {
    const element = document.getElementById('subscribe')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Button 
      size="sm" 
      className="bg-black text-white hover:bg-zinc-800 rounded-full px-6"
      onClick={scrollToSubscribe}
    >
      Inscrever-se
    </Button>
  )
}

