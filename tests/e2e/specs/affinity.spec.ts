import { test, expect } from '@playwright/test'
import { ArchivePage } from '../pages/archive'
import { PreferencesPage } from '../pages/preferences'

test.describe('Zine Pessoal & Feed de Afinidades (CRT)', () => {
  let archivePage: ArchivePage
  let preferencesPage: PreferencesPage
  const SUBSCRIBER_ID = '8f7a281c-8a11-41eb-852b-9db04ca9f337'

  test.beforeEach(async ({ page, request: playwrightRequest }) => {
    archivePage = new ArchivePage(page)
    preferencesPage = new PreferencesPage(page)

    // Garante que estamos sintonizados no mundo TECH para evitar colisões de cookies de outros testes
    await page.context().addCookies([{
      name: 'active_world',
      value: 'TECH',
      url: 'http://localhost:3000'
    }])

    // Reseta as preferências do subscriber real antes de cada teste
    await playwrightRequest.patch(`https://vgsjpuxymtkkiaissrky.supabase.co/rest/v1/subscribers?id=eq.${SUBSCRIBER_ID}`, {
      headers: {
        'apikey': 'sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Authorization': 'Bearer sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Content-Type': 'application/json'
      },
      data: { preferences: [] }
    })
  })

  test.afterEach(async ({ request: playwrightRequest }) => {
    // Garante que limpamos o estado das preferências no pós-teste
    await playwrightRequest.patch(`https://vgsjpuxymtkkiaissrky.supabase.co/rest/v1/subscribers?id=eq.${SUBSCRIBER_ID}`, {
      headers: {
        'apikey': 'sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Authorization': 'Bearer sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Content-Type': 'application/json'
      },
      data: { preferences: [] }
    })
  })

  test('deve renderizar o alerta/console CRT de preferências para leitor anônimo', async () => {
    await archivePage.goto()

    // O banner de afinidade deve estar visível informando sessão anônima
    const crtAlert = await archivePage.getCRTAlert()
    await expect(crtAlert).toBeVisible()
    const text = await crtAlert.textContent()
    expect(text).toContain('MOTOR_DE_AFINIDADES_INATIVO')
  })

  test('deve permitir interagir e marcar interesses na interface CRT de preferências', async () => {
    // Acessa a rota de preferências do assinante real
    await preferencesPage.goto(SUBSCRIBER_ID)

    // Marca os checkboxes dos interesses
    await preferencesPage.toggleInterest('TECH_HACKER')

    // Salva as alterações
    await preferencesPage.save()

    // O toast de sucesso deve aparecer confirmando a ação reativa e redirecionando
    await preferencesPage.expectSuccessToast()
  })

  test('deve exibir os posts reordenados por afinidade priorizando categorias correspondentes', async ({ page, request: playwrightRequest }) => {
    // Injeta as preferências 'TECH_HACKER' via API para este teste
    await playwrightRequest.patch(`https://vgsjpuxymtkkiaissrky.supabase.co/rest/v1/subscribers?id=eq.${SUBSCRIBER_ID}`, {
      headers: {
        'apikey': 'sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Authorization': 'Bearer sb_publishable_6D8ptLACddu7D5r2SN0LTQ_RQMtS15q',
        'Content-Type': 'application/json'
      },
      data: { preferences: ['TECH_HACKER'] }
    })

    // Navega para o feed de arquivo passando o subscriber id real na query string
    await archivePage.goto()
    await page.goto(`/archive?subscriber=${SUBSCRIBER_ID}`)

    // Verifica se a badge de afinidade alta está presente
    const affinityBadge = page.getByText('AFINIDADE_ALTA').first()
    await expect(affinityBadge).toBeVisible()

    // Verifica que o primeiro post com afinidade pertence à categoria TECH_HACKER
    const firstPost = page.getByTestId('post-card').first()
    const categorySpan = firstPost.getByText('TECH_HACKER')
    await expect(categorySpan).toBeVisible()
  })
})
