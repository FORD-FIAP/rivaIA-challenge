/**
 * Preço em tempo real da FIPE para um veículo, com fallback automático pro
 * preço mockado — seja porque o veículo ainda não tem `fipeCode` mapeado,
 * seja porque a fonte da FIPE está fora do ar no momento.
 */
import { useEffect, useState } from 'react';
import { getFipePrice } from '../services/fipeApi';

interface FipePriceResult {
  /** Preço a exibir: o real da FIPE quando disponível, senão o mockado. */
  price: string;
  /** true quando `price` veio ao vivo da FIPE (não é o mock). */
  isLive: boolean;
  loading: boolean;
}

export function useFipePrice(fipeCode: string | undefined, fallbackPrice: string): FipePriceResult {
  const [result, setResult] = useState<FipePriceResult>({ price: fallbackPrice, isLive: false, loading: !!fipeCode });

  useEffect(() => {
    if (!fipeCode) {
      setResult({ price: fallbackPrice, isLive: false, loading: false });
      return;
    }
    let cancelled = false;
    setResult({ price: fallbackPrice, isLive: false, loading: true });
    getFipePrice(fipeCode).then((data) => {
      if (cancelled) return;
      if (data?.valor) {
        setResult({ price: data.valor, isLive: true, loading: false });
      } else {
        setResult({ price: fallbackPrice, isLive: false, loading: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fipeCode, fallbackPrice]);

  return result;
}
