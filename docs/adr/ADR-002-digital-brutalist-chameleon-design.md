# ADR-002: Adoção do Design Brutalismo Digital ("The Neo-Broadsheet") e Efeito Camaleão

**Status:** Aceito  
**Data:** 20 de Maio de 2026  
**Autor:** Antigravity (AI UI/UX Designer)

---

## Contexto
O ecossistema de newsletters de tecnologia e portais editoriais é repleto de layouts idênticos e genéricos: cantos arredondados suaves (`rounded-lg`), tons pastéis, fundos cinza-claros e tipografia serifada de baixo contraste. Esse padrão visual satura o leitor, reduzindo o engajamento e a percepção de exclusividade e autoridade do Fresh News.

Buscávamos uma identidade estética impactante, que remetesse à seriedade de jornais impressos clássicos (como os tradicionais "broadsheets" americanos de finanças e política), mas que estivesse fortemente ancorada na modernidade digital dos leitores entusiastas de programação, IA e segurança da informação.

---

## Decisão
Decidimos implementar o design system baseado no **Digital Brutalism (Brutalismo Digital)** aliado a um motor de **Estilo Camaleão Dinâmico**.

As diretrizes técnicas e visuais estabelecidas são:
1. **Raio de Borda Zero (`border-radius: 0px`)**: Absolutamente nenhum componente interativo (inputs, botões, cards, popups) terá cantos arredondados. As bordas devem ser afiadas e angulares.
2. **Grades e Bordas Sólidas Pesadas**: Utilização sistemática de bordas de no mínimo `2px` com cores pretas ou cinza brutalista de alto contraste (`#141414`) para estruturar grids e delimitar seções, simulando colunas impressas.
3. **Tipografia de Alto Impacto**: Uso da fonte **Space Grotesk** com peso extra-bold (`900`) para títulos monumentais de edições e chamadas, e **Inter** para leitura fluida do corpo de notícias.
4. **Sistema Camaleão**: As cores de destaque visual (glows, sombras sólidas projetadas e bordas ativas) mudam dinamicamente por meio de injeção de classes de cor com base na subcategoria da notícia ativa:
    *   `IA` -> `#00F0FF` (Cyber Cyan)
    *   `Dev` -> `#00FF66` (Emerald Green)
    *   `Sec` -> `#FF3B30` (Warning Red)
    *   `Mercado` -> `#D2143A` (Crimson Red)
5. **Componente Core Reativo**: O arquivo `components/ChameleonEffects.tsx` gerencia os efeitos interativos na interface do usuário (UI).

---

## Consequências

### Prós (Trade-offs Positivos)
*   **Branding Memorável**: O design choca positivamente o leitor à primeira vista ("WOW effect"), transmitindo autoridade, alta competência tecnológica e afastando a plataforma de templates pré-fabricados.
*   **Legibilidade Aumentada**: O contraste absoluto obtido pelo dark mode profundo (`#0D0D0D` / `#000000`) com texto em branco puro reduz o cansaço ocular na leitura de resumos executivos densos.
*   **Diferenciação Editorial**: A mudança dinâmica de cores do "Sistema Camaleão" ajuda o leitor a mapear visual e instantaneamente o assunto principal da notícia sem a necessidade de ler tags de texto adicionais.

### Contras (Trade-offs Negativos)
*   **Curva de Customização de CSS**: O uso de bordas pretas rígidas e sombras brutalistas sem suavização requer estilizações sob medida com Tailwind e CSS puro, saindo um pouco do ecossistema de bibliotecas prontas como Radix ou shadcn/ui padrão que dependem fortemente de cantos arredondados e gradientes sutis.
*   **Poluição Visual se Mal Calibrado**: Efeitos de glow dinâmicos e cores muito saturadas no dark mode podem se tornar cansativos se aplicados em excesso. Deve-se manter a maior parte do texto neutra, limitando os efeitos de cores camaleão às bordas de cards e hovers interativos.
