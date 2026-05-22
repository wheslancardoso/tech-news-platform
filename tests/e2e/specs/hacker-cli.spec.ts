import { test, expect } from '@playwright/test'

test.describe('Hacker Mode: CLI View & Terminal Reader', () => {

  test('deve responder com ASCII-art colorido brutalista ao receber requisicoes via curl na API CLI', async ({ request }) => {
    // Efetua uma chamada HTTP direta à rota /api/cli injetando User-Agent de curl
    const response = await request.get('/api/cli', {
      headers: {
        'User-Agent': 'curl/7.81.0',
      }
    })

    // O status do endpoint deve ser 200 (OK)
    expect(response.ok()).toBeTruthy()

    // O cabeçalho Content-Type deve ser plain-text puro para legibilidade nativa do terminal
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('text/plain')

    // O corpo de resposta do ASCII-art deve conter caracteres estruturais do cabeçalho mestre
    const bodyText = await response.text()
    expect(bodyText).toContain('THE NEO-BROADSHEET')
    // E ter os demarcadores brutalistas de contorno sólido
    expect(bodyText).toContain('┌')
    expect(bodyText).toContain('└')
  })

  test('deve permitir ativar a folha de estilo CRT retro do Hacker Mode na interface web', async ({ page }) => {
    await page.goto('/archive')

    // Localiza o botão brutalista do Hacker Mode no console
    const hackerModeBtn = page.getByLabel('Alternar Modo Hacker CRT')
    
    // O botão deve estar visível e clicável
    await expect(hackerModeBtn).toBeVisible()
    await hackerModeBtn.click()

    // O elemento HTML deve receber a classe global theme-crt
    const htmlElement = page.locator('html')
    await expect(htmlElement).toHaveClass(/theme-crt/i)
  })
})
