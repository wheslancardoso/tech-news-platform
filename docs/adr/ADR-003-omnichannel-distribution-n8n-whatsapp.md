# ADR-003: Distribuição Omnichannel Personalizada via n8n, WhatsApp e Resend

**Status:** Aceito  
**Data:** 20 de Maio de 2026  
**Autor:** Antigravity (AI System Integrator)

---

## Contexto
O engajamento tradicional de newsletters baseadas puramente em e-mail tem sofrido declínio geral de taxa de abertura devido a filtros de spam agressivos, abas de promoção lotadas e desatenção do usuário. Para notícias de tecnologia em tempo real, os leitores necessitam de canais mais dinâmicos, síncronos e de fácil acesso mobile.

Por outro lado, o disparo de mensagens em massa diretamente por servidores Next.js via HTTP ou conexões persistentes é instável, propenso a limites de timeout e difícil de gerenciar filas de retentativas. Além disso, a personalização de conteúdo de acordo com o nicho de interesse de cada assinante (segmentação) exige um processamento assíncrono robusto para não sobrecarregar o banco de dados principal no momento do trigger de publicação.

---

## Decisão
Decidimos implementar uma infraestrutura de **distribuição omnichannel híbrida** e assíncrona desacoplada do servidor Next.js principal, utilizando **Resend** para e-mails e a combinação de **n8n** com **Evolution API** para distribuição via WhatsApp.

Os pilares técnicos da decisão são:
1. **Motor de Recorte na Lib (`lib/services/distribution.ts`)**: O Next.js é responsável apenas por calcular a segmentação em memória (agrupar quais posts da Edição Mestra pertencem a quais usuários com base no array `preferred_categories` de cada assinante) e formatar o corpo específico do e-mail e do WhatsApp para cada assinante.
2. **Envio de Email Direto via Resend**: O e-mail formatado é enviado pelo Next.js de forma assíncrona usando o SDK do Resend.
3. **Desacoplamento por Webhook (n8n)**: Em vez de disparar as mensagens do WhatsApp diretamente pelo Next.js, o servidor envia uma requisição HTTP webhook com a payload estruturada contendo a lista de contatos segmentados para o **n8n**.
4. **Orquestração de Fila e Retentativas (n8n)**: O n8n gerencia a fila de mensagens, o fluxo de delays inteligentes (evitando bloqueios por spam no WhatsApp) e aciona a **Evolution API** para o disparo final.

---

## Consequências

### Prós (Trade-offs Positivos)
*   **Alta Taxa de Entrega e Abertura**: O WhatsApp atinge taxas de abertura próximas a 98%, garantindo que os assinantes consumam as notícias mais quentes do dia instantaneamente no celular.
*   **Robustez e Fila**: O n8n absorve toda a carga de requisições de IO assíncrono. Se a API do WhatsApp ou o número ficarem offline temporariamente, a fila de reenvio fica retida no n8n sem afetar a estabilidade da aplicação Next.js.
*   **Segmentação Transparente**: O motor calcula quais categorias enviar antes do trigger, economizando banda e garantindo que o usuário só receba o que ele explicitamente assinalou na Central de Preferências (`/preferencias/[id]`).

### Contras (Trade-offs Negativos)
*   **Infraestrutura Adicional**: A arquitetura requer a manutenção e hospedagem de dois serviços externos de backend (o servidor de automação n8n e a instância da Evolution API/WhatsApp), aumentando os custos e a complexidade de DevOps para implantação em produção.
*   **Risco de Banimento (WhatsApp)**: O disparo automatizado no WhatsApp é passível de bloqueios da Meta se os usuários denunciarem como spam. Para mitigar isso, o link de descadastro rápido (`/unsubscribe`) deve estar em extremo destaque em todas as mensagens do WhatsApp, e o tempo de delay entre envios no n8n deve ser configurado com intervalos orgânicos de variação de segundos.
*   **Consistência Eventual**: O e-mail e o WhatsApp podem não chegar exatamente no mesmo segundo devido aos atrasos de processamento nas filas do n8n, caracterizando um cenário de consistência eventual na distribuição da newsletter.
