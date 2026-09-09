/**
 * Cliente do backend de chat (função serverless em `/api/chat`, ver raiz do
 * projeto) que faz proxy pro Gemini Flash. `EXPO_PUBLIC_API_BASE_URL` deve
 * apontar pra URL do deploy (ex: Vercel) depois que o backend estiver no ar —
 * até lá (ou se a chamada falhar por qualquer motivo), retorna `null` e quem
 * chama decide o fallback.
 */
import { ChatMessage } from '../hooks/useConversasRecentes';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string | null> {
  if (!API_BASE_URL) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-10).map((m) => ({ role: m.role, text: m.text })),
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.reply === 'string' ? data.reply : null;
  } catch {
    return null;
  }
}
