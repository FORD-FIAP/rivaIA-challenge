# RIVA — Assistente Inteligente de Veículos

> Desafio técnico de desenvolvimento mobile com React Native + Expo + TypeScript

RIVA é uma assistente de IA para exploração, comparação e descoberta de veículos. O app combina um chat conversacional com catálogo de veículos e comparativo detalhado, tudo com design system próprio e tema escuro.

---

## Visão Geral

O desafio propõe a criação de um app mobile com no mínimo 5 telas, uso de `useState`/`useEffect`, persistência com `AsyncStorage`, componentes reutilizáveis, TypeScript e dados mockados ou consumidos de API.

A ideia central foi ir além do mínimo: criamos uma experiência coerente de produto — uma assistente chamada RIVA, que ajuda o usuário a descobrir e comparar veículos via chat, catálogo e gráficos comparativos.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Linguagem | TypeScript 5.9 |
| Fontes | Sora (Google Fonts via Expo) |
| Ícones | Expo Vector Icons (Feather + MaterialCommunity) |
| Gráficos | React Native SVG (radar chart customizado) |
| Persistência | AsyncStorage (mobile) / localStorage (web) |
| Estado Global | React Context API |
| Web | React Native Web com frame de dispositivo |

---

## Como Rodar

**Pré-requisitos:** Node.js 18+, npm, Expo Go (para testar no celular)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npx expo start

```

Após `npm start`, escaneie o QR Code com o app **Expo Go** (Android) ou com a câmera (iOS).

**Outra maneira** - É possivél baixar uma extensão no **VsCode** chamada `Mobile Preview: Show`
Usamos ela também de referência na produção!

---

## Arquitetura

```
src/
├── screens/          # 5 telas principais
├── components/
│   ├── home/         # Componentes da HomeScreen
│   ├── veiculos/     # Componentes da tela Veículos
│   └── comparar/     # RadarChart
├── context/          # NavigationContext, AuthContext, FavoritesContext, ChatContext
├── hooks/            # useFavorites (persistência dual mobile/web)
├── mock/             # Dados mockados de veículos e roteiro do chat
├── theme/            # Design tokens (cores, border-radius)
└── types/            # Interfaces TypeScript para Vehicle
```

---

## Integrates 

- Beatriz Vieira de Novais - RM554746
- Guilherme Abe - RM554743
- Gustavo Ruiz Vieira Paulino - RM554779
- Mariana Neugebauer Dourado - RM550494
- Victor Pacífico Dias - RM558017

Desenvolvido como desafio técnico para a **Riva**.
