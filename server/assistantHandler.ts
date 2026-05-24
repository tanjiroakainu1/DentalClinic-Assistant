import { buildGalaxySystemPrompt } from './galaxySystemPrompt';

export interface AssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantContext {
  userName?: string;
  userRole?: 'admin' | 'doctor' | 'patient' | 'guest';
  currentPath?: string;
}

export interface AssistantResult {
  reply?: string;
  error?: string;
}

const PROVIDER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function publicError(status?: number): string {
  if (status === 429) return 'Galaxy AI is busy right now. Please wait a moment and try again.';
  if (status === 401 || status === 403) return 'Galaxy AI is not available. Ask your clinic admin to check configuration.';
  return 'Galaxy AI could not respond. Please try again.';
}

export async function runAssistantChat(
  messages: AssistantChatMessage[],
  context: AssistantContext = {},
): Promise<AssistantResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return { error: 'Galaxy AI is not configured. Add OPENROUTER_API_KEY to your environment.' };
  }

  const model = process.env.OPENROUTER_MODEL?.trim() || 'google/gemini-2.0-flash-001';
  const trimmed = messages
    .filter((m) => m.content?.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (trimmed.length === 0) {
    return { error: 'Please type a message.' };
  }

  const system = buildGalaxySystemPrompt(context);

  try {
    const response = await fetch(PROVIDER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dental-clinic-galaxy.local',
        'X-Title': 'Dental Clinic Galaxy',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: system }, ...trimmed],
        temperature: 0.65,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      return { error: publicError(response.status) };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return { error: publicError() };
    }

    return { reply };
  } catch {
    return { error: publicError() };
  }
}
