# Termo de Abertura do Projeto (TAP) - Tech News Mobile

## 1. Justificativa do Projeto
A versão mobile do **Tech News** surge da necessidade de oferecer uma experiência mais acessível e integrada para os profissionais de tecnologia. Enquanto a versão web atende bem ao consumo via browser e newsletter, o aplicativo mobile permitirá:
- **Engajamento em Tempo Real:** Notificações Push para novas edições críticas.
- **Portabilidade:** Consumo de conteúdo técnico durante deslocamentos ou períodos de pausa.
- **Retenção:** Funcionalidades de "Leitura Offline" e "Favoritos" que incentivam o retorno frequente à plataforma.
- **Conveniência:** Interface otimizada para toque, eliminando a dependência do cliente de e-mail.

## 2. Objetivos
### Geral
Desenvolver e lançar um aplicativo mobile multiplataforma (iOS e Android) que replique e amplie a experiência de curadoria técnica da plataforma Tech News.

### Específicos
- Migrar o fluxo de autenticação e visualização de newsletters para React Native.
- Implementar sistema de notificações push para edições diárias.
- Garantir performance fluida em dispositivos mobile (score Lighthouse/Flashlight > 90).
- Proporcionar uma interface "Dev-to-Dev" limpa e minimalista usando NativeWind.

## 3. Escopo (Alto Nível)
- **Autenticação:** Login seguro via Supabase (E-mail/Senha e Social).
- **Feed de Notícias:** Visualização da edição atual e histórico de edições passadas.
- **Detalhes da Matéria:** Leitor interno otimizado com suporte a links externos.
- **Favoritos:** Salvar matérias para leitura posterior.
- **Configurações:** Gerenciamento de preferências de notificação e tema (Dark Mode).
- **NÃO inclui:** Criação ou edição de newsletters via aplicativo (funcionalidade restrita ao Admin Web nesta fase).

## 4. Stakeholders
- **Desenvolvedores (Usuários Primários):** Interessados em curadoria técnica de alta qualidade sem ruído.
- **Equipe Técnica (Tech News Team):** Responsável pela manutenção e evolução do app.
- **Curadores de Conteúdo:** Stakeholders indiretos que alimentam a inteligência da plataforma.

## 5. Premissas e Restrições
### Premissas
- O backend atual (Supabase) fornecerá as APIs necessárias via SDK.
- O design system será consistente com a identidade visual da versão web (shadcn/ui style).
- A comunidade técnica prefere interfaces minimalistas e rápidas.

### Restrições
- **Tecnologia:** Uso obrigatório de Expo e React Native para agilidade no desenvolvimento.
- **Timeline:** Lançamento da primeira versão funcional no final do Q1 2026.
- **Custo:** Manutenção dentro das camadas gratuitas/pro atuais do Supabase e Vercel.

## 6. Riscos Iniciais
- **Performance:** Complexidade ao renderizar grandes quantidades de JSONB no React Native.
- **Limites de API:** Aumento do consumo de recursos do Supabase devido à frequência de acesso mobile.
- **Aprovação em Lojas:** Desafios técnicos para cumprir as diretrizes da Apple App Store e Google Play Store.
- **Sincronização:** Garantir que o status de leitura/favoritos esteja sincronizado entre Web e Mobile.

## 7. Cronograma Macro
- **Fase 1 (Semana 1-2):** Setup do ambiente Expo, arquitetura de pastas e autenticação básica.
- **Fase 2 (Semana 3-4):** Integração com API do Supabase e visualização do Feed/Newsletters.
- **Fase 3 (Semana 5):** Implementação de Favoritos, Push Notifications e UI Polish.
- **Fase 4 (Semana 6):** Beta testing (TestFlight/Play Store Internal) e correções finais.
- **Fase 5 (Semana 7):** Lançamento oficial.
