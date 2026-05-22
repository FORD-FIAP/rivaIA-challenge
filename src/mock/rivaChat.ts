/**
 * Roteiro mockado do chat com a RIVA.
 *
 * O chat é encenado: a cada mensagem que o usuário envia, avançamos para o
 * próximo par (mensagem do usuário roteirizada + resposta da RIVA) deste
 * script. O texto digitado pelo usuário NÃO é interpretado — ele apenas
 * dispara o próximo turno do roteiro. Edite livremente os turnos abaixo.
 */

export type SpecItem = {
  label: string;
  value: string;
};

export type Badge = {
  label: string;
  highlight?: boolean;
};

export type YouTubeCard = {
  link: string;
};

export type SourceLink = {
  emoji: string;        // ex: '🔵', '📊', '💰', '🔧'
  label: string;        // ex: 'Ford Brasil (oficial)'
  url: string;
  description: string;  // ex: 'site da montadora com ficha técnica e e-book'
};

/** Spec de um lado da comparação, com flag opcional de "vencedor" (destaque). */
export type ComparisonSpec = {
  label: string;
  value: string;
  winner?: boolean;
};

/** Um lado da comparação (um veículo). */
export type ComparisonSide = {
  name: string;          // ex: 'Ford Ranger Raptor'
  specs: ComparisonSpec[];
};

export type Verdict = {
  label: string;
  variant: 'a' | 'b';
};

export type UserMessage = {
  role: 'user';
  text: string;
};

export type RivaVehicleInfo = {
  role: 'riva';
  type: 'vehicle_info';
  title?: string;            // ex: 'Ford Ranger Raptor 2025 — Resumo rápido'
  intro: string;
  text?: string;             // parágrafo complementar
  specs: SpecItem[];
  modeBadges?: Badge[];
  priceNote?: string;
  youtube?: YouTubeCard;
  sources?: SourceLink[];    // lista "Fontes para consultar"
};

export type RivaComparison = {
  role: 'riva';
  type: 'comparison';
  title?: string;            // ex: 'Triton HPE-S vs Ranger Raptor 2025'
  intro: string;
  sides: [ComparisonSide, ComparisonSide];
  summary?: {
    paragraphs: string[];    // parágrafos de "Resumo prático"
    verdict?: string;        // linha final destacada com "Em resumo:"
  };
  verdicts?: Verdict[];      // chips opcionais
  sources?: SourceLink[];
};

export type MetricCard = {
  label: string;
  value: string;
  sub: string;
};

export type RichBadge = {
  type: 'success' | 'warning';
  text: string;
};

export type RichScore = {
  label: string;
  score: number;
  color: 'blue' | 'green' | 'orange';
};

export type RichVideo = {
  title: string;
  channel: string;
  views: string;
  year: number;
};

export type RivaRich = {
  role: 'riva';
  type: 'rich';
  title?: string;
  text?: string;
  cards?: MetricCard[];
  bullets?: string[];
  badges?: RichBadge[];
  scores?: RichScore[];
  video?: RichVideo;
  actions?: string[];
  sources?: SourceLink[];
};

export type RivaMessage = RivaVehicleInfo | RivaComparison | RivaRich;
export type ScriptedMessage = (UserMessage | RivaMessage) & { id: string };

export type ScriptedScenario = {
  id: string;
  pergunta: string;
  messages: ScriptedMessage[];
};

