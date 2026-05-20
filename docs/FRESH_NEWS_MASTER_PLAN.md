# 📰 FRESH NEWS: Master Plan & Status Report

## 🎯 Visão Criativa: "The Neo-Broadsheet"
A Fresh News evoluiu de uma simples newsletter para uma plataforma editorial de alta autoridade. O design segue o conceito de **Digital Brutalism**, inspirado em jornais físicos (broadsheets) com uma roupagem tecnológica moderna.

- **Estética:** Dark mode profundo (#0D0D0D), raio de borda zero (0px radius), tipografia de impacto (Space Grotesk 900) e bordas sólidas pesadas (2px).
- **Sistema Camaleão:** Cores dinâmicas que se adaptam à subcategoria da notícia (IA: Cyan, Dev: Green, Sec: Red, Mercado: Racing Red).

---

## 🛠️ Stack Tecnológica
- **Frontend:** Next.js 15 (App Router), React, TailwindCSS (Vanilla CSS para componentes core).
- **Backend/DB:** Supabase (PostgreSQL, Auth, Edge Functions).
- **IA:** OpenAI (GPT-4o) para curadoria e redação da "Edição Mestra".
- **Distribuição:** n8n (Webhook) + WhatsApp API (Evolution API).
- **Design:** Stitch MCP (Prototipagem Rápida).

---

## ✅ O que já foi feito (Status Atual)

### 1. Geração de Conteúdo (Edição Mestra)
- Implementação do serviço `newsletter.ts` com técnica de Map-Reduce para processar dezenas de notícias e gerar um JSON estruturado.
- Sistema de categorização automática via IA.

### 2. Design & Branding
- Redesign total do template de e-mail e da página de arquivo (`app/archive/[id]`).
- Implementação do `ChameleonEffects.tsx` para efeitos de hover e bordas dinâmicas.

### 3. Motor de Distribuição & Preferências (Fase 5)
- **Captura de WhatsApp:** Atualização do formulário de inscrição para coletar o telefone.
- **Central de Preferências:** Rota `/preferencias/[id]` funcional onde o usuário escolhe seus nichos de interesse.
- **Service Distribution:** O motor `lib/services/distribution.ts` recorta a Edição Mestra e gera mensagens personalizadas para cada assinante.
- **Trigger de Publicação:** Ao clicar em "Publicar" no Admin, o sistema dispara automaticamente o envio via Webhook para o n8n.

### 4. Prototipagem Mobile (Stitch)
- **Feed Home:** Visualização diária.
- **Article View:** Leitura de posts individuais.
- **Manage Preferences:** Interface de escolha de categorias.
- **Admin Mobile Dashboard:** Painel neutro para aprovação/rejeição de edições.
- **Archive Explorer:** "Banca de jornal" com histórico.
- **Subscribe Success:** Onboarding de novos membros.

---

## 📱 Protótipo Mobile (Visualização)

| Tela | Link do Protótipo (Stitch) |
| :--- | :--- |
| **Home Feed** | [Ver Imagem](https://lh3.googleusercontent.com/aida/ADBb0uhxJp7p8PGTvIMrkD7N3TlxTyF7Dr2C1Z4_Er23gcNM54qGBuJjXlFwFIga-04bFGjeozt6ToiAozmW2eCP3xwtKzoJyubQBbju1FiQRvRR4q8f3og1TJMgk-8knvSvMNdcPECbhQQfugG-oS_XGfmx7D1F_6ZFmns4-jdbaR-ycaCHEigrHQngR2jiJCLprEyyYZwEf0KDSzO4GF47nzAnZ7sJheFw82EShOl_pv81ASqcU1OFh0dwa22-) |
| **Admin Dashboard** | [Ver Imagem](https://lh3.googleusercontent.com/aida/ADBb0uh6z7-q425bZpdjIZw4xsjskDi9WPEipa7DMjfTJ1E60Ec6hUK14eW4G8UMk_RDRnkgrDjHteYNmrx67pnH2VHSi8LUGQWh__516RWJivxNP_YG4WJQyLxM4lHS_szmG6-EmPaHHXnwTBXf8d8sCKOhKUsR6k3wChAIGwkKDnlf0NLjcV2PRM_3DyqC5Hd9RMolOIAplupaRirKU2ZcyyERqwjhxeCZCva8XZARFp_-fGwx3DcWLzhEJR7C) |
| **Archive Explorer** | [Ver Imagem](https://lh3.googleusercontent.com/aida/ADBb0ugOdKlnNOS5HWo2v1c8SID6njuAuAgt6fgrMov8ziRbegkl9PH_tXqCjf4ZR8NxB-jnRGI6pX_o3dkywZpv4gpNjQEfczZMgJSr582l7FKqnLs7sgE0FwAe82yncWSUUqoykbcKHPFCFxA_gshbBwC9b0OZeoR-u-ibRqHnrbTaPWka2e6e8iyKYeHQ959fvnQAiR1xeftr6NFCtsebmpb5FXJ_yV7hr8rkH5TyX3E3QE793k3aQ1ky1k4_) |
| **Manage Preferences**| [Ver Imagem](https://lh3.googleusercontent.com/aida/ADBb0ug912DkNfkyI_fLsREA2MqLl-SQ-xQjkEkyxJ3DwhCnYvcpc2atc0_-4hWdSJkQvOhKDTjz1J_uMHsSejwhsv98ita2lF4sl316JntTkgw13I4uK-Uy-DqTx_XkSaSaDTFxNuwptSYeNkqiNHBy5PEAdGChldFyfa8Jg3pGDehVmOV2R2ec1AO12WWqaeScTKYzWczwfnZ7ofPFiMNFgVh6dsfDgKCQx5dG0FtwG3NNIPdSqQSS23p_dm4) |

---

## 🚀 Próximos Passos (Backlog)

### Alta Prioridade
1.  **Rodar Migration SQL:** Aplicar o arquivo `supabase/migrations/20260423164000_add_phone_to_subscribers.sql` no banco para habilitar o campo de WhatsApp.
2.  **Configurar n8n:** Criar o workflow para receber o Webhook de distribuição e disparar as mensagens.
3.  **Implementação Mobile Responsiva:** Traduzir as telas do Stitch para código Next.js (Focar na Home e Admin).

### Evolução (Fase 6)
- **Sistema de Busca:** Adicionar barra de pesquisa no Archive.
- **PWA:** Transformar o site em um Web App instalável para simular a experiência de um aplicativo nativo.
- **Analytics:** Painel de cliques para saber quais categorias são mais lidas.

---

## 📜 Histórico & Contexto da Conversão
- **Início:** O projeto era focado em posts individuais.
- **Mudança de Rumo:** Decidimos migrar para o modelo de **Edição Mestra** (Newsletter completa diária).
- **Identidade:** Definimos o estilo "Digital Broadsheet" para fugir do design genérico de tech blogs.
- **Estratégia de Produto:** Focamos na segmentação inteligente (o usuário recebe o que quer, mas tudo nasce de uma única curadoria mestre).

---
*Relatório gerado em 23/04/2026 por Antigravity (IA).*
