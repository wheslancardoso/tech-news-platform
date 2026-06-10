# 📱 Step 2: Autenticação, Cadastro & Preferências

> **Módulo:** Autenticação & Cadastro de Preferências  
> **Status:** 🔴 Pendente  
> **Responsável:** *A definir*  
> **Data de Início:** — | **Data de Conclusão:** —

---

## 📝 Instruções para o Grupo
Edite as seções abaixo para descrever como a IA deve construir a tela de login, o cadastro e a tela de preferências do usuário sincronizadas com o Supabase.

---

## 🎯 Requisitos de Negócio
- Implementar tela de autenticação (Magic Link ou login convencional por e-mail/senha, conforme definido no prompt do grupo) integrada com o `SupabaseAuth`.
- Redirecionar novos usuários para uma tela de onboarding/preferências.
- Implementar a tela de preferências onde o usuário pode:
  - Ativar/desativar mundos (`TECH` e `MUSIC`).
  - Escolher subcategorias de interesse (ex: IA, Segurança, Hip-Hop, Rock/Indie).
- Sincronizar as preferências diretamente com a tabela `subscribers` no Supabase (colunas `preferences`, `active_worlds` e `phone`).

---

## 🎨 Requisitos de Design
- Tela de login limpa, com estilo brutalista marcante: caixa de texto com bordas pretas de 2.5px, botão de login largo com cor de preenchimento chamativa (ex: verde neon ou amarelo) e efeito de clique rígido.
- Seletor de preferências usando checkboxes ou botões do tipo toggle brutalistas retos.

---

## 💬 [PROMPT PARA A IA - PREENCHA AQUI]
> **Atenção integrante do grupo:** Substitua este bloco de citação pelo prompt detalhado que você quer passar para a IA gerar a tela de login e gerenciamento de preferências.
>
> *Exemplo de prompt:*
> "Crie a feature de autenticação em /mobile/lib/features/auth. Crie uma tela de login simples com um campo de e-mail e botão que envia um Magic Link do Supabase. Após o login, se for o primeiro acesso, envie-o para a tela de Onboarding de preferências onde ele pode selecionar quais categorias de TECH (IA, DEV, SEC, CLOUD) ou MUSIC (HIP_HOP, ROCK_INDIE, ELECTRONICA) ele quer seguir. Salve isso no campo JSON 'preferences' e 'active_worlds' da tabela subscribers do Supabase."

---

## 🤖 Instruções para a Execução da IA
1. Ler este arquivo e extrair o prompt da seção acima.
2. Criar a feature `auth` em `/mobile/lib/features/auth/` com os subdiretórios de apresentação (`presentation/`), domínio/regras (`domain/`) e dados (`infrastructure/`).
3. Implementar a lógica de integração com o `supabase_flutter` para login e atualização de preferências do usuário.
4. Implementar os widgets de interface da tela de Login e tela de Preferências no estilo brutalista.
5. Garantir o tratamento adequado de erros (e-mail inválido, erro de conexão) exibindo alertas brutalistas na interface.
6. Atualizar a navegação no `main.dart` para gerenciar o estado da sessão de usuário (`onAuthStateChange`).
