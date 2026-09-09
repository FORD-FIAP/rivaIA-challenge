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

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// A Google descontinua/renomeia modelo com frequência — tenta essa lista em
// ordem até um responder, em vez de depender de um único nome fixo estar
// certo. O primeiro que funcionar é usado; se todos falharem, devolve o
// erro do último.
const MODEL_CANDIDATES = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

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

  let lastError: { status: number; detail: string } | null = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error(`Gemini (${model}) respondeu erro:`, response.status, errorBody);
        lastError = { status: response.status, detail: errorBody };
        continue; // tenta o próximo candidato (modelo pode ter sido descontinuado)
      }

      const data = await response.json();
      const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        lastError = { status: 502, detail: 'Resposta vazia do Gemini' };
        continue;
      }

      res.status(200).json({ reply, model });
      return;
    } catch (err) {
      lastError = { status: 502, detail: err instanceof Error ? err.message : 'Erro de rede' };
    }
  }

  res.status(502).json({ error: 'Falha ao consultar o Gemini em todos os modelos testados', ...lastError });
}
