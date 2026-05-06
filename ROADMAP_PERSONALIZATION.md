# 🚀 Roadmap: Hiper-Personalização Fresh News

Este documento detalha a arquitetura para a transição do Fresh News de uma newsletter generalista para um sistema de entrega de inteligência personalizada via WhatsApp/E-mail, utilizando ML assistido por IA.

## 🎯 Objetivo Central
Entregar para cada usuário apenas o conteúdo que ele deseja, filtrado por micro-nichos (ex: apenas notícias de IA dentro de TECH, ou apenas Hip-Hop dentro de Música), aumentando a relevância e o engajamento.

---

## 🏗️ Arquitetura de Dados

### 1. Enriquecimento Granular (n8n Specialists)
Os especialistas de IA no n8n devem agora extrair **Tags** específicas além do resumo.
- **Estrutura do Item:**
  ```json
  {
    "title": "...",
    "summary": "...",
    "category": "TECH",
    "tags": ["IA", "LLM", "OpenSource"], // Micro-nichos
    "whatsapp_summary": "..."
  }
  ```

### 2. Perfil de Interesse do Usuário (Supabase)
Nova tabela para armazenar o "DNA de Interesse" de cada assinante.
- **Tabela `user_preferences`**:
  - `user_id` / `whatsapp_number`
  - `interests`: `JSONB` (ex: `{"TECH": ["IA"], "MUSICA": ["HIP-HOP"]}`)
  - `frequency`: `daily` | `weekly`
  - `delivery_channel`: `whatsapp` | `email`

---

## 🎨 Expansão de Domínio: Edição de Música

Para suportar o novo nicho de Música/Hip-Hop, o Design System deve ser expandido:
- **Tema: Urban Brutalist**
  - **Paleta**: `#EAB308` (Amarelo Vibrant), `#000000` (Pitch Black).
  - **Efeitos**: `vinyl_grain`, `street_glitch`, `poster_texture`.
  - **Identidade**: Tipografia ultra-bold, estilo pôster de rua.

---

## 🧠 Motor de Disparo Personalizado (O "Cérebro")

O fluxo de disparo (via n8n ou Lambda) seguirá este algoritmo:
1. **Trigger**: Newsletter é publicada.
2. **Fetch**: Recupera todos os `items` e suas `tags`.
3. **Match**: Para cada usuário em `user_preferences`:
   - Compara as `tags` da notícia com os `interests` do usuário.
   - Gera um "Newsletter Pack" único apenas com os matches.
4. **Envelopamento**: Se houver conteúdo relevante, envia o `whatsapp_summary` personalizado.

---

## 🛠️ Próximos Passos Técnicos

1. [ ] **Update DB Schema**: Criar tabela de preferências.
2. [ ] **Update n8n Prompts**: Adicionar extração de `tags` (JSON array).
3. [ ] **Admin UI**: Adicionar campo de `tags` no editor de notícias.
4. [ ] **Theme Expansion**: Implementar o tema `URBAN_BRUTALIST` no component `ChameleonEffects`.
5. [ ] **Preference Center**: Criar página `/preferences` para o usuário configurar seus filtros.

---

> **Status:** Documentação Inicial em 06/05/2026
> **Responsável:** IA Art Director + ML Specialist
