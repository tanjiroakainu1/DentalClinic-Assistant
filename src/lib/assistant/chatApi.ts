import type { AssistantAudience } from './quickPrompts';

export interface GalaxyChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export async function sendGalaxyChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: { userName?: string; userRole?: AssistantAudience; currentPath?: string },
): Promise<{ reply: string } | { error: string }> {
  let response: Response;

  try {
    response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
  } catch {
    return {
      error:
        'Cannot reach Galaxy AI. Use npm run dev (not preview alone) locally, or deploy API routes on Vercel with OPENROUTER_API_KEY set.',
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      return {
        error:
          'Galaxy AI API was not found. On local dev use npm run dev; on Vercel add OPENROUTER_API_KEY in project settings.',
      };
    }
    return { error: 'Galaxy AI returned an unexpected response. Please try again.' };
  }

  let data: { reply?: string; error?: string };
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    return { error: 'Galaxy AI returned invalid data. Please try again.' };
  }

  if (!response.ok || data.error) {
    return { error: data.error ?? `Galaxy AI error (${response.status}). Please try again.` };
  }

  if (!data.reply?.trim()) {
    return { error: 'Galaxy AI sent an empty response.' };
  }

  return { reply: data.reply };
}

export function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
