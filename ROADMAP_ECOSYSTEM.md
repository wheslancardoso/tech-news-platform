# Fresh News: Roadmap do Ecossistema de Inteligência

Este documento detalha a visão estratégica para a expansão da plataforma Fresh News, transformando-a em uma rede de inteligência verticalizada e personalizada.

## 1. Entrega Personalizada (Workflow n8n)
O coração da retenção de usuários será a capacidade de receber apenas o que é relevante.
- **Mecânica**: O usuário escolhe sub-assuntos no momento da assinatura.
- **Distribuição**: 
  - **WhatsApp**: Envio de um resumo "Micro-Tech" do assunto escolhido + link para a Edição Mestra completa.
  - **Email**: Layout segmentado baseado nas preferências.
- **Tecnologia**: Integração entre Supabase (Preferências), n8n (Lógica de Segmentação) e Resend/WhatsApp Business API.

## 2. Expansão de Verticais (Assuntos)

### 🤖 Fresh News: Tech & Future (Existente)
- **Sub-assuntos**: IA, Cybersecurity, Desenvolvimento, Cloud, Hardware.
- **Estética**: Liquid Glass / Command Center.
- **Cores**: Violeta, Esmeralda, Rose, Cyan.

### 🎵 Fresh News: Culture & Music [EM BREVE]
- **Sub-assuntos**: Hip-Hop, Rock, Indie, Produção Musical, Indústria.
- **Estética Camaleão**:
  - **Hip-Hop**: Tons Gold/Dark, efeitos de vinyl/glitch urbano.
  - **Rock**: Estética Grunge, tons avermelhados/cinza industrial, scanlines pesadas.
- **Foco**: Tendências de áudio, lançamentos e tecnologia musical.

### 🏎️ Fresh News: High Performance [PLANEJADO]
- **Sub-assuntos**: Automobilismo (F1, Endurance), Aviação, Gadgets de Luxo.
- **Estética Camaleão**:
  - **Racing**: Carbon Fiber, Neon Orange/Red, tipografia de velocímetro.
- **Foco**: Engenharia, velocidade e lifestyle de alto nível.

### 💰 Fresh News: Finance & Web3 [PLANEJADO]
- **Sub-assuntos**: Mercado Financeiro, Crypto, DeFi, Macroeconomia.
- **Estética**: Bloomberg Terminal style, Verde Dinheiro / Azul Navy Profundo.

## 3. Próximos Passos Técnicos
1.  **Frontend**: Criar página/modal de "Preferências de Assinatura".
2.  **Database**: Adicionar tabela `subscriber_preferences` vinculada ao email/telefone.
3.  **Serviços**: Adaptar o scraper/gerador para buscar notícias das novas verticais (Music APIs, RSS de Automobilismo).
4.  **Mobile/PWA**: Garantir que as notificações push também sigam a segmentação de assuntos.

---
*Documento gerado em 05/05/2026 para continuidade do desenvolvimento em ambiente remoto.*
