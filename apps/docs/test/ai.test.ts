import { describe, expect, it } from 'vitest';
import { compileProblems, fix, languageGuide, translate } from '../lib/ai/assistant';
import { AiError, askAi, parseSuggestion } from '../lib/ai/client';

const json = (code: string, notes: string) => JSON.stringify({ code, notes });

/** A Gemini response carrying `{ code, notes }`. */
function gemini(code: string, notes = '- theek kiya') {
  const text = json(code, notes);
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }));
}

/** A Groq (OpenAI-format) response carrying `{ code, notes }`. */
function groq(code: string, notes = '- groq ne kiya') {
  return new Response(JSON.stringify({ choices: [{ message: { content: json(code, notes) } }] }));
}

function apiError(status: number, message: string) {
  return new Response(JSON.stringify({ error: { message } }), { status });
}

interface Call {
  url: string;
  headers: Record<string, string>;
  body: { model?: string; contents?: { role: string }[]; messages?: { role: string }[] };
}

/** A fake fetch that replays responses and records each request. */
function replay(...responses: (Response | 'hang')[]) {
  const calls: Call[] = [];
  const fake = (async (url: string, init: RequestInit) => {
    calls.push({
      url,
      headers: init.headers as Record<string, string>,
      body: JSON.parse(String(init.body)),
    });
    const next = responses.shift() ?? apiError(500, 'no more responses');
    if (next !== 'hang') return next;
    return new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError')),
      );
    });
  }) as typeof fetch;
  return { fetch: fake, calls };
}

const ask = (fetch: typeof globalThis.fetch, keys = { gemini: 'g', groq: 'q' }) => ({
  keys,
  system: 's',
  turns: [{ role: 'user' as const, text: 'hi' }],
  fetch,
  models: { gemini: ['g1', 'g2'], groq: ['q1'] },
  timeoutMs: 20,
});

