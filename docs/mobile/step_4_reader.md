# 📱 Step 4: Leitor Brutalista & Debate de IAs

> **Módulo:** Leitor Imersivo & Chat de Debate das IAs  
> **Status:** 🔴 Pendente  
> **Responsável:** *A definir*  
> **Data de Início:** — | **Data de Conclusão:** —

---

## 📝 Instruções para o Grupo
Edite as seções abaixo para descrever como a IA deve construir a tela de leitura de posts e a interface de visualização do chat/debate das IAs especialistas.

---

## 🎯 Requisitos de Negócio
- Ao clicar em um post do feed, abrir a tela de leitura detalhada.
- Exibir o título, conteúdo formatado, subcategoria, autor (ou fonte) e pontuação.
- Se o post fizer parte de uma edição de newsletter compilada que possui debate, exibir a seção **"Painel de Debate das IAs"**.
- Puxar o campo `debate_log` (formato JSON/Array) da tabela `newsletters` (ou posts vinculados) e renderizá-lo como uma conversa de chat entre as IAs especialistas que participaram da curadoria.

---

## 🎨 Requisitos de Design
- Layout de leitura imersivo, com tipografia grande e limpa para o corpo do texto (leitura confortável).
- **Debate de IAs**: Renderizar as mensagens das IAs como balões de chat brutalistas (caixas com borda preta sólida, fundos coloridos correspondentes às cores dos especialistas):
  - IA de Segurança: Borda e texto com destaque em vermelho/laranja.
  - IA de Cloud/Dev: Destaques em azul/ciano.
  - IA de Hip-Hop: Destaques em ouro/amarelo.
  - IA de Rock/Indie: Destaques em vermelho escuro.
- Cada IA deve ter seu avatar (ou iniciais em um círculo brutalista) e seu respectivo nome (ex: "Especialista em Criptografia", "Especialista em Hip-Hop").

---

## 💬 [PROMPT PARA A IA - PREENCHA AQUI]
> **Atenção integrante do grupo:** Substitua este bloco de citação pelo prompt detalhado que você quer passar para a IA gerar a tela de leitura e o debate das IAs.
>
> *Exemplo de prompt:*
> "Crie a feature de leitura em /mobile/lib/features/reader. Ela deve conter a tela do artigo com o título grande em Space Grotesk, corpo do texto legível, e abaixo uma seção sanfonada (ExpansionTile brutalista) chamada 'Bastidores do Debate de IAs'. Ao abrir, mostre a conversa de chat vinda do campo debate_log da newsletter correspondente. O chat deve mostrar cada mensagem com um balão brutalista usando a cor específica de cada IA especialista."

---

## 🤖 Instruções para a Execução da IA
1. Ler este arquivo e extrair o prompt da seção acima.
2. Criar a feature `reader` em `/mobile/lib/features/reader/`.
3. Desenvolver os componentes UI da tela de leitura com suporte a rolagem suave.
4. Implementar o widget de renderização do `debate_log`, mapeando cada item do JSON (IA remetente, mensagem, timestamp) para um balão de chat brutalista colorido.
5. Garantir que o Chameleon Theme se adapte à subcategoria do artigo que está sendo lido enquanto o usuário estiver nessa tela.
