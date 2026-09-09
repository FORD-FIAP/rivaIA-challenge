# RIVA — Assistente Inteligente de Veículos

> Desafio técnico de desenvolvimento mobile com React Native + Expo + TypeScript

RIVA é uma assistente de IA para exploração, comparação e descoberta de veículos. O app combina um chat conversacional com catálogo de veículos e comparativo detalhado. 
Um visual tanto para um possível comprador quanto a um consultor que deseja explorar mais o mercado e o que os clientes esperam!

> Nos baseando sempre na opção 1 - Inteligência Competitiva Automotiva

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Linguagem | TypeScript 5.9 |
| Fontes | Sora (Google Fonts via Expo) |
| Ícones | Expo Vector Icons (Feather + MaterialCommunity) |
| Gráficos | React Native SVG (radar chart customizado) |
| Persistência | AsyncStorage |
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
## Telas e Funcionalidades

### Início (Home)
Tela principal do app, organizada como um "hub" da RIVA. Reúne o chat conversacional, destaques editoriais e atalhos para o catálogo e favoritos.

- Tela inicial que concentra o chat, destaques e atalhos. O chat com a RIVA é o elemento central: o usuário digita ou seleciona um dos chips de pergunta sugerida, e a resposta é renderizada a partir do roteiro definido em `src/mock/rivaChat.ts`.

  As mensagens são exibidas pelo componente `RichBubble`, que aceita texto, cards de veículo, gráficos, badges, vídeos e botões de ação no mesmo balão.

  Complementam a tela um card editorial ("Carro da Semana") em `FeaturedCard.tsx`, uma grade de veículos em duas colunas e uma seção de favoritos visível apenas para usuários autenticados. A `Sidebar.tsx` dá acesso à navegação, ao histórico de conversas e aos comparativos salvos.


### Veículos
Catálogo completo com busca, filtragem e ficha técnica detalhada.

- Catálogo com busca textual em tempo real e filtros combináveis por marca, categoria, modelo e ano `FilterModal.tsx`. Cada resultado abre a `VeiculoFicha.tsx` em um painel deslizante, dividida em Motor e Desempenho, Capacidade e Dimensões, Off-road, Tecnologia e Segurança, com scores visuais por categoria e ações de favoritar e comparar.

  Os últimos veículos abertos são registrados automaticamente pelo hook `useRecentlyViewed.ts` para acesso rápido.

### Comparar
- Comparativo lado a lado entre dois veículos, focado em decisão de compra.

  Comparativo lado a lado entre dois veículos selecionados do catálogo. O núcleo da tela é o `RadarChart.tsx` — um spider chart em SVG com seis eixos (Performance, Conforto, Economia, Off-road, Tecnologia, Segurança) que sobrepõe as duas malhas em cores distintas. 

  Abaixo do gráfico, uma tabela compara as especificações linha a linha, destacando o melhor valor em cada métrica. O par de veículos pode ser salvo como comparativo favorito e recuperado pela Sidebar.

### Perfil
- Área do usuário, com dados editáveis e preferências.

  Dados do usuário (nome, apelido e e-mail) e preferências (combustível e categoria favorita), usados para personalizar as respostas da RIVA. Os campos são editáveis e persistidos via `AuthContext.tsx`. O logout limpa o armazenamento local.

### Login

- Tela acionada sob demanda quando uma ação exige autenticação — favoritar um veículo, salvar um comparativo ou guardar uma conversa. O cadastro é intencionalmente simples (nome e e-mail, sem senha) por se tratar de um protótipo, e a sessão é gravada localmente. Após o login, o usuário retorna automaticamente para a ação que disparou o fluxo.

---

## Integrates 

- Beatriz Vieira de Novais - RM554746
- Guilherme Abe - RM554743
- Gustavo Ruiz Vieira Paulino - RM554779
- Mariana Neugebauer Dourado - RM550494
- Victor Pacífico Dias - RM558017

Desenvolvido como desafio técnico para a **Riva**.
