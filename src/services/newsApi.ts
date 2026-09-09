/**
 * Cliente do backend de notícias (função serverless em `/api/news`, proxy
 * pra APITube). Igual ao padrão do chat: se `EXPO_PUBLIC_API_BASE_URL` não
 * estiver configurada, ou a chamada falhar por qualquer motivo, retorna
 * `null` — quem chama decide o fallback (o mock estático).
 */
import { Noticia } from '../mock/noticias';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function fetchNoticias(): Promise<Noticia[] | null> {
  if (!API_BASE_URL) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/news`);
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data?.noticias) ? data.noticias : null;
  } catch {
    return null;
  }
}
