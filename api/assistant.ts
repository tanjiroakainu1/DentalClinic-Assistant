import { runAssistantChat, type AssistantChatMessage, type AssistantContext } from '../server/assistantHandler';

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      messages?: AssistantChatMessage[];
      context?: AssistantContext;
    };

    const result = await runAssistantChat(body.messages ?? [], body.context ?? {});

    if (result.error) {
      return res.status(result.error.includes('not configured') ? 503 : 502).json({ error: result.error });
    }

    return res.status(200).json({ reply: result.reply });
  } catch {
    return res.status(500).json({ error: 'Galaxy AI could not respond. Please try again.' });
  }
}
