import { Vehicle } from '../../../types/vehicle';

export const mitsubishiPicapes: Vehicle[] = [
  {
    id: '7',
    marca: 'MITSUBISHI',
    categoria: 'Picape',
    modelo: 'Triton',
    versao: 'Triton HPE S',
    classificacao: 'Picape Média 4x4',
    ano: 2025,
    preco: 'R$330.790,00',
    motorizacao_desempenho: {
      motor: '2.4 Bi-Turbo Diesel',
      potencia: '205',
      torque: '470',
      cambio: 'Automática 6 marchas',
      tanque: '75L',
      combustivel: 'Diesel',
      velocidade_max: '175 km/h',
      aceleracao: 'de 0 à 100 em 9,5s',
      cilindros: '4 cilindros em linha',
    },
    off_road: {
      modos_tracao: '2H, 4H e 4L c/ Super Select 4WD-II',
      diferencial_traseiro_bloqueavel: 'SIM',
      angulo_ataque: 30,
      angulo_saida: 23,
      angulo_rampa: 22,
      profundidade_agua: 700,
      suspensao: 'Independente dianteira / Eixo rígido traseiro',
      controle_descida: 'SIM',
    },
    scores: {
      performance: 7.5,
      conforto: 8.0,
      economia: 8.0,
      offRoad: 9.0,
      tecnologia: 8.5,
      seguranca: 9.0,
    },
  },
];
