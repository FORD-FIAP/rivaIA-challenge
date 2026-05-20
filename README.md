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

## Telas e Funcionalidades

### Início (Home)
A tela principal reúne o chat com a RIVA, um card em destaque ("Carro da Semana"), grade de veículos e seção de favoritos.

- **Chat com RIVA:** conversa guiada com roteiro pré-definido, animação de digitação e mensagens ricas (cards de veículo, gráfico radar, veredito, links e badges)
- **Carro da Semana:** card em destaque com visual diferenciado
- **Grade de Veículos:** listagem em 2 colunas com marca, modelo, motor, score e preço
- **Favoritos:** grade dos veículos marcados como favorito (requer login)

### Veículos
Catálogo completo com busca e filtragem.

- **Busca por texto:** filtra por marca, modelo ou versão em tempo real
- **Filtros avançados:** marca, categoria, modelo e ano com seleção múltipla
- **Ficha do Veículo:** painel deslizante com especificações completas: motor, desempenho, capacidade, dimensões, off-road, tecnologia e segurança, além de scores visuais

### Comparar
Comparativo lado a lado entre dois veículos.

- **Gráfico Radar:** spider chart com 6 eixos — Performance, Conforto, Economia, Off-road, Tecnologia e Segurança
- **Especificações completas:** motorização, capacidade, dimensões, off-road, tech e safety comparados
- **Favoritar comparativo:** salva o par de veículos para acesso rápido pela Sidebar (requer login)

### Perfil
Área do usuário com informações e preferências.

- **Dados do perfil:** nome, apelido e e-mail editáveis
- **Preferências:** combustível e categoria favorita
- **Logout:** encerra a sessão limpando os dados locais

### Login
Acionado por qualquer ação que exija autenticação (favoritar, salvar conversa).

- Cadastro simples: nome completo + e-mail
- Dados persistidos no AsyncStorage

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

## Design System

Tema escuro com ciano como cor de destaque.

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#1E1A1B` | Fundo principal |
| `surface` | `#0F1418` | Cards e painéis |
| `accent` | `#05D3F8` | Destaque, CTAs, indicadores ativos |
| `action` | `#009DDD` | Botões de ação |
| `textPrimary` | `#E8F4FC` | Texto principal |
| `textSecondary` | `#7BB8D8` | Texto de suporte |

Tipografia: **Sora** em 4 pesos (400, 500, 600, 700). Border-radius padronizado de `6px` a `999px` (pill).

---

## Próximos Passos

- [ ] Integrar API de LLM (ex: Claude) no lugar do chat roteirizado
- [ ] Adicionar imagens reais dos veículos
- [ ] Implementar tela de Notificações
- [ ] Adicionar mais veículos ao catálogo (dados via API)
- [ ] Testes unitários nos componentes principais
- [ ] Acessibilidade: labels para screen readers

---

Desenvolvido como desafio técnico para a **Riva**.
