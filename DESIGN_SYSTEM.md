# Design System: Liquid Glass Precision Tech

Este documento define o padrão visual premium do projeto **Fresh News**, focado em uma estética de "Centro de Comando de Luxo" que utiliza transparências, profundidade e tipografia de alta precisão.

## 1. Conceito Visual (North Star)
- **Liquid Glass**: Utiliza camadas de vidro translúcido com forte desfoque de fundo (`backdrop-blur: 24px`) para criar uma interface que parece flutuar sobre o conteúdo.
- **Precision Tech**: Substitui o "brutalismo de código" por uma engenharia visual refinada. Rejeita itálicos agressivos e underscores em favor de uma organização técnica e autoritária.

## 2. Cores e Tons
- **Fundo (Void)**: `#0D0D0D` (Grafite Profundo/Obsidiana).
- **Primária (Destaque)**: `#8B5CF6` (Violeta Elétrico Premium).
- **Secundária**: `#A78BFA` (Lavanda Suave para gradientes e detalhes).
- **Superfícies**: Vidro translúcido (branco com 2% a 5% de opacidade) com bordas violetas de 1px.

## 3. Tipografia
- **Títulos (Headlines)**: `Space Grotesk` (Peso 900/Black). Tracking reduzido (`tracking-tighter`) para máxima densidade e autoridade.
- **Corpo (Body)**: `Inter`. Focado em legibilidade e conforto visual.
- **Labels Técnicos (Precision Tech)**: Caixa alta, peso `black`, tamanho reduzido (10px a 11px) e tracking ultra-amplo (`tracking-[0.4em]`). Ex: `SYSTEM // LEVEL_0`.

## 4. Layout e Formas
- **Raio de Borda (Border Radius)**: 
  - Cards e Painéis: `32px` a `48px` (`rounded-[3rem]`).
  - Botões e Badges: `rounded-full` (Estilo Pílula).
- **Glassmorphism**: Todos os contêineres principais devem utilizar `glass-card` com bordas violetas sutis e sombras de brilho interno (`glow`).

## 5. Regras de Ouro
1. **Sem Underscores**: Nunca use `snake_case` em labels visíveis. Use espaços e caixa alta.
2. **Profundidade**: Use gradientes violetas sutis no fundo para simular iluminação indireta.
3. **Consistência de Logo**: O 'N' orgânico (Liquid Logo) deve estar presente em todos os cabeçalhos como âncora da marca.
4. **Precisão**: Labels de metadados devem parecer gravuras técnicas de precisão.

## 6. Padronização de Header
- **Logo**: Gota pulsante violeta integrada à marca 'Fresh News'.
- **Interação**: Navegação flutuante com efeito de vidro que se destaca do conteúdo no scroll.
