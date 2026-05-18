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

export type SourceCard = {
  type: 'video' | 'forum';
  title: string;
  source: string;
  badge: string;
};

export type ComparisonRow = {
  attribute: string;
  raptor: string;
  triton: string;
  winner: 'raptor' | 'triton' | 'tie';
};

export type Verdict = {
  label: string;
  variant: 'raptor' | 'triton';
};

export type UserMessage = {
  role: 'user';
  text: string;
};

export type RivaVehicleInfo = {
  role: 'riva';
  type: 'vehicle_info';
  intro: string;
  text: string;
  specs: SpecItem[];
  modeBadges: Badge[];
  priceNote: string;
  youtube: YouTubeCard;
};

export type RivaComparison = {
  role: 'riva';
  type: 'comparison';
  intro: string;
  comparisonRows: ComparisonRow[];
  verdicts: Verdict[];
  sources: SourceCard[];
  tip: string;
};

export type RivaMessage = RivaVehicleInfo | RivaComparison;

export type ScriptedMessage = (UserMessage | RivaMessage) & { id: string };

/**
 * Sequência fixa de mensagens. Ordem importa:
 * - mensagens com role 'user' são "playback" do que o usuário deveria dizer;
 * - mensagens com role 'riva' são a resposta correspondente.
 *
 * O ChatContext avança um turno do usuário + um turno da RIVA por envio.
 */
export const rivaScript: ScriptedMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    text: 'Informações Ranger Raptor',
  },
  {
    id: 'msg-2',
    role: 'riva',
    type: 'vehicle_info',
    intro: 'A Ford Ranger Raptor é a versão mais extrema e esportiva da picape média da Ford.',
    text: 'Desenvolvida pela divisão Ford Performance, seu foco principal é o desempenho em alta velocidade em terrenos off-road, rally e estradas de terra.',

    specs: [
      { label: 'Motor', value: 'V6 3.0L Biturbo' },
      { label: 'Potência', value: '397 cv @ 5.650 RPM' },
      { label: 'Torque máx.', value: '583 Nm @ 3.500 RPM' },
      { label: 'Transmissão', value: 'AT 10 vel. + paddle shifters' },
      { label: 'Tração', value: '4WD com bloqueios' },
      { label: 'Suspensão', value: 'FOX Racing Live Valve 2.5"' },
      { label: '0–100 km/h', value: '5,8 s' },
      { label: 'Preço', value: 'R$ 499.000' },
    ],
    modeBadges: [
      { label: 'Normal' },
      { label: 'Sport' },
      { label: 'Escorregadio' },
      { label: 'Lama' },
      { label: 'Areia' },
      { label: 'Rock Crawl' },
      { label: 'Baja', highlight: true },
    ],
    priceNote:
      'É a picape média mais cara do Brasil, com valores próximos a R$ 499.000.',
    youtube: {
      link: 'https://www.youtube.com/watch?v=TeLsLoZDDpc',
    },
  },
  {
    id: 'msg-3',
    role: 'user',
    text: 'Ok, gostei. Compare agora com a Trition HPE-S',
  },
  {
    id: 'msg-4',
    role: 'riva',
    type: 'comparison',
    intro:
      'Para uso off-road, aqui está a comparação direta entre Ranger Raptor e Mitsubishi Triton HPE S:',
    comparisonRows: [
      { attribute: 'Motor', raptor: 'V6 3.0L 397 cv', triton: '2.4L 185 cv', winner: 'raptor' },
      { attribute: 'Torque', raptor: '583 Nm', triton: '430 Nm', winner: 'raptor' },
      { attribute: 'Suspensão', raptor: 'FOX Racing 2.5" Live Valve', triton: 'Convencional reforçada', winner: 'raptor' },
      { attribute: 'Modos off-road', raptor: '7 modos (incl. Baja)', triton: 'Lama / Areia / Pedra', winner: 'raptor' },
      { attribute: 'Bloq. diferencial', raptor: 'Diant. + Traseiro', triton: 'Traseiro', winner: 'raptor' },
      { attribute: '0–100 km/h', raptor: '5,8 s', triton: '~11 s', winner: 'raptor' },
      { attribute: 'Preço (aprox.)', raptor: 'R$ 499.000', triton: 'R$ 290.000', winner: 'triton' },
    ],
    verdicts: [
      { label: '⚡ Raptor vence em performance', variant: 'raptor' },
      { label: '💰 Triton vence em custo', variant: 'triton' },
    ],
    sources: [
      {
        type: 'video',
        title: 'Ranger Raptor vs Triton HPE S — DUELO OFF-ROAD no mangue e na lama',
        source: 'YouTube · Canal PicapeBrasil · 1,2M views · 2024',
        badge: 'Vídeo',
      },
      {
        type: 'forum',
        title: 'Trilha pesada no Pantanal — Raptor e Triton: quem foi melhor?',
        source: 'Reddit r/picapesnobrasil · 194 upvotes · 2024',
        badge: 'Fórum',
      },
    ],
    tip: 'Para trilhas técnicas e terrenos extremos, a Raptor é superior em todos os quesitos de performance. A Triton HPE S entrega boa capacidade off-road por um preço significativamente menor — ideal para quem quer aventura sem o investimento premium.',
  },
];

/** Resposta usada quando o roteiro acaba. */
export const endOfScriptReply: RivaMessage = {
  role: 'riva',
  type: 'vehicle_info',
  intro:
    'Este é um chat de demonstração — o roteiro mockado terminou. Em breve a RIVA responderá perguntas reais com base no seu perfil e na nossa base de veículos.',
  text: '',
  specs: [],
  modeBadges: [],
  priceNote: '',
  youtube: { link: '' },
};
