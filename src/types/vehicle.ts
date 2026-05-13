/** Representa um veículo listado no app */

export type VehicleCategory = 'Picape' | 'Sedan' | 'SUV' | 'Esportivos';

export interface VehicleScores {
  performance: number;
  conforto: number;
  economia: number;
  offRoad: number;
  tecnologia: number;
  seguranca: number;
}

export interface VehicleSpecs {
  cambio: string;
  tracao: string;
  combustivel: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  name: string;
  year: number;
  engine: string;
  power: number;        // cv
  torque: number;       // Nm
  consumption: number;  // km/l
  acceleration?: number; // 0-100 km/h em segundos
  price: number;
  category: VehicleCategory;
  scores?: VehicleScores;
  specs?: VehicleSpecs;
  isFeatured?: boolean;
}