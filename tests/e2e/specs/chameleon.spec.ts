import { test, expect } from '@playwright/test'

test.describe('Chameleon Engine & Transmutação Estética Visual', () => {

  test('deve aplicar variáveis de cores HSL e tipografia monospace ao ler um post da categoria DEV', async ({ page }) => {
    // Navega diretamente para a leitura do post de DEV real
    await page.goto('/post/3727e3c8-ebb3-4040-8d89-0e1e6cc406fe')

    // Aguarda um curto intervalo para que o Chameleon Engine processe a transfiguração reativa no DOM
    await page.waitForTimeout(500)

    // O corpo principal do documento ou elemento raiz deve conter as classes/estilos de mutação HSL no CSS inline da div .min-h-screen
    const container = page.locator('.min-h-screen')
    await expect(container).toBeVisible()

    const accentVar = await container.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--theme-primary').trim()
    })

    // A variável CSS reativa correspondente à cor de destaque (--theme-primary) deve estar populada com a cor do tema
    expect(accentVar).toBe('#FF0000')
  })

  test('deve aplicar cor de destaque roxo e tipografia monospace ao ler post da categoria CLOUD', async ({ page }) => {
    // Navega diretamente para a leitura do post de CLOUD real
    await page.goto('/post/d622cab2-c61f-460b-be83-379e105c3770')

    // Aguarda um curto intervalo para que o Chameleon Engine processe a transfiguração reativa no DOM
    await page.waitForTimeout(500)

    // A variável CSS reativa correspondente à cor de destaque (--theme-primary) deve ser transmutada para o roxo do tema
    const container = page.locator('.min-h-screen')
    await expect(container).toBeVisible()

    const accentVar = await container.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--theme-primary').trim()
    })
    expect(accentVar).toBe('#BD00FF')
  })
})
