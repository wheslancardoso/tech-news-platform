import { describe, it, expect } from 'vitest'
import { scoreItem } from '../newsletter'

describe('scoreItem', () => {
    describe('Termos de Segurança (+5 pontos)', () => {
        it('deve pontuar +5 para notícia com "vulnerability"', () => {
            const item = { title: 'Critical vulnerability found in OpenSSL' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(5)
        })

        it('deve pontuar +5 para notícia com "CVE"', () => {
            const item = { title: 'CVE-2024-1234 affects millions of devices' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(5)
        })

        it('deve pontuar +5 para notícia com "security breach"', () => {
            const item = { title: 'Major security breach at tech company' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(5)
        })
    })

    describe('Termos de Dev (+2 pontos)', () => {
        it('deve pontuar +2 para notícia com "React"', () => {
            const item = { title: 'React 19 introduces new compiler' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(2)
        })

        it('deve pontuar +2 para notícia com "TypeScript"', () => {
            const item = { title: 'TypeScript 5.0 is now stable' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(2)
        })

        it('deve acumular pontos para múltiplos termos tech', () => {
            const item = { title: 'Using React with TypeScript and Docker' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(6) // 2 + 2 + 2
        })
    })

    describe('Termos de Ruído (-5 pontos)', () => {
        it('deve penalizar notícia de emprego (-5)', () => {
            const item = { title: 'Senior Developer job opening at startup' }
            const score = scoreItem(item)
            expect(score).toBeLessThan(0)
        })

        it('deve penalizar notícia de podcast (-5)', () => {
            const item = { title: 'New podcast episode about tech trends' }
            const score = scoreItem(item)
            expect(score).toBeLessThan(0)
        })
    })

    describe('Termos de Consumo (-10 pontos)', () => {
        it('deve penalizar "Black Friday" (-10)', () => {
            const item = { title: 'Best Black Friday deals for tech lovers' }
            const score = scoreItem(item)
            expect(score).toBeLessThanOrEqual(-10)
        })

        it('deve penalizar "Deal" (-10)', () => {
            const item = { title: 'Amazing deal on new gadgets' }
            const score = scoreItem(item)
            expect(score).toBeLessThanOrEqual(-10)
        })

        it('deve penalizar "Galaxy S24" (-10)', () => {
            const item = { title: 'Samsung Galaxy S24 review: is it worth it?' }
            const score = scoreItem(item)
            // "galaxy s" (-10) + "review" (-10) = -20
            expect(score).toBeLessThanOrEqual(-10)
        })

        it('deve penalizar "iPhone" (-10)', () => {
            const item = { title: 'iPhone 16 unboxing and first impressions' }
            const score = scoreItem(item)
            // "iphone" (-10) + "unboxing" (-10) = -20
            expect(score).toBeLessThanOrEqual(-20)
        })

        it('deve penalizar "smartwatch" e "headphones"', () => {
            const item = { title: 'Best smartwatch and headphones combo' }
            const score = scoreItem(item)
            expect(score).toBeLessThanOrEqual(-20) // -10 + -10
        })
    })

    describe('Texto Neutro', () => {
        it('deve retornar 0 para texto irrelevante', () => {
            const item = { title: 'The weather is nice today' }
            const score = scoreItem(item)
            expect(score).toBe(0)
        })

        it('deve retornar 0 para item vazio', () => {
            const item = {}
            const score = scoreItem(item)
            expect(score).toBe(0)
        })

        it('deve retornar 0 para texto genérico', () => {
            const item = { title: 'Lorem ipsum dolor sit amet' }
            const score = scoreItem(item)
            expect(score).toBe(0)
        })
    })

    describe('Casos de IA (+5 pontos)', () => {
        it('deve pontuar +5 para "GPT"', () => {
            const item = { title: 'OpenAI releases GPT-5 with new capabilities' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(5)
        })

        it('deve pontuar +5 para "LLM"', () => {
            const item = { title: 'New LLM benchmark shows impressive results' }
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(5)
        })

        it('deve acumular múltiplos termos de IA', () => {
            const item = { title: 'Claude vs GPT: AI model benchmark comparison' }
            // "claude" (+5) + "gpt" (+5) + "ai" (+5) + "model" (+5) + "benchmark" (+5)
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(25)
        })
    })

    describe('Balanceamento de Score', () => {
        it('deve equilibrar termos positivos e negativos', () => {
            // "React" (+2) + "deal" (-10) = -8
            const item = { title: 'React course on sale - best deal ever' }
            const score = scoreItem(item)
            expect(score).toBeLessThan(0)
        })

        it('deve considerar content além do title', () => {
            const item = {
                title: 'Tech News',
                content: 'A critical vulnerability was discovered affecting Kubernetes clusters.'
            }
            // "vulnerability" (+5) + "kubernetes" (+2)
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(7)
        })

        it('deve considerar contentSnippet', () => {
            const item = {
                title: 'Breaking News',
                contentSnippet: 'Docker releases new security patch for CVE-2024-5678'
            }
            // "security" (+5) + "docker" (+2) + "cve" (+5) + "patch" (+5)
            const score = scoreItem(item)
            expect(score).toBeGreaterThanOrEqual(17)
        })
    })
})
