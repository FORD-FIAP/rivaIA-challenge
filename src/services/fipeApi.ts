/**
 * Integração com a tabela FIPE via BrasilAPI (https://brasilapi.com.br/api/fipe).
 *
 * Marcas e modelos vêm de dados reais e ao vivo. O endpoint de preço exige o
 * código oficial da FIPE (formato "038003-2") e sua fonte upstream é instável —
 * quando cai, retorna 500 com uma mensagem de indisponibilidade temporária.
 * Por isso toda função aqui retorna `null` em vez de lançar erro: quem chama
 * decide o fallback (normalmente, o preço mockado do veículo).
 */

const BASE_URL = 'https://brasilapi.com.br/api/fipe';

export interface FipeBrand {
  nome: string;
  valor: string;
}

export interface FipeModel {
  modelo: string;
  valor: string;
}

export interface FipePrice {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Lista de marcas de carros reais da tabela FIPE. */
export function getFipeBrands(): Promise<FipeBrand[] | null> {
  return safeFetchJson<FipeBrand[]>(`${BASE_URL}/marcas/v1/carros`);
}

/** Lista de modelos (com variações/versões) reais de uma marca da FIPE. */
export function getFipeModels(codigoMarca: string): Promise<FipeModel[] | null> {
  return safeFetchJson<FipeModel[]>(`${BASE_URL}/veiculos/v1/carros/${codigoMarca}`);
}

/**
 * Preço oficial da FIPE por código (ex: "038003-2").
 * Retorna `null` sempre que a fonte estiver fora do ar — nunca lança erro.
 */
export function getFipePrice(codigoFipe: string): Promise<FipePrice | null> {
  return safeFetchJson<FipePrice>(`${BASE_URL}/preco/v1/${codigoFipe}`);
}

// ─── Catálogo de veículos (marca + modelo reais da FIPE) ─────────────────────

import { Vehicle } from '../types/vehicle';

export function buildVehicleFromFipe(brand: FipeBrand, model: FipeModel): Vehicle {
  return {
    id: `${brand.valor}-${model.valor}`,
    marca: brand.nome,
    marcaCodigo: brand.valor,
    modelo: model.modelo,
    modeloCodigo: model.valor,
    versao: model.modelo,
  };
}

/**
 * Cache em memória dos veículos já vistos nesta sessão (marca/modelo reais da
 * FIPE não têm um catálogo estático local pra consultar por id depois — então
 * guardamos aqui todo veículo que passa pela busca/listagem, e favoritos,
 * recentes e "abrir veículo" consultam esse cache em vez de um mock fixo).
 */
const vehicleCache = new Map<string, Vehicle>();

export function cacheVehicle(vehicle: Vehicle): void {
  vehicleCache.set(vehicle.id, vehicle);
}

export function cacheVehicles(vehiclesToCache: Vehicle[]): void {
  vehiclesToCache.forEach(cacheVehicle);
}

export function getCachedVehicle(id: string): Vehicle | undefined {
  return vehicleCache.get(id);
}
