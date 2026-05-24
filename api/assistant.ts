import { runAssistantChat, type AssistantChatMessage, type AssistantContext } from '../lib/assistant/assistantHandler';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end?: (body?: string) => void;
};

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = req.body;
    const body = (typeof raw === 'string' ? JSON.parse(raw) : raw) as {
      messages?: AssistantChatMessage[];
      context?: AssistantContext;
    };

    const result = await runAssistantChat(body?.messages ?? [], body?.context ?? {});

    if (result.error) {
      const code = result.error.includes('not configured') ? 503 : 502;
      return res.status(code).json({ error: result.error });
    }

    return res.status(200).json({ reply: result.reply });
  } catch {
    return res.status(500).json({ error: 'Galaxy AI could not respond. Please try again.' });
  }
}
