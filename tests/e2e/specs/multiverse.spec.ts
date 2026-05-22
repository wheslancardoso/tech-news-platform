import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/home'

test.describe('Multiverso & Seletor de Canais Brutalista', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('deve inicializar o portal no mundo padrão TECH e apresentar o LED pulsante ativo', async ({ page }) => {
    // Valida o LED ativo no seletor
    await homePage.expectActiveWorld('TECH')

    // Valida o Hero correspondente ao mundo padrão TECH
    const heroText = await homePage.getHeroText()
    expect(heroText).toContain('Sua Dose de Inteligência Tech')
  })

  test('deve transmutar o layout e Hero ao sintonizar no canal MUSIC', async ({ page }) => {
    // Clica no canal MUSIC
    await homePage.selectWorld('MUSIC')

    // O LED correspondente do canal MUSIC deve estar piscando
    await homePage.expectActiveWorld('MUSIC')

    // O Hero deve ser atualizado instantaneamente para a sintonia de música/contracultura
    const heroText = await homePage.getHeroText()
    expect(heroText).toContain('Batidas & Sons da Contracultura')

    // O cookie de persistência deve ter sido gravado com o valor correspondente
    const cookies = await page.context().cookies()
    const activeWorldCookie = cookies.find(c => c.name === 'active_world')
    expect(activeWorldCookie).toBeDefined()
    expect(activeWorldCookie?.value).toBe('MUSIC')
  })

  test('deve transmutar o layout e Hero ao sintonizar no canal GEAR', async ({ page }) => {
    // Clica no canal GEAR
    await homePage.selectWorld('GEAR')

    // O LED correspondente do canal GEAR deve estar piscando
    await homePage.expectActiveWorld('GEAR')

    // O Hero deve ser atualizado instantaneamente para o mundo gearhead
    const heroText = await homePage.getHeroText()
    expect(heroText).toContain('Engenharia Extrema & Silício')

    // O cookie de persistência deve ter sido gravado com o valor correspondente
    const cookies = await page.context().cookies()
    const activeWorldCookie = cookies.find(c => c.name === 'active_world')
    expect(activeWorldCookie?.value).toBe('GEAR')
  })

  test('deve persistir o canal sintonizado e ler diretamente via SSR após recarregar a página', async ({ page }) => {
    // Sintoniza no canal GEAR
    await homePage.selectWorld('GEAR')
    await homePage.expectActiveWorld('GEAR')

    // Recarrega a página simulando uma nova sessão SSR
    await page.reload()

    // O canal ativo deve persistir como GEAR e o LED correspondente ativo
    await homePage.expectActiveWorld('GEAR')
    const heroText = await homePage.getHeroText()
    expect(heroText).toContain('Engenharia Extrema & Silício')
  })
})
