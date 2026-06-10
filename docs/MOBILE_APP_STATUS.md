# 📱 Diagnóstico do Ecossistema Mobile: Fresh News & Flutter Port

> **Data da última atualização:** 10/06/2026  
> **Status:** Planejamento Finalizado (Congelado para Fase Pós-Apresentação)

Este documento detalha o status da experiência móvel da plataforma Fresh News, definindo a estratégia de portabilidade da versão Web v2.0 para um **aplicativo móvel nativo em Flutter**.

---

## 🏗️ 1. Estratégia Mobile: App Nativo Flutter

Diferente do plano inicial focado exclusivamente em PWA e WhatsApp, a versão v2.0 estabelece a criação de um **aplicativo nativo compilado em Flutter (iOS e Android)**. A decisão de usar Flutter visa oferecer:
- Performance nativa fluida a 60fps+ para scroll infinito de feeds.
- Suporte nativo completo a push notifications e cache local offline eficiente.
- Compartilhamento nativo no sistema operacional.

### ⏳ Cronograma de Desenvolvimento
Conforme acordado com o usuário, **o desenvolvimento do app Flutter é a última fase do ecossistema**. Toda a codificação Dart/Flutter ocorrerá apenas após a homologação completa e a apresentação da versão Web (15/06/2026).

---

## 🎨 2. UX & Temas Dinâmicos (Chameleon no Flutter)

O aplicativo móvel herdará diretamente o conceito de **Digital Brutalism** e o dinamismo do **Chameleon Engine** da versão web:

- **Estética Brutalista:** Layouts baseados em grades rígidas (`Table` / `CustomPaint`), cantos retos (`BorderRadius.zero`), tipografia de alto impacto (Space Grotesk via Google Fonts) e bordas grossas sólidas (`Border.all(width: 2.0)`).
- **Chameleon Dart Engine:** Implementação de um gerenciador de estado (Provider ou Riverpod) que altera o `ThemeData` do app dinamicamente. Ao rolar para um post de IA, o accent do app se torna Cyber Cyan; ao chavear o multiverso para Música e focar em Hip-Hop, o accent muda para Gold com texturas customizadas.

---

## 🔌 3. Integração e Arquitetura do Flutter App

O aplicativo consumirá diretamente as APIs integradas do Supabase, garantindo integridade e tempo real:

```
[ App Mobile Flutter (Dart) ]
              │
              ├── (HTTPS REST) ──► [ Supabase Data API (Tabelas posts / newsletters) ]
              │
              ├── (Realtime)   ──► [ Supabase Realtime (Notificação de novos posts) ]
              │
              └── (HTTPS REST) ──► [ Supabase Auth (Assinantes via preferências) ]
```

### Escopo de Funcionalidades do App Mobile:
1. **Chaveador de Multiverso (Home):** Seletor rápido no topo permitindo alternar instantaneamente entre o feed TECH e MUSIC.
2. **Feed Reativo:** Lista de posts aprovados ordenados por afinidade local, priorizando categorias selecionadas na aba de preferências.
3. **Leitor Brutalista:** Visualização limpa em formato de texto das matérias completas extraídas.
4. **Gerenciador de Assinatura:** Tela de edição de perfil do assinante (`preferences` e `active_worlds`).
5. **Push Notifications:** Alertas integrados via Edge Functions do Supabase e Firebase Cloud Messaging (FCM).
