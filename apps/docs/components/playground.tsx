'use client';

import type { Bilingual, DiagnosticCode, Lang } from '@jugaad-hinglish/core';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EXAMPLES } from '../lib/examples';
import { advise, REACTIONS, TIPS, type Status } from '../lib/mascot';
import type { RunRequest, WorkerMessage } from '../lib/messages';
import { MESSAGES, say } from '../lib/say';
import { decodeShare, encodeShare } from '../lib/share';
import { CopyButton } from './copy-button';
import { Editor } from './editor';
import { Mascot } from './mascot';
import { useSound } from './sound';

const TIMEOUT_MS = 5_000;

const STATUS_LABEL: Record<Status, Bilingual> = {
  idle: { hi: 'Taiyaar', en: 'Ready' },
  running: { hi: 'Chal raha hai…', en: 'Running…' },
  ok: { hi: 'Ho gaya', en: 'Finished' },
  'compile-error': { hi: 'Code mein galti', en: 'Compile error' },
  'runtime-error': { hi: 'Chalte waqt galti', en: 'Runtime error' },
  stopped: { hi: 'Roka gaya', en: 'Stopped' },
};

function WindowDots() {
  return (
    <span className="window-dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** `children` is the page's heading, shown to the left of Mithu. */
export function Playground({ children }: { children: ReactNode }) {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<Lang | ''>('hi');
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const { play } = useSound();
  const spoken = lang === 'en' ? 'en' : 'hi';
  const [errorCode, setErrorCode] = useState<DiagnosticCode>();
  const [runs, setRuns] = useState(0);
  const advice = advise(status, errorCode, runs);

  function react(next: Status) {
    setStatus(next);
    const { sound } = REACTIONS[next];
    if (sound) play(sound);
  }

  function dispose() {
    window.clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
  }

  function stop(reason: Bilingual) {
    dispose();
    react('stopped');
    setMessage(say(reason, lang || undefined));
  }

  function start() {
    dispose();
    setOutput('');
    setMessage('');
    setErrorCode(undefined);
    setRuns((count) => count + 1);
    react('running');
    const next = new Worker(new URL('../lib/run.worker.ts', import.meta.url));
    next.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      if (data.type === 'output') {
        setOutput((previous) => previous + data.text);
        return;
      }
      dispose();
      setErrorCode(data.result.code);
      react(data.result.outcome);
      setMessage(data.result.message);
    };
    next.onerror = () => stop(MESSAGES.notStarted);
    worker.current = next;
    timer.current = window.setTimeout(() => stop(MESSAGES.timedOut), TIMEOUT_MS);
    const request: RunRequest = { source: code, input, ...(lang ? { lang } : {}) };
    next.postMessage(request);
  }

  useEffect(() => {
    function load() {
      const shared = decodeShare(window.location.hash);
      if (!shared) return;
      setCode(shared.code);
      setInput(shared.input);
    }
    load();
    window.addEventListener('hashchange', load);
    return () => {
      window.removeEventListener('hashchange', load);
      window.clearTimeout(timer.current);
      worker.current?.terminate();
    };
  }, []);

  async function share() {
    window.history.replaceState(null, '', encodeShare(code, input));
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Without clipboard access the link is still in the address bar.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* A minimum height stops the page jumping as Mithu's tips change length. */}
      <div className="flex min-h-28 flex-wrap items-center justify-between gap-3">
        <div>{children}</div>
        <Mascot
          reverse
          mood={REACTIONS[status].mood}
          line={say(REACTIONS[status].line, spoken)}
          {...(advice ? { advice: say(advice, spoken) } : {})}
          tips={TIPS.map((tip) => say(tip, spoken))}
          size={80}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {status === 'running' ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => stop(MESSAGES.stopped)}
          >
            Stop
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={start}>
            Run
          </button>
        )}
        <button type="button" className="button" onClick={share}>
          {copied ? 'Link copied' : 'Share'}
        </button>
        <select
          className="button"
          aria-label="Load an example"
          value=""
          onChange={(event) => {
            const example = EXAMPLES.find(({ id }) => id === event.target.value);
            if (!example) return;
            setCode(example.code);
            setInput(example.input ?? '');
            window.history.replaceState(null, '', window.location.pathname);
          }}
        >
          <option value="" disabled>
            Examples
          </option>
          {EXAMPLES.map(({ id, title }) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted sm:ml-auto">
          Error language
          <select
            className="button"
            value={lang}
            onChange={(event) => setLang(event.target.value as Lang | '')}
          >
            <option value="hi">Hinglish</option>
            <option value="en">English</option>
            <option value="">Both</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="code-window">
          <h2 className="window-bar">
            <WindowDots />
            main.hing
            <span className="window-hint">Ctrl + Enter to run · Ctrl + Space to suggest</span>
          </h2>
          <Editor code={code} onChange={setCode} onRun={start} />
        </section>

        <div className="flex min-w-0 flex-col gap-3">
          <section className="code-window">
            <h2 className="window-bar">
              <WindowDots />
              input
              <span className="window-hint">one line for each suno</span>
            </h2>
            <textarea
              className="input-box"
              aria-label="Program input, one line for each suno"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              placeholder="Type here what suno() should read."
              spellCheck={false}
            />
          </section>
          <section className="code-window flex-1">
            <div className="window-bar">
              <WindowDots />
              <h2>output</h2>
              <span className="ml-auto flex items-center gap-2 text-xs font-normal">
                {(output || message) && (
                  <CopyButton text={[output, message].filter(Boolean).join('\n')} />
                )}
                <span role="status" className={`status status-${status}`}>
                  {say(STATUS_LABEL[status], spoken)}
                </span>
              </span>
            </div>
            <pre className="output">
              {output}
              {message && (
                <motion.span
                  key={message}
                  className="block text-error"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {message}
                </motion.span>
              )}
              {status === 'idle' && (
                <span className="text-muted">Press Run to see the output.</span>
              )}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
