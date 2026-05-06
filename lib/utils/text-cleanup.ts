/**
 * Limpa artefatos de formatação Markdown do texto gerado pela IA
 */
export function cleanAISummary(text: string): string {
  if (!text) return ''
  
  return text
    // Remove negrito Markdown (**)
    .replace(/\*\*/g, '')
    // Remove itálico Markdown (*)
    .replace(/\*/g, '')
    // Remove cabeçalhos Markdown (#)
    .replace(/^#+\s/gm, '')
    // Remove espaços extras
    .trim()
}
