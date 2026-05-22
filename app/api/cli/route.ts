import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Códigos de formatação de cores e estilos ANSI para o terminal
const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    // Cores de texto
    violet: '\x1b[1;35m',  // Roxo para IA / Neuralista
    emerald: '\x1b[1;32m', // Verde para DEV / Arquiteto
    crimson: '\x1b[1;31m', // Vermelho para SEC / Red Team
    cyan: '\x1b[1;36m',    // Ciano para CLOUD / SRE
    yellow: '\x1b[1;33m',  // Amarelo para Manchetes / Quicktakes
    gray: '\x1b[90m',      // Cinza escuro para metadados e links
    white: '\x1b[37m'
}

// Quebra de linha inteligente para ajustar textos ao terminal sem cortar palavras
function wrapText(text: string, width = 76): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
        if ((currentLine + word).length + 1 > width) {
            lines.push(currentLine.trim())
            currentLine = word
        } else {
            currentLine += (currentLine === '' ? '' : ' ') + word
        }
    })
    if (currentLine !== '') {
        lines.push(currentLine.trim())
    }
    return lines
}

// Renderiza uma borda horizontal com largura fixa
function horizontalLine(width = 78): string {
    return '├' + '─'.repeat(width) + '┤'
}

export async function GET(request: Request) {
    console.log('🌟 [CLI API] Recebida requisição programática (terminal)...')

    try {
        const { searchParams } = new URL(request.url)
        const helpParam = searchParams.get('help')

        if (helpParam === 'true') {
            const helpOutput = [
                `${ANSI.bold}┌${'─'.repeat(78)}┐`,
                `│ ${ANSI.violet}THE NEO-BROADSHEET // FRESH NEWS // MANUAL DO TERMINAL (CLI)${ANSI.reset}${' '.repeat(18)}│`,
                `├${'─'.repeat(78)}┤`,
                `│ ${ANSI.bold}USO:${ANSI.reset}${' '.repeat(74)}│`,
                `│   curl -sL http://localhost:3000/api/cli [OPÇÕES]                            │`,
                `│                                                                              │`,
                `│ ${ANSI.bold}OPÇÕES SUPORTADAS:${ANSI.reset}${' '.repeat(60)}│`,
                `│   ?edition=N       Busca uma edição específica pelo número N.                │`,
                `│   ?category=CAT    Filtra notícias por categoria (ex: IA, DEV, SEC, CLOUD)   │`,
                `│   ?help=true       Exibe este manual técnico de ajuda.                       │`,
                `│                                                                              │`,
                `│ ${ANSI.bold}DICA:${ANSI.reset}${' '.repeat(73)}│`,
                `│   Você pode salvar a última edição localmente rodando:                      │`,
                `│   ${ANSI.gray}curl -sL http://localhost:3000/api/cli > freshnews.txt${ANSI.reset}${' '.repeat(20)}│`,
                `└${'─'.repeat(78)}┘${ANSI.reset}`
            ].join('\n') + '\n'

            return new Response(helpOutput, {
                status: 200,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        const editionParam = searchParams.get('edition')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        let query = supabase.from('newsletters').select('*')

        if (editionParam) {
            const edNum = parseInt(editionParam, 10)
            if (isNaN(edNum)) {
                throw new Error('Parâmetro "edition" deve ser um número inteiro.')
            }
            query = query.eq('edition_number', edNum)
        } else {
            query = query.eq('status', 'published').order('edition_number', { ascending: false }).limit(1)
        }

        let { data: newsletter, error } = await query.maybeSingle()

        // Fallback para desenvolvimento local: buscar qualquer edição recente se nenhuma publicada existir
        if (!newsletter && !editionParam) {
            const { data: fallbackData } = await supabase
                .from('newsletters')
                .select('*')
                .order('edition_number', { ascending: false })
                .limit(1)
                .maybeSingle()
            newsletter = fallbackData
        }

        // Se mesmo assim não houver edição, renderiza erro amigável estilizado em CLI
        if (!newsletter) {
            const errorOutput = [
                `${ANSI.bold}┌${'─'.repeat(78)}┐`,
                `│ ${ANSI.crimson}THE NEO-BROADSHEET // FRESH NEWS${ANSI.reset}${' '.repeat(45)}│`,
                `├${'─'.repeat(78)}┤`,
                `│ ${ANSI.crimson}❌ ERRO: NENHUMA EDIÇÃO ENCONTRADA${ANSI.reset}${' '.repeat(44)}│`,
                `│                                                                              │`,
                `│ Nenhuma edição diária do jornal foi gerada ou publicada no banco de dados.   │`,
                `│ Por favor, acesse o painel administrativo para disparar a geração mestre:   │`,
                `│ ${ANSI.gray}➜ URL: http://localhost:3000/admin/newsletters${ANSI.reset}${' '.repeat(32)}│`,
                `└${'─'.repeat(78)}┘${ANSI.reset}`
            ].join('\n') + '\n'

            return new Response(errorOutput, {
                status: 404,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        const edNumber = newsletter.edition_number
        const dateObj = new Date(newsletter.created_at || new Date())
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })

        const categoryParam = searchParams.get('category')?.toUpperCase()

        // Parser do content_json
        const content = typeof newsletter.content_json === 'string' 
            ? JSON.parse(newsletter.content_json) 
            : newsletter.content_json

        const title = content.title || newsletter.title || 'Sem Título'
        const intro = content.intro || newsletter.summary_intro || ''
        const quickTakes = content.quickTakes || []
        let categories = content.categories || []

        if (categoryParam) {
            categories = categories.filter((cat: any) => 
                cat.name.toUpperCase().includes(categoryParam)
            )
        }

        // Montagem brutalista da Saída CLI
        const cliOutput: string[] = []

        // 1. Cabeçalho Principal (Broadsheet Capa)
        cliOutput.push(`${ANSI.bold}┌${'─'.repeat(78)}┐`)
        cliOutput.push(`│${ANSI.reset}  ${ANSI.bold}THE NEO-BROADSHEET${ANSI.reset}${' '.repeat(57)}│`)
        cliOutput.push(`│${ANSI.reset}  ${ANSI.bold}${ANSI.violet}F R E S H   N E W S${ANSI.reset}${' '.repeat(55)}│`)
        cliOutput.push(horizontalLine())
        
        const infoStr = `  Edição #${edNumber}  •  ${formattedDate}  •  Modo: Terminal/CLI`
        cliOutput.push(`│${ANSI.reset}${infoStr}${' '.repeat(78 - infoStr.length)}│`)
        cliOutput.push(`└${'─'.repeat(78)}┘${ANSI.reset}`)
        cliOutput.push('')

        // 2. Título da Edição e Intro
        cliOutput.push(`${ANSI.bold}📰 DESTAQUE DE HOJE: ${title.toUpperCase()}${ANSI.reset}`)
        cliOutput.push('')
        if (intro) {
            wrapText(intro, 76).forEach(line => {
                cliOutput.push(`${ANSI.italic}${ANSI.gray}   ${line}${ANSI.reset}`)
            })
            cliOutput.push('')
        }

        // 3. Quick Takes (Manchetes Rápidas)
        if (quickTakes.length > 0) {
            cliOutput.push(`${ANSI.bold}${ANSI.yellow}⚡ LOGS DE SISTEMA (QUICK TAKES)${ANSI.reset}`)
            quickTakes.forEach((take: string) => {
                cliOutput.push(`  • ${take}`)
            })
            cliOutput.push('')
        }

        // 4. Seções / Categorias (AI, SEC, DEV, CLOUD)
        categories.forEach((cat: any) => {
            const catName = cat.name.toUpperCase()
            
            // Escolhe a cor correspondente de forma camaleônica
            let catColor = ANSI.white
            if (catName.includes('IA') || catName.includes('NEURAL')) catColor = ANSI.violet
            else if (catName.includes('DEV') || catName.includes('ARQUITETO')) catColor = ANSI.emerald
            else if (catName.includes('SEGURANÇA') || catName.includes('SECURITY') || catName.includes('RED TEAM')) catColor = ANSI.crimson
            else if (catName.includes('CLOUD') || catName.includes('SRE')) catColor = ANSI.cyan

            cliOutput.push(`${ANSI.bold}${catColor}// ${catName}${ANSI.reset}`)
            cliOutput.push('')

            cat.items.forEach((item: any) => {
                cliOutput.push(`  ${ANSI.bold}👉 ${item.headline.toUpperCase()}${ANSI.reset}`)
                cliOutput.push('')
                
                wrapText(item.story, 74).forEach(line => {
                    cliOutput.push(`     ${line}`)
                })
                
                cliOutput.push('')
                if (item.link && item.link !== '#') {
                    cliOutput.push(`     ${ANSI.gray}🔗 Ver fonte: ${ANSI.underline}${item.link}${ANSI.reset}`)
                    cliOutput.push('')
                }
            })
        })

        // Rodapé
        cliOutput.push(`${ANSI.gray}─── FIM DA TRANSMISSÃO ───${ANSI.reset}`)
        cliOutput.push(`${ANSI.gray}Fresh News - O manifesto brutalista da engenharia de software.${ANSI.reset}`)
        cliOutput.push(`${ANSI.gray}Volte a ler na web ou no mobile: http://localhost:3000${ANSI.reset}`)
        cliOutput.push('')

        // Retorna a saída em formato de texto plano puro com codificação UTF-8
        return new Response(cliOutput.join('\n'), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-store, must-revalidate'
            }
        })

    } catch (err: any) {
        console.error('❌ [CLI API] Falha na renderização CLI:', err)

        const errorOutput = [
            `${ANSI.bold}┌${'─'.repeat(78)}┐`,
            `│ ${ANSI.crimson}ERROR INTERNO NO SERVIDOR // ROTA CLI${ANSI.reset}${' '.repeat(40)}│`,
            `├${'─'.repeat(78)}┤`,
            `│ ${ANSI.crimson}Falha ao renderizar a edição mestre no console.${ANSI.reset}${' '.repeat(32)}│`,
            `│                                                                              │`,
            `│ ${ANSI.gray}Detalhes: ${err.message || 'Erro desconhecido'}${ANSI.reset}${' '.repeat(Math.max(0, 66 - (err.message || '').length))}│`,
            `└${'─'.repeat(78)}┘${ANSI.reset}`
        ].join('\n') + '\n'

        return new Response(errorOutput, {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
    }
}
