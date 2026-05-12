/** Dados mockados de veículos — substituir por API quando backend estiver pronto */
import { Vehicle } from '../types/vehicle';

export const featuredVehicle: Vehicle = {
  id: '1',
  brand: 'FORD',
  name: 'Ranger Raptor',
  year: 2025,
  engine: '3.0L V6 EcoBoost Twin-Turbo',
  power: 397,
  torque: 583,
  consumption: 7.5,
  price: 459900,
  isFeatured: true,
};

export const vehicles: Vehicle[] = [
  {
    id: '2',
    brand: 'FORD',
    name: 'Maverick Hybrid Lariat',
    year: 2025,
    engine: '2.5L Hybrid',
    power: 194,
    torque: 0,
    consumption: 16.2,
    price: 239900,
  },
  {
    id: '3',
    brand: 'FORD',
    name: 'Maverick Lariat Black',
    year: 2025,
    engine: '2.0L EcoBoost',
    power: 253,
    torque: 0,
    consumption: 9.8,
    price: 219990,
  },
  {
    id: '4',
    brand: 'FORD',
    name: 'Maverick Tremor',
    year: 2025,
    engine: '2.0L EcoBoost',
    power: 253,
    torque: 0,
    consumption: 9.2,
    price: 239900,
  },
  {
    id: '5',
    brand: 'FORD',
    name: 'Ranger Raptor',
    year: 2025,
    engine: '3.0L V6 EcoBoost Twin-Turbo',
    power: 397,
    torque: 0,
    consumption: 7.5,
    price: 459900,
  },
];
