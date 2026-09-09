/**
 * Função serverless (Vercel) que faz proxy pro Gemini Flash — mantém a chave
 * da API fora do app mobile. Espera POST { message: string, history?: { role: 'user'|'riva'; text: string }[] }.
 *
 * Requer a env var GEMINI_API_KEY configurada no projeto Vercel (Settings > Environment Variables),
 * gerada gratuitamente em https://aistudio.google.com/apikey.
 */

interface ChatHistoryItem {
  role: 'user' | 'riva';
  text: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT =
  'Você é a RIVA, assistente de IA de um app de veículos. Responda de forma curta, ' +
  'direta e simpática, em português do Brasil, ajudando o usuário a entender e comparar carros. ' +
  'Se não tiver certeza de um dado técnico específico, diga isso claramente em vez de inventar.';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
    return;
  }

  const body: ChatRequestBody = req.body ?? {};
  if (!body.message || typeof body.message !== 'string') {
    res.status(400).json({ error: 'Campo "message" é obrigatório' });
    return;
  }

  const history = body.history ?? [];
  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Entendido, vou ajudar assim.' }] },
    ...history.map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    })),
    { role: 'user', parts: [{ text: body.message }] },
  ];

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error('Gemini respondeu erro:', response.status, errorBody);
      res.status(502).json({ error: 'Falha ao consultar o Gemini', status: response.status, detail: errorBody });
      return;
    }

    const data = await response.json();
    const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      res.status(502).json({ error: 'Resposta vazia do Gemini' });
      return;
    }

    res.status(200).json({ reply });
  } catch {
    res.status(502).json({ error: 'Erro de rede ao consultar o Gemini' });
  }
}