describe('ai client', () => {
  it('moves to the next Gemini model when one is overloaded', async () => {
    const { fetch, calls } = replay(apiError(503, 'high demand'), gemini('bolo(1);'));
    const result = await askAi(ask(fetch));
    expect(result).toMatchObject({ code: 'bolo(1);\n', provider: 'gemini', model: 'g2' });
    expect(calls.map(({ url }) => url.split('/models/')[1])).toEqual([
      'g1:generateContent',
      'g2:generateContent',
    ]);
    expect(calls[0]?.headers['x-goog-api-key']).toBe('g');
  });

  it('falls back to Groq when every Gemini model fails or hangs', async () => {
    const { fetch, calls } = replay(apiError(503, 'busy'), 'hang', groq('bolo(2);'));
    const result = await askAi(ask(fetch));
    expect(result).toMatchObject({ code: 'bolo(2);\n', provider: 'groq', model: 'q1' });
    const last = calls[2];
    expect(last?.url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(last?.headers.Authorization).toBe('Bearer q');
    expect(last?.body.model).toBe('q1');
    expect(last?.body.messages?.map(({ role }) => role)).toEqual(['system', 'user']);
  });

  it('skips a provider whose key is refused, and uses the other', async () => {
    const { fetch, calls } = replay(apiError(400, 'API key not valid.'), groq('bolo(3);'));
    const result = await askAi(ask(fetch));
    expect(result.provider).toBe('groq');
    expect(calls).toHaveLength(2);
  });

  it('reports refused keys so the page can forget them', async () => {
    const { fetch } = replay(apiError(401, 'Invalid API Key'));
    const failure = askAi(ask(fetch, { gemini: '', groq: 'bad' }));
    await expect(failure).rejects.toBeInstanceOf(AiError);
    await expect(failure).rejects.toMatchObject({ badKeys: ['groq'] });
    await expect(failure).rejects.toThrow(/key was refused/);
  });

  it('lists every model when all of them fail', async () => {
    const { fetch } = replay(apiError(503, 'busy'), apiError(429, 'quota'), apiError(500, 'down'));
    await expect(askAi(ask(fetch))).rejects.toThrow(
      /g1: HTTP 503 busy\ng2: HTTP 429 quota\nq1: HTTP 500 down/,
    );
  });

  it('needs at least one key', async () => {
    const noKeys = ask(replay().fetch, { gemini: '', groq: '' });
    await expect(askAi(noKeys)).rejects.toThrow(/key first/);
  });

  it.each([
    ['not json', /JSON/],
    ['{"notes":"x"}', /no code/],
  ])('rejects a malformed answer %j', (text, error) => {
    expect(() => parseSuggestion(text)).toThrow(error);
  });
});

describe('assistant', () => {
  const connection = (fetch: typeof globalThis.fetch) => ({
    keys: { gemini: 'g' },
    fetch,
    models: { gemini: ['m'] },
  });

  it('describes every keyword and built-in to the model', () => {
    const guide = languageGuide();
    for (const word of ['rakho', 'jabtak', 'chhanto(list)', 'kismat(a, b)']) {
      expect(guide).toContain(word);
    }
  });

  it('does not call the AI when there is nothing to fix', () => {
    const { fetch, calls } = replay();
    expect(fix('bolo(1);', undefined, connection(fetch))).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('sends compile errors and returns a fix that compiles', async () => {
    const { fetch, calls } = replay(gemini('rakho total = 10;\nbolo(total);'));
    const result = await fix('rakho total = 10;\nbolo(totl);', undefined, connection(fetch));
    expect(result?.problems).toEqual([]);
    expect(JSON.stringify(calls[0]?.body)).toContain('E0301');
  });

  it('sends a runtime error even when the program compiles', async () => {
    const { fetch, calls } = replay(gemini('bolo(1);'));
    await fix('bolo(1 / 0);', 'Error E0403 division by zero', connection(fetch));
    expect(JSON.stringify(calls[0]?.body)).toContain('E0403 division by zero');
  });

  it('asks once more with the compiler errors when the answer does not compile', async () => {
    const { fetch, calls } = replay(gemini('bolo(x)'), gemini('bolo("x");'));
    const result = await translate('print("x")', connection(fetch));
    expect(result).toMatchObject({ code: 'bolo("x");\n', problems: [] });
    expect(calls[1]?.body.contents?.map(({ role }) => role)).toEqual(['user', 'model', 'user']);
    expect(JSON.stringify(calls[1]?.body)).toContain('E0202');
  });

  it('reports what is still wrong after the second try', async () => {
    const { fetch } = replay(gemini('bolo(x)'), gemini('bolo(y)'));
    const result = await translate('print(y)', connection(fetch));
    expect(result.problems.length).toBeGreaterThan(0);
  });

  it('treats an empty program as a problem', () => {
    expect(compileProblems('  ')).toEqual(['The program is empty.']);
  });
});

// Talks to the real APIs. Runs only with GEMINI_API_KEY or GROQ_API_KEY set, never in CI.
const liveKeys = {
  gemini: process.env.GEMINI_API_KEY ?? '',
  groq: process.env.GROQ_API_KEY ?? '',
};
describe.runIf(liveKeys.gemini || liveKeys.groq)('live AI', () => {
  it('translates Python into Hinglish that compiles', { timeout: 240_000 }, async () => {
    const result = await translate(
      'nums = [5, 3, 8]\nfor n in sorted(nums):\n    print(n * 2)\nprint("total", sum(nums))',
      { keys: liveKeys },
    );
    console.log(`[translate via ${result.provider} ${result.model}]\n${result.code}\n${result.notes}`);
    expect(result.problems).toEqual([]);
  });

  it('fixes a broken program', { timeout: 240_000 }, async () => {
    const result = await fix('rakho total = 10\nagar total > 5 { bolo(totl); }', undefined, {
      keys: liveKeys,
    });
    console.log(`[fix via ${result?.provider} ${result?.model}]\n${result?.code}\n${result?.notes}`);
    expect(result?.problems).toEqual([]);
  });
});
