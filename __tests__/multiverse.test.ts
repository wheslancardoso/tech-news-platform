import { describe, it, expect } from 'vitest'
import { determineWorld } from '@/lib/services/newsletter'

describe('Lógica do Multiverso // determineWorld', () => {
  it('deve categorizar dicas de categoria musical no canal MUSIC', () => {
    expect(determineWorld('MUSICA_URBANA')).toBe('MUSIC')
    expect(determineWorld('MUSICA_ELETRONICA')).toBe('MUSIC')
    expect(determineWorld('VANGUARDA_CRITICA')).toBe('MUSIC')
    expect(determineWorld('CULTURA_BR')).toBe('MUSIC')
    expect(determineWorld('ROCK_INDIE')).toBe('MUSIC')
    expect(determineWorld('RAP_HIPHOP')).toBe('MUSIC')
    expect(determineWorld('MUSIC')).toBe('MUSIC')
    // Teste de case insensitivity
    expect(determineWorld('musica_urbana')).toBe('MUSIC')
    expect(determineWorld('Rock_Indie')).toBe('MUSIC')
  })

  it('deve categorizar dicas de categoria automobilística/hardware no canal GEAR', () => {
    expect(determineWorld('F1_MOTORSPORT')).toBe('GEAR')
    expect(determineWorld('RAW_HARDWARE')).toBe('GEAR')
    expect(determineWorld('GEARHEAD')).toBe('GEAR')
    expect(determineWorld('GEAR')).toBe('GEAR')
    // Teste de case insensitivity
    expect(determineWorld('f1_motorsport')).toBe('GEAR')
    expect(determineWorld('gearhead')).toBe('GEAR')
  })

  it('deve categorizar dicas de jogos/consoles no canal GAME', () => {
    expect(determineWorld('INDIE_GAME')).toBe('GAME')
    expect(determineWorld('ESPORTS')).toBe('GAME')
    expect(determineWorld('HARDWARE_CONSOLE')).toBe('GAME')
    expect(determineWorld('GAME')).toBe('GAME')
    // Teste de case insensitivity
    expect(determineWorld('indie_game')).toBe('GAME')
    expect(determineWorld('esports')).toBe('GAME')
  })

  it('deve classificar dicas de tecnologia ou dicas desconhecidas no canal padrão TECH', () => {
    expect(determineWorld('TECH_HACKER')).toBe('TECH')
    expect(determineWorld('IA')).toBe('TECH')
    expect(determineWorld('SEGURANÇA')).toBe('TECH')
    expect(determineWorld('CLOUD')).toBe('TECH')
    expect(determineWorld('QUALQUER_OUTRA_COISA')).toBe('TECH')
  })

  it('deve retornar TECH para valores nulos, vazios ou indefinidos', () => {
    expect(determineWorld('')).toBe('TECH')
    expect(determineWorld(undefined as any)).toBe('TECH')
    expect(determineWorld(null as any)).toBe('TECH')
  })
})
