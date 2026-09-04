/** Representa um veículo listado no app */
import { ImageSourcePropType } from 'react-native';

export type VehicleCategory = 'Picape' | 'Sedan' | 'SUV' | 'Esportivos' | 'Hatch' | 'Luxo';

export interface MotorizacaoDesempenho {
  motor: string;
  potencia: string;
  torque: string;
  cambio: string;
  tanque: string;
  combustivel: string;
  velocidade_max: string;
  aceleracao: string;
  cilindros: string;
}

export interface Capacidade {
  capacidade_cacamba: string;
  capacidade_reboque: string;
}

export interface Dimensoes {
  comprimento: number;
  largura: number;
  altura: number;
  entre_eixos: number;
  vao_livre: string;
}

/** Exclusivo para Picape e SUV */
export interface OffRoad {
  modos_tracao: string;
  diferencial_traseiro_bloqueavel: string;
  angulo_ataque: number;
  angulo_saida: number;
  angulo_rampa: number;
  profundidade_agua: number;
  suspensao: string;
  controle_descida: string;
}

export interface TecnologiaSeguranca {
  airbags: number;
  freio_abs: string;
  controle_estabilidade: string;
  frenagem_automatica: string;
  alerta_ponto_cego: string;
  controle_cruzeiro: string;
  ar_condicionado: string;
  central_multimida: string;
  camera_360: string;
  assistente_faixa: string;
  monitoracao_pneus: string;
  teto_solar: string;
  sensor_estacionamento: string;
  carregador_wireless: string;
  ajuste_banco: string;
}

export interface Vehicle {
  id: string;
  marca: string;
  categoria: VehicleCategory;
  modelo: string;
  versao: string;
  classificacao: string;
  ano: number;
  preco: string;
  isFeatured?: boolean;
  /** Fotos do veículo (require locais ou { uri }), exibidas em carrossel na ficha. */
  imagens?: ImageSourcePropType[];
  motorizacao_desempenho?: MotorizacaoDesempenho;
  capacidade?: Capacidade;
  dimensoes?: Dimensoes;
  off_road?: OffRoad;
  tecnologia_seguranca?: TecnologiaSeguranca;
}
