# 🧪 Guia de Testes

Este projeto utiliza **Vitest** com **React Testing Library** para testes unitários e de componentes.

## 📦 Stack de Testes

| Pacote | Função |
|--------|--------|
| `vitest` | Test runner rápido, compatível com Vite |
| `@vitejs/plugin-react` | Suporte a JSX/TSX |
| `jsdom` | Simula ambiente de navegador |
| `@testing-library/react` | Utilitários para testar componentes React |
| `@testing-library/dom` | Core do Testing Library |
| `@testing-library/jest-dom` | Matchers como `toBeInTheDocument()` |

## 🚀 Comandos

```bash
# Executa testes em modo watch (desenvolvimento)
npm test

# Executa testes uma vez (CI/CD)
npm run test:run
```

## 📁 Estrutura de Arquivos

```
├── vitest.config.mts          # Configuração principal
├── vitest.setup.ts            # Setup global (jest-dom matchers)
├── __tests__/                 # Testes gerais
│   └── setup.test.ts          # Validação da configuração
├── lib/services/__tests__/    # Testes de serviços
│   └── newsletter.test.ts     # Testes do algoritmo scoreItem
└── components/__tests__/      # Testes de componentes
    └── news-card.test.tsx     # Testes do NewsCard
```

## 🧩 Testes Implementados

### 1. Algoritmo de Curadoria (`scoreItem`)

**Arquivo:** `lib/services/__tests__/newsletter.test.ts`

Valida o sistema de pontuação que filtra notícias relevantes para desenvolvedores.

| Categoria | Pontuação | Exemplos |
|-----------|-----------|----------|
| 🛡️ Segurança | +5 | `vulnerability`, `CVE`, `security`, `breach` |
| 🤖 IA | +5 | `GPT`, `LLM`, `Claude`, `Gemini`, `AI` |
| 💻 Dev | +2 | `React`, `TypeScript`, `Docker`, `Kubernetes` |
| 📢 Ruído | -5 | `job`, `hiring`, `podcast` |
| 📱 Consumo | -10 | `iPhone`, `Galaxy S`, `Black Friday`, `deal` |

**Casos de Teste:**

```typescript
// Segurança (+5)
scoreItem({ title: 'Critical vulnerability in OpenSSL' }) // >= 5

// Dev (+2)
scoreItem({ title: 'React 19 introduces new compiler' }) // >= 2

// Consumo (-10)
scoreItem({ title: 'iPhone 16 unboxing review' }) // <= -20

// Neutro (0)
scoreItem({ title: 'The weather is nice today' }) // === 0
```

---

### 2. Componente NewsCard

**Arquivo:** `components/__tests__/news-card.test.tsx`

Testa a renderização condicional e formatação do card de notícias.

| Grupo | Casos de Teste |
|-------|----------------|
| Renderização | título, edição, intro, link |
| Formatação de Data | "5 dez", "15 jan" (pt-BR) |
| Badge Draft | Visível apenas se `status="draft"` + `isAdmin={true}` |
| Controles Admin | Botões de delete/editar condicionais |

**Mocks Utilizados:**

```typescript
// next/link
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}))

// PublishButton (evita inicialização do Resend)
vi.mock('@/components/publish-button', () => ({
  PublishButton: () => <button>Publish</button>,
}))

// Server Actions
vi.mock('@/actions/admin', () => ({
  deleteNewsletter: vi.fn(),
}))
```

---

## ✍️ Escrevendo Novos Testes

### Teste de Função Pura

```typescript
import { describe, it, expect } from 'vitest'
import { minhaFuncao } from '../meuArquivo'

describe('minhaFuncao', () => {
  it('deve retornar valor esperado', () => {
    expect(minhaFuncao('input')).toBe('output')
  })
})
```

### Teste de Componente React

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MeuComponente } from '../MeuComponente'

// Mock dependências externas
vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}))

describe('MeuComponente', () => {
  it('deve renderizar o título', () => {
    render(<MeuComponente title="Olá Mundo" />)
    expect(screen.getByText('Olá Mundo')).toBeInTheDocument()
  })
})
```

---

## 🎯 Boas Práticas

1. **Teste comportamento, não implementação** - Valide o que o usuário vê, não detalhes internos.
2. **Mock apenas o necessário** - Evite over-mocking para testes mais realistas.
3. **Use `data-testid` com moderação** - Prefira queries acessíveis (`getByRole`, `getByText`).
4. **Isole dependências externas** - APIs, bancos de dados e serviços devem ser mockados.

---

## 📊 Cobertura Atual

```
Test Files  3 passed (3)
     Tests  38 passed (38)
```

| Arquivo | Testes |
|---------|--------|
| `setup.test.ts` | 2 |
| `newsletter.test.ts` | 22 |
| `news-card.test.tsx` | 14 |

---

## 🔧 Configuração (vitest.config.mts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```
