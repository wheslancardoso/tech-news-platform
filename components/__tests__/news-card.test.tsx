import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewsCard } from '../news-card'

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: any }) => (
        <a href={href} {...rest}>{children}</a>
    ),
}))

// Mock do PublishButton para evitar inicialização do Resend
vi.mock('@/components/publish-button', () => ({
    PublishButton: ({ id, status }: { id: string; status: string }) => (
        <button data-testid="publish-button">Publish</button>
    ),
}))

// Mock das actions
vi.mock('@/actions/admin', () => ({
    deleteNewsletter: vi.fn(),
}))

// Mock do sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('NewsCard', () => {
    const mockProps = {
        id: 'test-123',
        edition: 42,
        title: 'A Revolução do TypeScript 6.0',
        date: '2024-12-05T10:00:00Z',
        intro: 'Novas features que vão mudar o jogo para desenvolvedores.',
        status: 'published' as const,
        isAdmin: false,
    }

    describe('Renderização Básica', () => {
        it('deve renderizar o título corretamente', () => {
            render(<NewsCard {...mockProps} />)

            expect(screen.getByText('A Revolução do TypeScript 6.0')).toBeInTheDocument()
        })

        it('deve renderizar o número da edição', () => {
            render(<NewsCard {...mockProps} />)

            expect(screen.getByText('Edição #42')).toBeInTheDocument()
        })

        it('deve renderizar a intro', () => {
            render(<NewsCard {...mockProps} />)

            expect(
                screen.getByText('Novas features que vão mudar o jogo para desenvolvedores.')
            ).toBeInTheDocument()
        })

        it('deve mostrar texto padrão quando intro é undefined', () => {
            const propsWithoutIntro = { ...mockProps, intro: undefined }
            render(<NewsCard {...propsWithoutIntro} />)

            expect(screen.getByText('Análise técnica em progresso. Aguarde a sincronização.')).toBeInTheDocument()
        })

        it('deve ter link para a página da edição', () => {
            render(<NewsCard {...mockProps} />)

            const link = screen.getByRole('link', { name: 'Ver conteúdo da edição 42' })
            expect(link).toHaveAttribute('href', '/archive/test-123')
        })
    })

    describe('Formatação de Data', () => {
        it('deve formatar a data corretamente em português', () => {
            render(<NewsCard {...mockProps} />)

            expect(screen.getByText('05.12.2024')).toBeInTheDocument()
        })

        it('deve formatar data de janeiro corretamente', () => {
            const propsJan = { ...mockProps, date: '2024-01-15T10:00:00Z' }
            render(<NewsCard {...propsJan} />)

            expect(screen.getByText('15.01.2024')).toBeInTheDocument()
        })
    })

    describe('Badge de Status (Draft)', () => {
        it('NÃO deve mostrar Badge "RASCUNHO" quando status="published"', () => {
            render(<NewsCard {...mockProps} status="published" isAdmin={true} />)

            expect(screen.queryByText('RASCUNHO')).not.toBeInTheDocument()
        })

        it('DEVE mostrar Badge "RASCUNHO" quando status="draft" E isAdmin={true}', () => {
            render(<NewsCard {...mockProps} status="draft" isAdmin={true} />)

            expect(screen.getByText('RASCUNHO')).toBeInTheDocument()
        })
    })

    describe('Controles de Admin', () => {
        it('NÃO deve mostrar controles de admin quando isAdmin={false}', () => {
            render(<NewsCard {...mockProps} isAdmin={false} />)

            // Botão de delete não existe
            expect(screen.queryByTitle('Excluir Edição')).not.toBeInTheDocument()
        })

        it('DEVE mostrar botão de delete quando isAdmin={true}', () => {
            render(<NewsCard {...mockProps} isAdmin={true} />)

            expect(screen.getByTitle('Excluir Edição')).toBeInTheDocument()
        })

        it('DEVE mostrar botão de editar quando isAdmin={true} E status="draft"', () => {
            render(<NewsCard {...mockProps} status="draft" isAdmin={true} />)

            expect(screen.getByTitle('Editar Draft')).toBeInTheDocument()
        })

        it('NÃO deve mostrar botão de editar quando status="published"', () => {
            render(<NewsCard {...mockProps} status="published" isAdmin={true} />)

            expect(screen.queryByTitle('Editar Draft')).not.toBeInTheDocument()
        })
    })
})
