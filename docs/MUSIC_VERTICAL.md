# Especificação Técnica: Vertical de Música (Zine Multiverso)

> **Data de criação:** 10/06/2026  
> **Status:** Homologada para Implementação  
> **Escopo:** v2.0 (Apresentação 15/06/2026)

Este documento especifica a taxonomia, mapeamento, lógica de roteamento e visual dinâmico da nova vertical de **Música** do portal Fresh News, que coexiste de forma isolada do mundo **Tech** (Multiverso).

---

## 🎧 1. Lógica do Multiverso

O portal Fresh News agora suporta múltiplos "mundos" independentes. O leitor pode alternar entre eles utilizando o componente `WorldSelector` no cabeçalho.
- Cada post pertence a um mundo específico (`posts.world` = `'TECH'` ou `'MUSIC'`).
- Cada edição da newsletter pertence a um mundo específico (`newsletters.world` = `'TECH'` ou `'MUSIC'`).
- O assinante pode habilitar seus mundos de interesse no cadastro (`subscribers.active_worlds` = `['TECH', 'MUSIC']`).

A ingestão de posts e a publicação de newsletters respeitam essa barreira lógica, permitindo uma curadoria focada em cada assunto.

---

## 🗂️ 2. Taxonomia & Mapeamento de Categorias

Para a interface com o usuário (UI), a vertical de música é simplificada em **4 categorias visíveis**, facilitando a navegação. No entanto, o motor de classificação e roteamento do n8n pode consumir até **6 `category_hint` granulares** das fontes RSS para classificar internamente de forma precisa.

### Tabela de Mapeamento (Classificador ➜ UI)

| Categoria na UI | `category_hint` Agrupados | Tom / Accent Color | Estética & Efeitos Chameleon |
| :--- | :--- | :---: | :--- |
| 🎤 **Hip-Hop & Urbano** | `MUSICA_URBANA`, `RAP_HIPHOP`, `CULTURA_BR` | Gold (`#EAB308`) | *Street / MPC:* Textura de vinil e leves glitches urbanos. |
| 🎸 **Rock & Indie** | `ROCK_INDIE`, `VANGUARDA_CRITICA` | Red (`#DC2626`) | *Xerox / Zine:* Ruído visual de fotocópia e bordas rasgadas. |
| 🎹 **Eletrônica & Synth** | `MUSICA_ELETRONICA` | Purple (`#A855F7`) | *Neon / Grid:* Brilho neon reativo e linhas de grade synthwave. |
| 🌎 **Cultura Geral** | *Fallback (outros hints)* | Orange (`#F97316`) | *Magazine:* Minimalista, tipografia pesada e espaçada. |

---

## ⚡ 3. Ingestão & Roteamento no n8n

O workflow do n8n lê todas as 50 fontes da tabela `sources`. A separação ocorre da seguinte forma:

```
                  [ Ingestão RSS (50 Fontes) ]
                               │
                               ▼
                        [ Switch Node ]
                               │
             ┌─────────────────┴─────────────────┐
             ▼ (category_hint contém MUSIC...)   ▼ (Outros hints)
       [ Rota MUSIC ]                      [ Rota TECH ]
             │                                   │
             ▼                                   ▼
[ Especialistas de Música ]            [ Especialistas Tech ]
- Hip-Hop & Urbano                     - Segurança (SEC)
- Rock & Indie                         - Inteligência Artificial (IA)
- Eletrônica & Synth                   - Desenvolvimento (DEV)
- Cultura Geral                        - Cloud & SRE
             │                                   │
             ▼                                   ▼
[ Insert Post: world = 'MUSIC' ]      [ Insert Post: world = 'TECH' ]
```

### Prompt do Classificador de Música (n8n Node)
```
Você é o Diretor de Triagem Musical da Fresh News.
Seu papel é analisar o título e o conteúdo extraído de uma notícia sobre música e classificá-la em uma das 4 categorias de UI.
Retorne rigorosamente um JSON estruturado da seguinte forma:
{
  "category": "MUSIC",
  "sub_category": "HIP_HOP" | "ROCK_INDIE" | "ELECTRONICA" | "CULTURA",
  "score": <número inteiro de 0 a 100 indicando relevância cultural>,
  "theme_config": {
    "accent_color": "#EAB308" | "#DC2626" | "#A855F7" | "#F97316",
    "ui_effects": string[] (ex: ["vinyl_grain", "street_glitch", "neon_glow", "torn_paper"])
  }
}
```

---

## 📅 4. Frequência de Transmissão

Para evitar fadiga e otimizar custos de IA, a frequência foi definida da seguinte forma:

1. **Ingestão (n8n):** Ocorre de forma contínua, no mesmo ciclo diário da vertical tech. Os posts musicais são classificados, recebem pontuação e são salvos na tabela `posts` com status `'pending'` e `world = 'MUSIC'`.
2. **Edição Compilada (Newsletter):** A edição consolidada da Zine de Música é gerada e enviada de forma **semanal** (toda sexta-feira). A vertical Tech continua com a periodicidade diária/3 dias.
3. **Feed em Tempo Real (Web):** Fica atualizado na rota `/archive?world=MUSIC` à medida que novos posts são aprovados pelo curador no painel administrativo.

---

## 🎭 5. Demonstração e Verificação (Apresentação)

Para validar a vertical de música no dia 15/06:
1. Deve ser inserido manualmente ou via teste pelo menos 5 posts musicais de diferentes subcategorias com `world = 'MUSIC'`.
2. O curador deve criar, aprovar e publicar a **Edição #001 (Especial de Estreia - Mundo da Música)**.
3. O frontend deve apresentar a transição estética brutalista ao alternar a chave do multiverso no cabeçalho do Tech para Music.
