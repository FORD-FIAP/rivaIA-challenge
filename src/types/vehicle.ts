/** Representa um veículo listado no app */
export interface Vehicle {
  id: string;
  brand: string;
  name: string;
  year: number;
  engine: string;
  power: number;       // cv
  torque: number;      // Nm
  consumption: number; // km/l
  price: number;
  /** Caminho local da imagem do veículo */
  image: any;
  isFeatured?: boolean;
}