const cenarioRanger: ScriptedMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    text: 'Quero saber mais sobre a Ranger Raptor',
  },
  {
    id: 'msg-2',
    role: 'riva',
    type: 'vehicle_info',
    title: 'Ford Ranger Raptor 2025 — Resumo rápido',
    intro: 'A Ford Ranger Raptor é a versão mais extrema e esportiva de Picapes Ford.',
    text: 'Desenvolvida pela divisão Ford Performance, seu foco principal é o desempenho em alta velocidade em terrenos off-road, rally e estradas de terra.',
    specs: [
      { label: 'Motor', value: 'V6 3.0L Biturbo' },
      { label: 'Potência', value: '397 cv' },
      { label: 'Torque máx.', value: '583 Nm' },
      { label: 'Tração', value: '2H, 4A (Automático), 4H e 4L' },
      { label: 'Suspensão', value: 'FOX Racing Live Valve 2.5"' },
      { label: '0–100 km/h', value: '5,8 s' },
    ],
    priceNote:
      'É a picape média mais cara do Brasil, com valores próximos a R$ 499.000.',
    youtube: {
      link: 'https://www.youtube.com/watch?v=TeLsLoZDDpc',
    },
    sources: [
      {
        emoji: '🔵',
        label: 'Ford Brasil (oficial)',
        url: 'https://www.ford.com.br/picapes/ranger-raptor/',
        description: 'site da montadora com ficha técnica e e-book',
      },
      {
        emoji: '📊',
        label: 'Carro.Blog.br',
        url: 'https://carro.blog.br/',
        description: 'ficha técnica detalhada com análise de consumo e desempenho',
      },
      {
        emoji: '💰',
        label: 'Webmotors (Tabela FIPE)',
        url: 'https://www.webmotors.com.br/',
        description: 'preços de mercado e comparativos',
      },
      {
        emoji: '🔧',
        label: 'Mago dos Carros',
        url: 'https://www.youtube.com/@MagodosCarros',
        description: 'ficha técnica completa com custos de manutenção',
      },
    ],
  },
  {
    id: 'msg-3',
    role: 'user',
    text: 'Ok, gostei. Quero que compare com a Triton HPE-S, gosto de ambas e preciso saber as qualidades e defeitos',
  },
  {
    id: 'msg-4',
    role: 'riva',
    type: 'comparison',
    title: 'Triton HPE-S vs Ranger Raptor 2025',
    intro: 'Aqui está a comparação direta entre as duas:',
    sides: [
      {
        name: 'Mitsubishi Triton HPE-S',
        specs: [
          { label: 'Motor', value: '2.4 biturbo diesel, 4 cilindros' },
          { label: 'Torque', value: '50,9 kgfm' },
          { label: 'Câmbio', value: 'Automático 6 marchas' },
          { label: '0–100 km/h', value: '10,4 segundos' },
          { label: 'Suspensão', value: 'Independente dianteira, eixo rígido traseiro' },
          { label: 'Off-road', value: '7 modos de condução, Super Select II' },
          { label: 'Preço', value: 'R$ 314.990', winner: true },
        ],
      },
      {
        name: 'Ford Ranger Raptor',
        specs: [
          { label: 'Motor', value: 'V6 biturbo gasolina 3.0, 397 cv', winner: true },
          { label: 'Torque', value: '59,4 kgfm', winner: true },
          { label: 'Câmbio', value: 'Automático 10 marchas', winner: true },
          { label: '0–100 km/h', value: '5,8 segundos', winner: true },
          { label: 'Suspensão', value: 'Fox Racing Shox dedicada', winner: true },
          { label: 'Off-road', value: '7 modos de condução, diferencial dianteiro e traseiro bloc.', winner: true },
          { label: 'Preço', value: '~R$ 469.000' },
        ],
      },
    ],
    summary: {
      paragraphs: [
        'A Ranger Raptor é uma máquina de performance off-road e velocidade extrema — quase o dobro de potência, aceleração esportiva e suspensão de competição. Ideal para quem quer o máximo em trilhas rápidas e tem apetite pelo preço.',
        'A Triton HPE-S é mais equilibrada para uso cotidiano: diesel mais econômico, preço ~R$ 154 mil menor, garantia de 5 anos ou 100 mil km e boa capacidade off-road. Atende bem quem alterna entre cidade, estrada e aventuras moderadas.',
      ],
      verdict: 'Raptor para quem quer o extremo. Triton HPE-S para quem quer versatilidade com custo-benefício.',
    },
    verdicts: [
      { label: '⚡ Raptor vence em performance', variant: 'a' },
      { label: '💰 Triton vence em custo', variant: 'b' },
    ],
    sources: [
      {
        emoji: '🔴',
        label: 'Mitsubishi Motors Brasil',
        url: 'https://www.mitsubishimotors.com.br/',
        description: 'site oficial com ficha técnica da Triton',
      },
      {
        emoji: '🔵',
        label: 'Ford Brasil',
        url: 'https://www.ford.com.br/picapes/ranger-raptor/',
        description: 'site oficial da Ranger Raptor',
      },
    ],
  },
];

