import { vi, describe, it, expect, beforeEach } from 'vitest'
import { GET } from '@/app/api/cli/route'

// Mock do @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => {
    return {
        createClient: vi.fn(() => ({
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
                data: {
                    id: 'test-id',
                    edition_number: 42,
                    created_at: '2026-05-22T00:00:00Z',
                    status: 'published',
                    content_json: JSON.stringify({
                        title: 'IA Revoluciona o Desenvolvimento',
                        intro: 'Esta é uma introdução longa e detalhada sobre o impacto da inteligência artificial no mercado.',
                        quickTakes: ['Quick take 1', 'Quick take 2'],
                        categories: [
                            {
                                name: 'IA Neuralista',
                                items: [
                                    {
                                        headline: 'GPT-5 Lançado',
                                        story: 'Uma história incrível sobre o modelo novo.',
                                        link: 'https://example.com'
                                    }
                                ]
                            }
                        ]
                    })
                },
                error: null
            })
        }))
    }
})

describe('CLI Route API // Rota /api/cli', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('deve retornar a edição mestre em texto brutalista quando chamada sem parâmetros', async () => {
        const req = new Request('http://localhost:3000/api/cli')
        const response = await GET(req)

        expect(response.status).toBe(200)
        expect(response.headers.get('Content-Type')).toContain('text/plain')

        const body = await response.text()
        
        // Verifica o cabeçalho brutalista da broadsheet
        expect(body).toContain('THE NEO-BROADSHEET')
        expect(body).toContain('F R E S H   N E W S')
        expect(body).toContain('Edição #42')
        
        // Verifica os conteúdos da edição
        expect(body).toContain('IA REVOLUCIONA O DESENVOLVIMENTO')
        expect(body).toContain('⚡ LOGS DE SISTEMA (QUICK TAKES)')
        expect(body).toContain('IA NEURALISTA')
        expect(body).toContain('GPT-5 LANÇADO')
        expect(body).toContain('Ver fonte:')
        expect(body).toContain('FIM DA TRANSMISSÃO')
    })

    it('deve exibir o manual técnico do terminal em ASCII e cores ANSI se help=true for informado', async () => {
        const req = new Request('http://localhost:3000/api/cli?help=true')
        const response = await GET(req)

        expect(response.status).toBe(200)
        expect(response.headers.get('Content-Type')).toContain('text/plain')

        const body = await response.text()
        expect(body).toContain('MANUAL DO TERMINAL (CLI)')
        expect(body).toContain('USO:')
        expect(body).toContain('OPÇÕES SUPORTADAS:')
        expect(body).toContain('?edition=N')
        expect(body).toContain('?category=CAT')
    })

    it('deve realizar a filtragem de categorias se category for fornecido', async () => {
        const req = new Request('http://localhost:3000/api/cli?category=IA')
        const response = await GET(req)

        expect(response.status).toBe(200)
        const body = await response.text()
        expect(body).toContain('IA NEURALISTA')
        
        // Se filtrarmos por uma categoria que não existe na edição mockada
        const reqEmpty = new Request('http://localhost:3000/api/cli?category=SEC')
        const responseEmpty = await GET(reqEmpty)
        const bodyEmpty = await responseEmpty.text()
        // Não deve conter notícias de IA neuralista no resultado vazio filtrado
        expect(bodyEmpty).not.toContain('IA NEURALISTA')
    })
})
