/** Dados mockados de veículos — substituir por API quando backend estiver pronto */
import { fordPicapes, featuredVehicle } from './Ford/Picape';
import { mitsubishiPicapes } from './Mitsubishi/Picape';

export { featuredVehicle };

export const vehicles = [
  ...fordPicapes,
  ...mitsubishiPicapes,
];