/* Cenârio Pai de família - mini dolphin  */

const cenarioDolphinMini: ScriptedMessage[] = [
  {
    id: 'dolphin-1',
    role: 'user',
    text: 'Estou pensando em comprar um carro para minha filha que acabou de tirar a habilitação. Que seja pequeno e eletríco.',
  },
  {
    id: 'dolphin-2',
    role: 'riva',
    type: 'rich',
    text: 'Boa escolha de pesquisa! O BYD Dolphin Mini é um dos hatches elétricos mais acessíveis do Brasil e tem um perfil muito interessante para motoristas iniciantes. Veja o panorama geral:',
    cards: [
      { label: 'Preço de entrada', value: 'R$ 115.800', sub: 'versão Standard (2025)' },
      { label: 'Autonomia', value: '340 km', sub: 'ciclo NEDC (carga completa)' },
      { label: 'Potência', value: '95 cv', sub: 'motor elétrico dianteiro' },
      { label: 'Carregamento', value: '30 min', sub: 'até 80% em carregador rápido' },
    ],
    bullets: [
      'Facilidade de direção: câmbio automático por natureza, sem embreagem, aceleração suave — ideal para iniciantes!',
      'Custo mensal baixo: carregando em casa (220V), o custo por km fica entre R$ 0,05 e R$ 0,10 — até 10× mais barato que gasolina',
      'Manutenção reduzida: sem óleo, filtro, velas — revisões mais simples e baratas',
      'Tamanho compacto: 3,99m de comprimento, fácil de estacionar em São Paulo',
    ],
  },
  {
    id: 'dolphin-3',
    role: 'user',
    text: 'E quanto à segurança? Consegue me mostrar mais informações sobre isso?',
  },
  {
    id: 'dolphin-4',
    role: 'riva',
    type: 'rich',
    text: 'Segurança é um ponto importante — e o Dolphin Mini entrega o básico bem feito para o segmento. Confira:',
    badges: [
      { type: 'success', text: '6 airbags' },
      { type: 'success', text: 'ABS + EBD' },
      { type: 'success', text: 'Controle de estabilidade (ESC)' },
      { type: 'success', text: 'Câmera de ré' },
      { type: 'success', text: 'Assistente de partida em rampa' },
      { type: 'warning', text: 'Sem NCAP Brasil ainda' },
    ],
    video: {
      title: 'BYD Dolphin Mini 2025 — Avaliação Completa: segurança, autonomia e custo real',
      channel: 'Canal Fullpower EV',
      views: '312 mil visualizações',
      year: 2025,
    },
    scores: [
      { label: 'Facilidade', score: 9.2, color: 'blue' },
      { label: 'Segurança', score: 7.8, color: 'green' },
      { label: 'Custo mensal', score: 8.8, color: 'blue' },
      { label: 'Custo/benefício', score: 8.5, color: 'orange' },
    ],
    actions: [
      'Comparar com concorrentes',
      'Simulação de custo mensal',
      'Concessionárias em SP',
    ],
  },
];

/** Cenários disponíveis para a RIVA */
export const rivaScenarios: ScriptedScenario[] = [
  {
    id: 'ranger-raptor',
    pergunta: 'Ranger Raptor',
    messages: cenarioRanger,
  },
  {
    id: 'dolphin-mini',
    pergunta: 'BYD Dolphin Mini',
    messages: cenarioDolphinMini,
  },
];

export const rivaScript: ScriptedMessage[] = cenarioRanger;

/** Resposta usada quando o roteiro acaba. */
export const endOfScriptReply: RivaMessage = {
  role: 'riva',
  type: 'vehicle_info',
  intro:
    'Este é um chat de demonstração — o roteiro mockado terminou. Em breve a RIVA responderá perguntas reais com base no seu perfil e na nossa base de veículos.',
  specs: [],
};
