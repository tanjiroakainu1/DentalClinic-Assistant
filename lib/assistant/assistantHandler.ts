import { buildGalaxySystemPrompt } from './galaxySystemPrompt.js';

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

const MODEL_FALLBACKS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash-preview',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct:free',
];

function publicError(status?: number, providerHint?: string): string {
  if (status === 429) return 'Galaxy AI is busy right now. Please wait a moment and try again.';
  if (status === 401 || status === 403) {
    return 'Galaxy AI could not authenticate. Check OPENROUTER_API_KEY in your deployment environment.';
  }
  if (providerHint) return providerHint;
  return 'Galaxy AI could not respond. Please try again.';
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  system: string,
  messages: AssistantChatMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; status?: number; hint?: string }> {
  const response = await fetch(PROVIDER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dental-clinic-galaxy.vercel.app',
      'X-Title': 'Dental Clinic Galaxy',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.65,
      max_tokens: 1024,
    }),
  });

  const raw = await response.text();
  let data: {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  } = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    return {
      ok: false,
      status: response.status,
      hint: response.ok ? 'Galaxy AI returned an invalid response.' : publicError(response.status),
    };
  }

  if (!response.ok) {
    const msg = data.error?.message;
    return {
      ok: false,
      status: response.status,
      hint: publicError(response.status, msg ? `Galaxy AI: ${msg}` : undefined),
    };
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return { ok: false, hint: 'Galaxy AI sent an empty response. Try again.' };
  }

  return { ok: true, reply };
}

export async function runAssistantChat(
  messages: AssistantChatMessage[],
  context: AssistantContext = {},
): Promise<AssistantResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return {
      error:
        'Galaxy AI is not configured. Add OPENROUTER_API_KEY to .env (local) or Vercel Environment Variables.',
    };
  }

  const trimmed = messages
    .filter((m) => m.content?.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.trim() }));

  if (trimmed.length === 0) {
    return { error: 'Please type a message.' };
  }

  const system = buildGalaxySystemPrompt(context);
  const preferred = process.env.OPENROUTER_MODEL?.trim();
  const models = preferred
    ? [preferred, ...MODEL_FALLBACKS.filter((m) => m !== preferred)]
    : MODEL_FALLBACKS;

  let lastHint: string | undefined;

  for (const model of models) {
    try {
      const result = await callOpenRouter(apiKey, model, system, trimmed);
      if (result.ok) {
        return { reply: result.reply };
      }
      lastHint = result.hint;
      if (result.status === 401 || result.status === 403) {
        break;
      }
    } catch {
      lastHint = 'Galaxy AI could not reach the server. Check your internet connection.';
    }
  }

  return { error: lastHint ?? publicError() };
}
