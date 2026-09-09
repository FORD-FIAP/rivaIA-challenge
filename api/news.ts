/**
 * Função serverless (Vercel) que busca notícias reais do setor automotivo
 * via APITube (https://apitube.io) — mantém a chave fora do app mobile.
 *
 * Requer a env var APITUBE_API_KEY configurada no projeto Vercel
 * (Settings > Environment Variables), gerada gratuitamente em apitube.io.
 */

const APITUBE_URL = 'https://api.apitube.io/v1/news/everything';

interface ApitubeArticle {
  title?: string;
  source?: { domain?: string; name?: string };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.APITUBE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'APITUBE_API_KEY não configurada no servidor' });
    return;
  }

  const params = new URLSearchParams({
    title: 'carro OR automóvel OR veículo OR montadora',
    'language.code': 'pt',
    'source.country.code': 'br',
    per_page: '8',
    api_key: apiKey,
  });

  try {
    const response = await fetch(`${APITUBE_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('APITube respondeu erro:', response.status, errorBody);
      res.status(502).json({ error: 'Falha ao buscar notícias', status: response.status });
      return;
    }

    const data = await response.json();
    const articles: ApitubeArticle[] = data?.results ?? data?.data ?? [];

    const noticias = articles
      .filter((a) => a.title)
      .map((a, i) => ({
        id: `apitube-${i}`,
        titulo: a.title as string,
        fonte: a.source?.name ?? a.source?.domain ?? 'Fonte desconhecida',
      }));

    res.status(200).json({ noticias });
  } catch (err) {
    console.error('Erro de rede ao consultar a APITube:', err);
    res.status(502).json({ error: 'Erro de rede ao buscar notícias' });
  }
}
