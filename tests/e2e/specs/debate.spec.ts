import { test, expect } from '@playwright/test'
import { DebatePage } from '../pages/debate'

test.describe('Interactive AI Debate Mode (Terminal CRT)', () => {
  let debatePage: DebatePage

  test.beforeEach(async ({ page }) => {
    debatePage = new DebatePage(page)
    await debatePage.gotoEdition('ef7f48a4-a108-4faa-b4ad-ba0b5945722a')
  })

  test('deve renderizar o painel de debate CRT no estado pronto inativo e aguardando inicialização', async () => {
    // Console de debate deve existir
    const consoleContainer = await debatePage.getDebateConsole()
    await expect(consoleContainer).toBeVisible()

    // Mensagem de estado inicial "SISTEMA PRONTO PARA INICIALIZACAO" deve estar visível
    await debatePage.expectReadyState()
  })

  test('deve iniciar a digitação typewriter reativa ao clicar em PLAY_DEBATE', async ({ page }) => {
    // Clica em PLAY_DEBATE
    await debatePage.play()

    // O status do debate deve passar a ser ativo e mostrar o indicador de transmissão
    await debatePage.expectActiveTransmission()

    // A mensagem ativa sendo digitada deve ficar visível na tela
    const activeMessage = page.locator('p.text-white')
    await expect(activeMessage).toBeVisible()
  })

  test('deve interromper a execução do debate ao clicar no botão PAUSAR', async ({ page }) => {
    await debatePage.play()
    await debatePage.expectActiveTransmission()

    // Clica em pausar
    await debatePage.pause()

    // O indicador de transmissão ativa deve desaparecer do console
    const activeText = page.getByText('TRANSMITINDO...')
    await expect(activeText).not.toBeVisible()
  })

  test('deve permitir acelerar e alternar velocidades de preenchimento do debate', async ({ page }) => {
    await debatePage.play()
    await debatePage.expectActiveTransmission()

    // Acelera a velocidade
    await debatePage.toggleSpeed()

    // O botão deve transfigurar seu texto reativamente
    const speedBtn = page.locator('button', { hasText: /velocidade/i })
    const speedText = await speedBtn.textContent()
    expect(speedText).toContain('VELOCIDADE: RAPIDA')
  })

  test('deve reiniciar o console de logs ao clicar no botão de reset', async ({ page }) => {
    await debatePage.play()
    await debatePage.expectActiveTransmission()

    // Aguarda um pequeno delay e clica em reset
    await debatePage.reset()

    // O terminal deve voltar ao seu estado inativo "SISTEMA PRONTO PARA INICIALIZACAO"
    await debatePage.expectReadyState()
  })
})
