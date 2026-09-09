<div align="center">

# RIVA.IA — Sua Assistente Inteligente de Veículos

![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Gemini%20Flash-4285F4?logo=googlegemini&logoColor=white)
![FIPE](https://img.shields.io/badge/Dados-Tabela%20FIPE-00A859)

</div>

---

App de exploração e comparação de veículos, com chat via IA (Gemini Flash) e dados de marca/modelo/preço vindos da tabela FIPE em tempo real.

---
| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.86 + Expo SDK 57 |
| Linguagem | TypeScript 6.0 |
| IA / Chat | Google Gemini Flash, via função serverless própria (Vercel) |
| Dados de veículos | Tabela FIPE em tempo real (BrasilAPI) |
| Fontes | Sora (Google Fonts via Expo) |
| Ícones | Expo Vector Icons (Feather + MaterialCommunity) |
| Gráficos | React Native SVG (radar de atributos customizado) |
| Persistência | AsyncStorage |
| Estado global | React Context API |
| Build final | EAS Build (APK instalável) |

---

## Como rodar

**Pré-requisitos:** Node.js 18+, npm, app **Expo Go** no celular (para testar sem instalar nada).

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npx expo start
```

Escaneie o QR Code com o **Expo Go** (Android) ou a câmera (iOS).

**Alternativa:** a extensão do VS Code `Mobile Preview: Show` também funciona para pré-visualizar sem celular.

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```
EXPO_PUBLIC_API_BASE_URL=https://sua-url-do-backend.vercel.app
```

Sem isso, o chat continua funcionando normalmente, só que com uma resposta de placeholder em vez da IA real.

### Backend (chat com IA)

O proxy para o Gemini Flash vive em [`api/chat.ts`](api/chat.ts), como função serverless da Vercel — mantém a chave de API fora do app. Para publicar o seu próprio:

```bash
npx vercel login
npx vercel
npx vercel --prod
```

E configure `GEMINI_API_KEY` (grátis em [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) nas variáveis de ambiente do projeto na Vercel.

### Build final (APK)

```bash
eas login
eas init
eas build --platform android --profile production
```

Gera um `.apk` instalável direto em dispositivo físico ou emulador, sem depender do Expo Go.

---

## Arquitetura

```
src/
├── screens/          # HomeScreen, VeiculosScreen, CompararScreen, ProfileScreen, LoginScreen
├── components/
│   ├── home/         # Chat, Sidebar, composer, header
│   ├── veiculos/      # Filtro, card de resultado, ficha do veículo
│   ├── comparar/      # Componentes da tela de comparação
│   ├── shared/        # Peças de UI compartilhadas (ex.: filtro de marca)
│   └── splash/        # Animação de abertura
├── context/           # Navigation, Auth, Favorites, Chat, ConversasRecentes, RecentlyViewed
├── services/           # fipeApi.ts (FIPE), rivaChatApi.ts (cliente do backend de chat)
├── hooks/              # useFavorites, useFipePrice, useConversasRecentes, useRecentlyViewed
├── theme/              # Design tokens (cores, tipografia, border-radius)
└── types/              # Interfaces TypeScript (Vehicle)

api/
└── chat.ts             # Função serverless (Vercel) — proxy para o Gemini Flash
```

---

## Integrações reais

- **[Tabela FIPE](https://brasilapi.com.br/docs#tag/FIPE)** (via BrasilAPI) — marca, modelo e preço oficial dos veículos, ao vivo.
- **[Gemini Flash](https://ai.google.dev/)** (Google) — respostas reais no chat, via backend próprio que protege a chave de API.

---

## Equipe

- Beatriz Vieira de Novais — RM554746
- Guilherme Abe — RM554743
- Gustavo Ruiz Vieira Paulino — RM554779
- Mariana Neugebauer Dourado — RM550494
- Victor Pacífico Dias — RM558017

Desenvolvido como desafio técnico para a **Riva**.
