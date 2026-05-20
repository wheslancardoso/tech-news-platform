# ADR-001: Arquitetura de Edição Mestra Unificada com Snapshots Imutáveis em JSONB

**Status:** Aceito  
**Data:** 20 de Maio de 2026  
**Autor:** Antigravity (AI Architect)

---

## Contexto
Originalmente, a plataforma Fresh News (antiga Tech News Platform) operava no modelo tradicional de blog técnico, onde notícias capturadas eram tratadas de forma isolada, gerando um feed infinito de posts soltos para o leitor. Essa abordagem gerava sobrecarga mental no assinante e enfraquecia a autoridade editorial da newsletter, tornando-a "mais um feed RSS no email".

Além disso, a distribuição individual de notícias via e-mail ou mensagens assíncronas acarretava em custos elevados de API de email, consultas complexas e redundantes no banco de dados, e problemas de integridade histórica (se uma notícia original fosse editada ou removida após o disparo, o e-mail enviado perderia a referência ou link de arquivo).

---

## Decisão
Decidimos migrar a arquitetura editorial para o modelo de **Edição Mestra Única** gerada por Inteligência Artificial (Map-Reduce no arquivo `lib/services/newsletter.ts`) e moderada pelo administrador. 

As principais decisões técnicas tomadas foram:
1. **Redação Unificada por IA**: O motor de IA agrupa notícias diárias correlacionadas, gera uma nota de relevância (0-100), redige resumos executivos focados e compõe uma introdução unificada para a Edição Diária.
2. **Snapshot Imutável em JSONB**: O conteúdo selecionado para compor a edição do dia é armazenado estruturalmente como um snapshot imutável em um campo `content_json` do tipo `jsonb` na tabela `newsletters`.
3. **Compilação HTML Estática**: O HTML gerado para o corpo do email é compilado e salvo na coluna `html_content` no momento da publicação.

---

## Consequências

### Prós (Trade-offs Positivos)
*   **Imutabilidade Histórica**: A newsletter publicada torna-se independente da tabela `posts`. Se um post for removido do banco para manutenção de espaço ou por solicitação externa, o conteúdo enviado aos leitores e a página de arquivo (`/archive/[id]`) continuam intactos e consistentes.
*   **Performance de Renderização**: As páginas de arquivo e rascunhos podem ser renderizadas instantaneamente no Next.js (SSR ou ISG) puxando apenas uma única linha da tabela `newsletters`, sem a necessidade de realizar JOINS pesados ou subconsultas em centenas de posts relacionados.
*   **Eficiência de IA**: A redução de escopo para uma Edição Mestra centraliza o consumo de tokens das APIs da OpenAI/Gemini para apenas um processo diário unificado (Map-Reduce) em vez de resumos individuais contínuos.

### Contras (Trade-offs Negativos)
*   **Armazenamento Duplicado**: O conteúdo dos posts selecionados é duplicado na tabela `newsletters` (em formato JSON), aumentando ligeiramente o espaço ocupado por registro no PostgreSQL.
*   **Sincronização Bidirecional**: Caso o administrador queira corrigir um erro ortográfico em um post *depois* que ele foi importado para a newsletter, a edição precisará ser feita diretamente no JSONB do rascunho da newsletter, pois o post da tabela `posts` original não atualizará o snapshot automaticamente.
