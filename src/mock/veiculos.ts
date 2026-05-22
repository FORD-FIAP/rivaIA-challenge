import { Vehicle } from '../types/vehicle';
import { fordPicapes, featuredVehicle as fordPicapeFeatured } from './Ford/Picape';
import { fordMustangMachE, featuredVehicle as fordEsportivoFeatured } from './Ford/Esportivo';
import {
  fordTerritory,
  fordBroncoSport,
  featuredVehicle as fordSuvFeatured,
} from './Ford/Suv';
import { mitsubishiPicapes, featuredVehicle as mitsuPicapeFeatured } from './Mitsubishi/Picape';
import {
  featuredVehicle as mitsuSuvFeatured,
  pajeroSportVersoes,
  eclipseCrossVersoes,
  outlanderPhevVersoes,
} from './Mitsubishi/Suv';
import {
  featuredVehicle as ramPicapeFeatured,
  ramRampageVersoes,
  ram1500Versoes,
  ram2500Versoes,
  ram3500Versoes,
} from './RAM/Picape';
import { featuredVehicle as bydPicapeFeatured, bydPicapes } from './BYD/Picape';
import { featuredVehicle as bydSuvFeatured, bydSuvs } from './BYD/SUV';
import { featuredVehicle as bydSedanFeatured, bydSedans } from './BYD/Sedan';
import { featuredVehicle as bydHatchFeatured, bydHatchs } from './BYD/Hatch';
import { featuredVehicle as denzaLuxoFeatured, denzaVersoes } from './BYD/Luxo';

const sources: Vehicle[][] = [
  [fordPicapeFeatured],
  fordPicapes,
  [fordEsportivoFeatured],
  fordMustangMachE,
  [fordSuvFeatured],
  fordTerritory,
  fordBroncoSport,
  [mitsuPicapeFeatured],
  mitsubishiPicapes,
  [mitsuSuvFeatured],
  pajeroSportVersoes,
  eclipseCrossVersoes,
  outlanderPhevVersoes,
  [ramPicapeFeatured],
  ramRampageVersoes,
  ram1500Versoes,
  ram2500Versoes,
  ram3500Versoes,
  [bydPicapeFeatured],
  bydPicapes,
  [bydSuvFeatured],
  bydSuvs,
  [bydSedanFeatured],
  bydSedans,
  [bydHatchFeatured],
  bydHatchs,
  [denzaLuxoFeatured],
  denzaVersoes,
];

const all: Vehicle[] = sources.flat().map((v, i) => ({ ...v, id: String(i + 1) }));

/** Veículo em destaque (primeiro da lista — Ranger Raptor). */
export const featuredVehicle: Vehicle = all[0];

/** Demais veículos (sem o destaque, mantendo o contrato anterior). */
export const vehicles: Vehicle[] = all.slice(1);
