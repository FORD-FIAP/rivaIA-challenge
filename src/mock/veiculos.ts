/** Dados mockados de veículos — substituir por API quando backend estiver pronto */
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

// Cada fonte aparece como uma "seção" — adicione novos arrays/featured aqui
// conforme novos arquivos forem sendo criados. Os IDs declarados em cada
// arquivo são IGNORADOS: o agregador reatribui IDs sequenciais (1, 2, 3, ...)
// pra garantir que sejam únicos no app inteiro.
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
];

const all: Vehicle[] = sources.flat().map((v, i) => ({ ...v, id: String(i + 1) }));

/** Veículo em destaque (primeiro da lista — Ranger Raptor). */
export const featuredVehicle: Vehicle = all[0];

/** Demais veículos (sem o destaque, mantendo o contrato anterior). */
export const vehicles: Vehicle[] = all.slice(1);
