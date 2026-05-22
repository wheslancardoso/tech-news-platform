import { type Page, expect } from '@playwright/test'

export class DebatePage {
  constructor(private page: Page) {}

  async gotoEdition(editionId: string) {
    await this.page.goto(`/archive/${editionId}`)
  }

  /**
   * Obtém o painel de debate CRT
   */
  async getDebateConsole() {
    return this.page.locator('div.glass-card', { hasText: 'CONSOLES_DEBATE' })
  }

  /**
   * Clica no botão PLAY_DEBATE
   */
  async play() {
    const playBtn = this.page.getByRole('button', { name: /play_debate|retomar/i })
    await expect(playBtn).toBeVisible()
    await playBtn.click()
  }

  /**
   * Clica no botão PAUSAR
   */
  async pause() {
    const pauseBtn = this.page.getByRole('button', { name: /pausar/i })
    await expect(pauseBtn).toBeVisible()
    await pauseBtn.click()
  }

  /**
   * Clica no botão de reiniciar o debate
   */
  async reset() {
    const resetBtn = this.page.locator('button[title="Reiniciar Debate"]')
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()
  }

  /**
   * Clica no botão para alternar a velocidade (Padrão <-> Rápida)
   */
  async toggleSpeed() {
    const speedBtn = this.page.locator('button', { hasText: /velocidade/i })
    await expect(speedBtn).toBeVisible()
    await speedBtn.click()
  }

  /**
   * Verifica se o console interno do terminal está no estado pronto/inativo de inicialização
   */
  async expectReadyState() {
    const readyText = this.page.getByText('SISTEMA PRONTO PARA INICIALIZACAO')
    await expect(readyText).toBeVisible()
  }

  /**
   * Verifica se o indicador de transmissão ativa está visível
   */
  async expectActiveTransmission() {
    const activeText = this.page.getByText('TRANSMITINDO...')
    await expect(activeText).toBeVisible()
  }
}
