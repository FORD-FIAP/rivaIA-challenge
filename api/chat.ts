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

// A Google descontinua/renomeia modelo com frequência, e o mais novo
// (3.8) tem ficado sobrecarregado ("high demand", 503) — por isso ele NÃO
// é o primeiro da lista, mesmo sendo o mais recente. Tenta em ordem até um
// responder; se todos falharem, devolve o erro do último. gemini-2.5-flash
// foi removido da lista — confirmado descontinuado pra contas novas (404).
const MODEL_CANDIDATES = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

const SYSTEM_PROMPT =
  'Você é a RIVA, assistente de IA de um app de veículos. Responda de forma curta, ' +
  'direta e simpática, em português do Brasil, ajudando o usuário a entender e comparar carros. ' +
  'Se não tiver certeza de um dado técnico específico, diga isso claramente em vez de inventar.';

export default async function handler(req: any, res: any) {
  // CORS — sem isso, o navegador (versão web do app) bloqueia a chamada antes
  // mesmo dela chegar aqui. No app nativo isso não é necessário, mas não atrapalha.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

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
    const startedAt = Date.now();
    try {
      const response = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      const elapsedMs = Date.now() - startedAt;

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error(`Gemini (${model}) respondeu erro após ${elapsedMs}ms:`, response.status, errorBody);
        lastError = { status: response.status, detail: errorBody };
        continue; // tenta o próximo candidato (modelo pode ter sido descontinuado)
      }

      const data = await response.json();
      const reply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        lastError = { status: 502, detail: 'Resposta vazia do Gemini' };
        continue;
      }

      console.log(`[chat] modelo=${model} tamanho_resposta=${reply.length} tempo=${elapsedMs}ms`);
      res.status(200).json({ reply, model, elapsedMs });
      return;
    } catch (err) {
      lastError = { status: 502, detail: err instanceof Error ? err.message : 'Erro de rede' };
    }
  }

  res.status(502).json({ error: 'Falha ao consultar o Gemini em todos os modelos testados', ...lastError });
}
