import { ingestPostsService } from '../lib/services/newsletter'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function run() {
  console.log('🚀 Executando ingestão de feeds RSS...')
  try {
    const result = await ingestPostsService()
    console.log('✅ Ingestão concluída com sucesso:', result)
  } catch (error) {
    console.error('❌ Erro na ingestão:', error)
  }
}

run()
