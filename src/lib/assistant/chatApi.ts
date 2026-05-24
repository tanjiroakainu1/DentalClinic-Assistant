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
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });

  const data = (await response.json()) as { reply?: string; error?: string };

  if (!response.ok || data.error) {
    return { error: data.error ?? 'Galaxy AI could not respond. Please try again.' };
  }

  if (!data.reply) {
    return { error: 'Galaxy AI sent an empty response.' };
  }

  return { reply: data.reply };
}

export function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
