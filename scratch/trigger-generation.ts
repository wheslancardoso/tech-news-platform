import { generateNewsletterService } from '../lib/services/newsletter'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function run() {
  console.log('🚀 Iniciando geração da newsletter...')
  try {
    const result = await generateNewsletterService()
    console.log('✅ Newsletter gerada com sucesso!', result)
  } catch (error) {
    console.error('❌ Erro na geração:', error)
  }
}

run()
