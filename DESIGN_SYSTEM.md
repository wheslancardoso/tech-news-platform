# Design System: Binary Broadsheet

Este documento define o padrão visual do projeto **Fresh News**, focado em uma estética "Neo-Broadsheet" que mistura jornalismo clássico com brutalismo digital.

## 1. Conceito Visual (North Star)
- **Autoridade Editorial**: Rejeita designs suaves e arredondados em favor de estruturas rígidas e informativas.
- **Neo-Broadsheet**: Simula a densidade e o peso de um jornal impresso tradicional, mas com a energia do ciberespaço.

## 2. Cores e Tons
- **Fundo (Base)**: `#0D0D0D` (Preto Absoluto/Obsidiana).
- **Contêineres**: `#111111` (Stacking Tonal para profundidade).
- **Sotaques (Destaques)**:
  - **Ciano (#00F0FF)**: Software / IA / Primário.
  - **Vermelho (#FF0000)**: Hardware / Breaking News.
  - **Verde Matrix (#00FF41)**: Cibersegurança / Coding.

## 3. Tipografia
- **Títulos (Headlines)**: `Geist Sans 900` ou `Space Grotesk`. Peso máximo para impacto visual.
- **Corpo (Body)**: `Inter`. Focado em legibilidade máxima contra fundos escuros.
- **Espaçamento**: Letter-spacing reduzido em títulos (-0.02em) para densidade "tinta no papel".

## 4. Layout e Formas
- **Raio de Borda (Border Radius)**: **0px em tudo**. Sem exceções.
- **Regra Editorial**: Uso de bordas sólidas de 2px (`outline`) para separar grandes módulos arquiteturais, em vez de sombras suaves.
- **Navegação**: Efeito Glassmorphism com `backdrop-blur` elevado (20px) e transparência sutil no fundo.

## 5. Fluxo de Apresentação (Numbered Flow)
O protótipo segue um fluxo de 8 passos para demonstrar a jornada completa:
1. **Landing Page**: Proposta de valor.
2. **Boas-vindas**: Retenção e sucesso.
3. **Feed Principal**: Curadoria geral.
4. **Feed Temático**: Segmentação de nicho.
5. **Leitura de Artigo**: Experiência imersiva.
6. **Arquivo**: Valor de longo prazo.
7. **Preferências**: Personalização.
8. **Painel Admin**: Gestão e métricas.
