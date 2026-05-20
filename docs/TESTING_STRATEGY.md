# 🧪 Estratégia de Testes: Tech News Platform

Este documento define como garantimos a estabilidade, segurança e qualidade dos dados enviados aos nossos assinantes.

---

## 🔝 Pirâmide de Testes

Seguimos uma estrutura de testes balanceada para máxima confiança:

1.  **Unitários (60%)**: Lógica isolada (Parsers, Calculadores de Score, Formatação de Data).
2.  **Integração (30%)**: Comunicação com Supabase, Chamadas de API de IA (mockadas).
3.  **E2E / UI (10%)**: Fluxos críticos do usuário no navegador.

---

## 🛠️ Ferramental

- **Lógica & API**: [Vitest](https://vitest.dev/) (Rápido, compatível com Vite/Next).
- **UI & Fluxos**: [Playwright](https://playwright.dev/) (Simulação real de navegador).
- **Estático**: [ESLint](https://eslint.org/) + [TypeScript](https://www.typescriptlang.org/) (Evita erros de digitação e tipos).
- **Email**: [Mailtrap](https://mailtrap.io/) ou [Resend Test Mode](https://resend.com/docs/api-reference/emails/send-email) (Interceptação de envios).

---

## 🚨 Cenários Críticos (Obrigatórios)

Estes cenários devem ser testados antes de cada release major:

### 1. Ingestão de RSS
- **Cenário**: O crawler encontra 10 links novos.
- **Expectativa**: 10 entradas criadas em `posts` com `status: pending`.
- **Falha**: Links duplicados não devem ser reinseridos.

### 2. Higiene de Dados (IA)
- **Cenário**: Um post de "Publicidade de Cloud" é processado.
- **Expectativa**: A IA identifica como baixa relevância (`score < 20`) e categoriza como `BIZ`.

### 3. Proteção de Admin
- **Cenário**: Usuário tenta acessar `/admin` sem o cookie de sessão.
- **Expectativa**: Redirecionamento automático para `/login`.

### 4. Renderização de Email
- **Cenário**: Gerar o HTML da newsletter com 5 posts.
- **Expectativa**: O HTML gerado deve ser válido (W3C) e responsivo em Outlook/Gmail.

---

## 🤖 Como Mockar a IA em Testes

Para economizar tokens e tempo nos testes automatizados, usamos Mocks para o serviço `lib/services/ai.ts`:

```ts
// Exemplo de mockup técnico
vi.mock('@/lib/services/ai', () => ({
  generateSummary: vi.fn().mockResolvedValue({
    title: "Mock Title",
    summary: "Mock summary for testing",
    relevance_score: 99
  })
}))
```

---

## 🚀 Fluxo de CI (GitHub Actions)

Todo *Pull Request* aciona o pipeline de testes:
1. `npm run lint` (Qualidade de código).
2. `npm run test` (Testes unitários).
3. `npm run build` (Garantia de que o Next.js compila).

---

## ✅ Checklist de Qualidade (Pré-PR)

- [ ] Os novos componentes têm `Proptypes` ou `Interfaces` TS?
- [ ] O novo serviço de API tem tratamento de erro (`try/catch`)?
- [ ] A mudança visual foi testada em Mobile (Responsive)?
- [ ] O lighthouse score da Home não caiu abaixo de 90?
