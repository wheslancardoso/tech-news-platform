# 📱 Step 3: Feed Principal & Chameleon Theme

> **Módulo:** Feed de Notícias & Seletor de Mundos  
> **Status:** 🔴 Pendente  
> **Responsável:** *A definir*  
> **Data de Início:** — | **Data de Conclusão:** —

---

## 📝 Instruções para o Grupo
Edite as seções abaixo para descrever como a IA deve construir a tela de Feed (Home) com o seletor de mundos e a reatividade de cores do Chameleon Theme.

---

## 🎯 Requisitos de Negócio
- Carregar os posts da tabela `posts` do Supabase onde `status = 'published'`.
- Implementar o **World Selector** (botão de alternância destacado no topo) para alternar entre os mundos `TECH` e `MUSIC`.
- O feed deve carregar apenas as notícias correspondentes ao mundo ativo e respeitar a ordenação por pontuação (`score`) ou data de publicação.
- Implementar pull-to-refresh para buscar novas publicações.

---

## 🎨 Requisitos de Design
- **Chameleon Theme Reativo**: O aplicativo deve mudar suas cores de destaque baseando-se no mundo selecionado ou na categoria do post em foco na tela:
  - Mundo **TECH**: Destaques e botões em verde neon (`#22C55E`).
  - Mundo **MUSIC**: Destaques em vermelho grunge (`#DC2626`) ou dourado hip-hop (`#EAB308`) conforme a categoria específica.
- Layout de feed brutalista: os posts devem ser renderizados dentro de "cards" com bordas pretas grossas de 2.5px, sombras duras e tipografia Space Grotesk destacada.

---

## 💬 [PROMPT PARA A IA - PREENCHA AQUI]
> **Atenção integrante do grupo:** Substitua este bloco de citação pelo prompt detalhado que você quer passar para a IA gerar a tela de feed e o comportamento do Chameleon Theme.
>
> *Exemplo de prompt:*
> "Crie a feature de feed em /mobile/lib/features/feed. Ela deve conter uma tela principal (Home) com um seletor de mundos no cabeçalho: 'TECH' e 'MUSIC'. Ao selecionar TECH, liste os posts com 'world = TECH' e pinte os elementos visuais do app (títulos de seção, bordas selecionadas) de verde neon. Ao alternar para MUSIC, liste posts com 'world = MUSIC' e mude a cor de destaque para dourado. Os posts devem ser exibidos em cards brutalistas com sombra preta rígida."

---

## 🤖 Instruções para a Execução da IA
1. Ler este arquivo e extrair o prompt da seção acima.
2. Criar a feature `feed` em `/mobile/lib/features/feed/` com a estrutura Feature-First padrão.
3. Desenvolver o gerenciador do Chameleon Theme em `/mobile/lib/shared/theme/` usando `ChangeNotifier` / `Provider` para propagar a mudança de cor global no app quando o mundo ou categoria ativa mudar.
4. Implementar a query de posts no Supabase conectada ao estado do feed.
5. Criar os componentes UI brutais (cards de posts, cabeçalho de multiverso, botões de ação do feed).
6. Adicionar suporte a scroll infinito ou pull-to-refresh.
