'use client';

import { useEffect, useState } from 'react';
import { fix, MAX_INPUT, translate, type AssistantResult } from '../lib/ai/assistant';
import { AiError, PROVIDER_NAMES, type Keys, type Provider } from '../lib/ai/client';

const PROVIDERS = ['gemini', 'groq'] as const;
const KEY_STORAGE: Record<Provider, string> = {
  gemini: 'jugaad-gemini-key',
  groq: 'jugaad-groq-key',
};

interface Props {
  /** The program in the editor. */
  code: string;
  /** The message from the last run, when it ended in a runtime error. */
  runtimeError: string | undefined;
  /** Puts a suggestion into the editor. */
  onUse: (code: string) => void;
}

type Mode = 'fix' | 'translate';

/** Reads, writes (a string) or removes (null) a saved key. Storage can be blocked. */
function stored(provider: Provider, value?: string | null): string {
  try {
    if (value === null) localStorage.removeItem(KEY_STORAGE[provider]);
    else if (value !== undefined) localStorage.setItem(KEY_STORAGE[provider], value);
    return localStorage.getItem(KEY_STORAGE[provider]) ?? '';
  } catch {
    return value ?? '';
  }
}

/** "Fix it" and "Translate" with Gemini (Groq as backup), using the visitor's own keys. */
export function AiHelper({ code, runtimeError, onUse }: Props) {
  const [keys, setKeys] = useState<Keys>({});
  const [drafts, setDrafts] = useState<Record<Provider, string>>({ gemini: '', groq: '' });
  const [editingKeys, setEditingKeys] = useState(false);
  const [mode, setMode] = useState<Mode>('fix');
  const [source, setSource] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AssistantResult>();
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const hasKey = Boolean(keys.gemini || keys.groq);

  useEffect(() => {
    setKeys({ gemini: stored('gemini'), groq: stored('groq') });
  }, []);

  function saveKeys() {
    const next: Keys = { ...keys };
    for (const provider of PROVIDERS) {
      const draft = drafts[provider].trim();
      if (draft) next[provider] = stored(provider, draft) || draft;
    }
    setKeys(next);
    setDrafts({ gemini: '', groq: '' });
    setEditingKeys(false);
  }

  function forget(providers: readonly Provider[]) {
    for (const provider of providers) stored(provider, null);
    setKeys((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([provider]) => !providers.includes(provider as Provider)),
      ),
    );
  }

  async function ask() {
    setResult(undefined);
    setInfo('');
    setError('');
    const connection = { keys };
    const pending =
      mode === 'fix' ? fix(code, runtimeError, connection) : translate(source, connection);
    if (!pending) {
      setInfo('Koi galti nahi mili. Program compile hota hai, aur pichhla run bhi theek tha.');
      return;
    }
    setBusy(true);
    try {
      setResult(await pending);
    } catch (failure) {
      if (failure instanceof AiError) forget(failure.badKeys);
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="code-window" aria-labelledby="ai-helper-title">
      <div className="window-bar">
        <h2 id="ai-helper-title">AI helper · Gemini + Groq</h2>
        <span className="window-hint">translate code · fix errors</span>
      </div>
      <div className="flex flex-col gap-3 p-4 text-sm">
        {hasKey && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-lg border border-line p-0.5"
                role="group"
                aria-label="Mode"
              >
                {(['fix', 'translate'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => setMode(option)}
                    className={`rounded-md px-3 py-1 font-medium ${
                      mode === option ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {option === 'fix' ? 'Fix it' : 'Translate to Hinglish'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="button button-primary"
                onClick={ask}
                disabled={busy || (mode === 'translate' && !source.trim())}
              >
                {busy ? 'Soch raha hai…' : mode === 'fix' ? 'Fix my code' : 'Translate'}
              </button>
              <span className="ml-auto flex gap-2">
                <button
                  type="button"
                  className="button"
                  aria-expanded={editingKeys}
                  onClick={() => setEditingKeys((open) => !open)}
                >
                  Keys
                </button>
                <button type="button" className="button" onClick={() => forget(PROVIDERS)}>
                  Forget keys
                </button>
              </span>
            </div>

            {mode === 'fix' ? (
              <p className="text-muted">
                Sends the program in the editor{runtimeError ? ' and its last error' : ''} to the
                AI, and suggests the smallest fix with an explanation.
              </p>
            ) : (
              <textarea
                className="input-box rounded-md border border-line"
                aria-label="Code or description to translate"
                value={source}
                maxLength={MAX_INPUT}
                onChange={(event) => setSource(event.target.value)}
                rows={6}
                placeholder={
                  'Paste Python or JavaScript, or describe a program:\n\nfor i in range(1, 6):\n    print(i * i)'
                }
                spellCheck={false}
              />
            )}
          </>
        )}

        {(!hasKey || editingKeys) && (
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              saveKeys();
            }}
          >
            <p className="text-muted">
              Keys stay in this browser only and go straight to Google or Groq, never to this
              site. Gemini is tried first; Groq is the backup. Free keys:{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Gemini
              </a>
              ,{' '}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                Groq
              </a>
              .
            </p>
            {PROVIDERS.map((provider) => (
              <label key={provider} className="flex flex-wrap items-center gap-2">
                <span className="w-40 font-medium">
                  {provider === 'gemini' ? 'Gemini key' : 'Backup: Groq key'}
                  {keys[provider] ? ' ✓' : ''}
                </span>
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  className="filter-input min-w-0 flex-1"
                  value={drafts[provider]}
                  onChange={(event) =>
                    setDrafts((current) => ({ ...current, [provider]: event.target.value }))
                  }
                  placeholder={keys[provider] ? 'Saved. Paste to replace' : 'Paste your key'}
                />
              </label>
            ))}
            <div>
              <button
                type="submit"
                className="button button-primary"
                disabled={!drafts.gemini.trim() && !drafts.groq.trim()}
              >
                Save keys
              </button>
            </div>
          </form>
        )}

        {info && <p role="status">{info}</p>}
        {error && (
          <p role="alert" className="text-error whitespace-pre-line">
            {error}
          </p>
        )}

        {result && (
          <div className="flex flex-col gap-2" aria-live="polite">
            {result.problems.length === 0 ? (
              <p className="status-ok font-medium">✓ Yeh code compile hota hai.</p>
            ) : (
              <p role="alert" className="text-error">
                AI ka code abhi bhi compile nahi hota ({result.problems.length} galti). Use
                karne se pehle dekh lijiye.
              </p>
            )}
            {result.notes && <p className="whitespace-pre-line">{result.notes}</p>}
            <pre className="output max-h-80 overflow-auto rounded-md border border-line">
              {result.code}
            </pre>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="button button-primary"
                onClick={() => onUse(result.code)}
              >
                Use this code
              </button>
              <span className="text-xs text-muted">
                via {PROVIDER_NAMES[result.provider]} · {result.model}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
