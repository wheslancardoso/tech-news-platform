# 📱 Step 1: Setup Inicial, Dependências & Supabase

> **Módulo:** Setup do Projeto & Conectividade  
> **Status:** 🔴 Pendente  
> **Responsável:** *A definir*  
> **Data de Início:** — | **Data de Conclusão:** —

---

## 📝 Instruções para o Grupo
Edite as seções abaixo para descrever como a IA deve configurar o projeto Flutter. Quando terminar, avise o operador do prompt para rodar esta etapa.

---

## 🎯 Requisitos de Negócio
- Inicializar um novo aplicativo Flutter no diretório `/mobile/` (caso não exista).
- Configurar as dependências essenciais no `pubspec.yaml`:
  - `supabase_flutter` para banco de dados e autenticação.
  - `provider` para gerência de estado.
  - `get_it` para injeção de dependências.
  - `google_fonts` para a fonte Space Grotesk.
  - `flutter_dotenv` ou equivalente para chaves do Supabase.
- Configurar o cliente Supabase na inicialização do app (`main.dart`).

---

## 🎨 Requisitos de Design
- Definir a paleta de cores brutalista global (fundo claro/escuro com alto contraste, bordas pretas de 2.5px em cards e botões).
- Configurar a fonte Space Grotesk como a tipografia padrão para os estilos textuais do MaterialApp.

---

## 💬 [PROMPT PARA A IA - PREENCHA AQUI]
> **Atenção integrante do grupo:** Substitua este bloco de citação pelo prompt detalhado que você quer passar para a IA gerar o setup do aplicativo.
>
> *Exemplo de prompt:*
> "Crie um novo projeto Flutter em /mobile chamado fresh_news. Configure o pubspec.yaml com as dependências do Supabase, Provider e Google Fonts. Implemente a injeção de dependência inicial no GetIt e configure o Supabase.initialize usando a URL e a Anon Key do Supabase que estão no arquivo .env.local do projeto web."

---

## 🤖 Instruções para a Execução da IA
1. Ler este arquivo e extrair o prompt da seção acima.
2. Executar a criação do projeto Flutter em `/mobile` utilizando `flutter create --org com.freshnews --project-name fresh_news ./mobile`.
3. Ajustar o `pubspec.yaml` com as dependências solicitadas.
4. Ler as chaves do Supabase no arquivo `.env.local` na raiz do projeto Web e utilizá-las no setup do Flutter.
5. Criar a estrutura básica de pastas em `/mobile/lib/` (`features/`, `shared/theme/`, `shared/widgets/`, `shared/services/`).
6. Criar e estruturar o arquivo `main.dart` realizando o `Supabase.initialize`.
7. Registrar o log do resultado no walkthrough e no console.
