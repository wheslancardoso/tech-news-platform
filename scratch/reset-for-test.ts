import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function resetAndRun() {
  console.log('🔄 Resetando status dos posts para teste de deduplicação...')
  
  const { error } = await supabase
    .from('posts')
    .update({ status: 'approved' })
    .eq('status', 'published') // Resetando os que acabei de processar

  if (error) {
    console.error('❌ Erro ao resetar:', error.message)
    return
  }

  console.log('✅ Status resetado. Iniciando nova geração...')
}

resetAndRun()
