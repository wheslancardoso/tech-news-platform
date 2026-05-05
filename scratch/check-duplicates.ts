import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDuplicates() {
  console.log('🧐 Verificando duplicatas na última newsletter...')
  
  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }

  const content = newsletter.content_json
  const allHeadlines = content.categories.flatMap((cat: any) => cat.items.map((item: any) => item.headline))
  
  console.log('Total de itens:', allHeadlines.length)
  
  const uniqueHeadlines = new Set(allHeadlines)
  console.log('Itens únicos (por headline):', uniqueHeadlines.size)

  if (allHeadlines.length !== uniqueHeadlines.size) {
    console.warn('⚠️ AVISO: Duplicatas detectadas!')
    const counts = allHeadlines.reduce((acc: any, h: string) => {
      acc[h] = (acc[h] || 0) + 1
      return acc
    }, {})
    
    for (const h in counts) {
      if (counts[h] > 1) {
        console.log(`- "${h}" aparece ${counts[h]} vezes`)
      }
    }
  } else {
    console.log('✅ Nenhuma duplicata encontrada por título exato.')
  }

  // Renomeando para a data correta
  await supabase
    .from('newsletters')
    .update({ title: "Edição de 25/04/26 (v2)" })
    .eq('id', newsletter.id)
}

checkDuplicates()
