import { type Page, expect } from '@playwright/test'

export class ArchivePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/archive', { timeout: 60000 })
  }

  /**
   * Verifica a presença do banner informativo retro-CRT de afinidade
   */
  async getCRTAlert() {
    return this.page.locator('[role="alert"]').filter({ hasText: /motor_de_afinidades/i })
  }

  /**
   * Clica no link de gerenciamento de preferências contido no banner ou cabeçalho
   */
  async clickManagePreferences() {
    const preferencesLink = this.page.getByRole('link', { name: /preferências|ajustar afinidade/i })
    await expect(preferencesLink).toBeVisible()
    await preferencesLink.click()
  }

  /**
   * Retorna os títulos de todos os posts exibidos no feed para validação de ordenação
   */
  async getFeedPostTitles() {
    // Busca os cabeçalhos de notícias no feed brutalista
    const postHeaders = this.page.locator('h3')
    return postHeaders.allTextContents()
  }

  /**
   * Verifica se um post específico está listado e visível
   * @param title Título do post
   */
  async expectPostVisible(title: string) {
    const post = this.page.getByText(title)
    await expect(post).toBeVisible()
  }
}
