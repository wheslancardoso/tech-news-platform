import { describe, it, expect } from 'vitest'

interface Post {
  id: string
  category: string
  score: number
  title: string
}

// Algoritmo idêntico ao implementado na listagem de archive (app/archive/page.tsx)
function sortPostsByAffinity(posts: Post[], preferences: string[]): Post[] {
  return [...posts].sort((a, b) => {
    const aPref = preferences.includes(a.category) ? 1 : 0
    const bPref = preferences.includes(b.category) ? 1 : 0
    
    if (aPref !== bPref) {
      return bPref - aPref
    }
    return (b.score || 0) - (a.score || 0)
  })
}

describe('Algoritmo de Ordenação por Afinidade', () => {
  const mockPosts: Post[] = [
    { id: '1', category: 'GEARHEAD', score: 10, title: 'Post Gearhead Baixo' },
    { id: '2', category: 'TECH_HACKER', score: 50, title: 'Post Hacker Alto' },
    { id: '3', category: 'SYNTH_AESTHETICS', score: 30, title: 'Post Synth' },
    { id: '4', category: 'TECH_HACKER', score: 20, title: 'Post Hacker Baixo' },
    { id: '5', category: 'GEARHEAD', score: 90, title: 'Post Gearhead Alto' }
  ]

  it('deve priorizar categorias preferidas do usuário com desempate por score', () => {
    const preferences = ['TECH_HACKER']
    const result = sortPostsByAffinity(mockPosts, preferences)

    // Os posts de TECH_HACKER devem vir primeiro
    expect(result[0].category).toBe('TECH_HACKER')
    expect(result[1].category).toBe('TECH_HACKER')
    // O de maior score de TECH_HACKER deve ser o primeiro
    expect(result[0].id).toBe('2') // score 50
    expect(result[1].id).toBe('4') // score 20

    // Os posts não preferidos devem vir depois, ordenados por score decrescente
    expect(result[2].id).toBe('5') // GEARHEAD score 90
    expect(result[3].id).toBe('3') // SYNTH_AESTHETICS score 30
    expect(result[4].id).toBe('1') // GEARHEAD score 10
  })

  it('deve ordenar apenas por score decrescente se o usuário não tiver preferências', () => {
    const preferences: string[] = []
    const result = sortPostsByAffinity(mockPosts, preferences)

    expect(result[0].id).toBe('5') // score 90
    expect(result[1].id).toBe('2') // score 50
    expect(result[2].id).toBe('3') // score 30
    expect(result[3].id).toBe('4') // score 20
    expect(result[4].id).toBe('1') // score 10
  })

  it('deve ordenar por score decrescente quando múltiplas categorias preferidas existirem', () => {
    const preferences = ['GEARHEAD', 'SYNTH_AESTHETICS']
    const result = sortPostsByAffinity(mockPosts, preferences)

    // GEARHEAD (score 90, 10) e SYNTH_AESTHETICS (score 30) devem vir primeiro
    expect(result[0].id).toBe('5') // GEARHEAD score 90 (preferido, maior score)
    expect(result[1].id).toBe('3') // SYNTH score 30 (preferido, score médio)
    expect(result[2].id).toBe('1') // GEARHEAD score 10 (preferido, menor score)
    
    // TECH_HACKER (não preferido) vem depois, ordenado por score decrescente
    expect(result[3].id).toBe('2') // score 50
    expect(result[4].id).toBe('4') // score 20
  })
})
