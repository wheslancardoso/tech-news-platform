import { type Page, expect } from '@playwright/test'

export class PreferencesPage {
  constructor(private page: Page) {}

  async goto(subscriberId: string) {
    await this.page.goto(`/preferencias/${subscriberId}`)
  }

  /**
   * Marca ou desmarca uma categoria de interesse
   * @param category Nome da categoria (ex: 'IA', 'SEGURANÇA', 'DEV', 'CLOUD')
   */
  async toggleInterest(category: string) {
    // Busca a categoria pelo value exato do checkbox
    const checkbox = this.page.locator(`input[type="checkbox"][value="${category}"]`)
    await expect(checkbox).toBeAttached()
    await checkbox.click()
  }

  /**
   * Clica no botão brutalista para salvar as preferências
   */
  async save() {
    const saveBtn = this.page.getByRole('button', { name: /gravar_protocolos|gravar|preferência/i })
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
  }

  /**
   * Verifica se a mensagem de confirmação de salvamento reativo foi mostrada
   */
  async expectSuccessToast() {
    // Atesta redirecionamento e ativação do motor de afinidades retro-CRT no arquivo
    await expect(this.page).toHaveURL(/.*archive.*/)
    const activeAlert = this.page.getByText('MOTOR_DE_AFINIDADES_ATIVO')
    await expect(activeAlert).toBeVisible()
  }
}

