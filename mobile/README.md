# Tech News Mobile App

Versão mobile do Tech News construída com **React Native (Expo)**, **TypeScript**, **NativeWind** e **Supabase**.

## 🚀 Como Rodar

### 1. Pré-requisitos
Certifique-se de ter instalado:
- Node.js
- Aplicativo **Expo Go** no seu celular (Android ou iOS)

### 2. Configuração
Entre na pasta `mobile`:
```bash
cd mobile
```

Instale as dependências (se ainda não instalou):
```bash
npm install
```

Crie o arquivo `.env` com suas chaves do Supabase (baseado no `.env.example`):
```bash
cp .env.example .env
```
Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### 3. Executando
Inicie o servidor de desenvolvimento:
```bash
npx expo start
```
Um QR Code aparecerá no terminal. Escaneie com o app Expo Go.

## 📱 Funcionalidades
- **Home Feed**: Lista as últimas edições da newsletter.
- **Leitura**: Renderização nativa otimizada das edições.
- **Login Admin**: Área restrita para editores (validação de senha via API do backend).

## 🔧 Notas de Desenvolvimento
- **Estilização**: Usa Tailwind CSS via `nativewind`.
- **Navegação**: Usa `expo-router` (estrutura de arquivos em `app/`).
- **Autenticação**: Persistência de sessão com `AsyncStorage`.
