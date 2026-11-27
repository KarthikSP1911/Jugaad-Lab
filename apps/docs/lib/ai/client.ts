/**
 * A tiny AI client for the playground. It runs in the visitor's browser with the
 * visitor's own keys; the site never holds a key of its own.
 * Gemini is asked first; Groq is the backup when Gemini is busy, slow or refuses.
 */

export type Provider = 'gemini' | 'groq';
export type Keys = Partial<Record<Provider, string>>;

/** Tried in this order. Models get overloaded (503) or retired (404) without warning. */
export const MODELS: Record<Provider, readonly string[]> = {
  gemini: ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'],
  groq: ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b'],
};

export const PROVIDER_NAMES: Record<Provider, string> = { gemini: 'Gemini', groq: 'Groq' };

const TIMEOUT_MS = 30_000;

export interface Suggestion {
  code: string;
  notes: string;
}

export interface AskOptions {
  keys: Keys;
  /** Instructions that frame every request. */
  system: string;
  /** The conversation so far; the model answers the last user turn. */
  turns: { role: 'user' | 'model'; text: string }[];
  fetch?: typeof fetch;
  models?: Partial<Record<Provider, readonly string[]>>;
  timeoutMs?: number;
}

/** A failure worth showing to the visitor, in plain words. */
export class AiError extends Error {
  constructor(
    message: string,
    /** Providers whose key was refused, so the page can forget those keys. */
    readonly badKeys: Provider[] = [],
  ) {
    super(message);
  }
}

class KeyRefused extends Error {}

/** Asks each model in turn until one returns `{ code, notes }`. */
export async function askAi(
  options: AskOptions,
): Promise<Suggestion & { provider: Provider; model: string }> {
  const providers = (['gemini', 'groq'] as const).filter((provider) => options.keys[provider]);
  if (providers.length === 0) throw new AiError('Add a Gemini or Groq API key first.');
  const failures: string[] = [];
  const badKeys: Provider[] = [];
  for (const provider of providers) {
    for (const model of options.models?.[provider] ?? MODELS[provider]) {
      try {
        return { ...(await askModel(provider, model, options)), provider, model };
      } catch (error) {
        if (error instanceof KeyRefused) {
          badKeys.push(provider);
          failures.push(`${PROVIDER_NAMES[provider]}: ${error.message}`);
          break;
        }
        failures.push(`${model}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  const summary =
    badKeys.length === providers.length
      ? 'The API key was refused. Check it and save it again.'
      : 'The AI is not answering right now. Try again in a minute.';
  throw new AiError(`${summary}\n${failures.join('\n')}`, badKeys);
}

async function askModel(provider: Provider, model: string, options: AskOptions): Promise<Suggestion> {
  const { fetch: send = fetch, timeoutMs = TIMEOUT_MS } = options;
  const { url, init } = (provider === 'gemini' ? geminiRequest : groqRequest)(model, options);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await send(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`no answer in ${timeoutMs / 1000} s`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw failure(response.status, body);
  return parseSuggestion(provider === 'gemini' ? geminiText(body) : groqText(body));
}

function geminiRequest(model: string, { keys, system, turns }: AskOptions) {
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': keys.gemini ?? '' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map(({ role, text }) => ({ role, parts: [{ text }] })),
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { code: { type: 'STRING' }, notes: { type: 'STRING' } },
            required: ['code', 'notes'],
          },
        },
      }),
    },
  };
}

/** Groq speaks the OpenAI chat format. */
function groqRequest(model: string, { keys, system, turns }: AskOptions) {
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keys.groq ?? ''}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          ...turns.map(({ role, text }) => ({
            role: role === 'model' ? 'assistant' : 'user',
            content: text,
          })),
        ],
      }),
    },
  };
}

function geminiText(body: unknown): string {
  type Body = { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const parts = (body as Body | null)?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? '').join('');
}

function groqText(body: unknown): string {
  type Body = { choices?: { message?: { content?: string } }[] };
  return (body as Body | null)?.choices?.[0]?.message?.content ?? '';
}

function failure(status: number, body: unknown): Error {
  const message = (body as { error?: { message?: string } } | null)?.error?.message ?? '';
  if (status === 401 || status === 403 || /api key/i.test(message)) {
    return new KeyRefused('the key was refused');
  }
  return new Error(`HTTP ${status}${message ? ` ${message.slice(0, 120)}` : ''}`);
}

/** Reads `{ code, notes }` from the model's JSON text. */
export function parseSuggestion(text: string): Suggestion {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('the answer was not valid JSON');
  }
  const { code, notes } = (parsed ?? {}) as Partial<Suggestion>;
  if (typeof code !== 'string' || typeof notes !== 'string') {
    throw new Error('the answer had no code');
  }
  return { code: code.trim() ? `${code.trim()}\n` : '', notes: notes.trim() };
}
