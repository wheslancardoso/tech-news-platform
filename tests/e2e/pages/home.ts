import { type Page, expect } from '@playwright/test'

export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/', { timeout: 60000 })
  }

  /**
   * Clica no botão de seleção de mundo do multiverso
   * @param world Nome do mundo ('TECH', 'MUSIC', 'GEAR')
   */
  async selectWorld(world: 'TECH' | 'MUSIC' | 'GEAR') {
    const worldBtn = this.page.getByRole('button', { name: world })
    await expect(worldBtn).toBeVisible()
    await worldBtn.click()
  }

  /**
   * Obtém o texto do Hero principal adaptativo
   */
  async getHeroText() {
    return this.page.locator('h1').first().textContent()
  }

  /**
   * Verifica se o LED brutalista do mundo selecionado está piscando/ativo
   * @param world Nome do mundo ('TECH', 'MUSIC', 'GEAR')
   */
  async expectActiveWorld(world: 'TECH' | 'MUSIC' | 'GEAR') {
    const worldBtn = this.page.getByRole('button', { name: world })
    // O LED interno tem a classe 'animate-pulse' quando ativo
    const pulseLed = worldBtn.locator('span.animate-pulse')
    await expect(pulseLed).toBeVisible()
  }
}
