'use client';

import type { Bilingual, DiagnosticCode } from '@jugaad-hinglish/core';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DRAFT_KEY,
  LANG_KEY,
  parseDraft,
  readStored,
  startingProgram,
  store,
  type Program,
} from '../lib/draft';
import type { Marker } from '../lib/execute';
import { examples } from '../lib/examples';
import { ERROR_LANG, localePath } from '../lib/i18n/locales';
import { advise, REACTIONS, TIPS, type Status } from '../lib/mascot';
import type { RunRequest, WorkerMessage } from '../lib/messages';
import { useModifierKey } from '../lib/platform';
import { everyLanguage, MESSAGES, say, type MessageLang, type Messages } from '../lib/say';
import { encodeShare } from '../lib/share';
import { CopyButton } from './copy-button';
import { Editor, type Position } from './editor';
import { useDictionary, useLocale } from './locale';
import { Mascot } from './mascot';
import { useSound } from './sound';

const TIMEOUT_MS = 5_000;

const STATUS_LABEL: Record<Status, Bilingual> = {
  idle: { hi: 'Taiyaar', deva: 'तैयार', en: 'Ready' },
  running: { hi: 'Chal raha hai…', deva: 'चल रहा है…', en: 'Running…' },
  ok: { hi: 'Ho gaya', deva: 'हो गया', en: 'Finished' },
  'compile-error': { hi: 'Code mein galti', deva: 'कोड में गलती', en: 'Compile error' },
  'runtime-error': { hi: 'Chalte waqt galti', deva: 'चलते समय गलती', en: 'Runtime error' },
  stopped: { hi: 'Roka gaya', deva: 'रोका गया', en: 'Stopped' },
};

const TABS = ['code', 'input', 'output'] as const;
type Tab = (typeof TABS)[number];

type Notice = 'undo' | 'badLink' | 'copyFailed';

/** What the last run left behind, besides its output. */
interface Report {
  messages: Messages | null;
  markers: Marker[];
  code?: DiagnosticCode;
  inputRanOut: boolean;
}

const EMPTY: Report = { messages: null, markers: [], inputRanOut: false };

/** `children` is the page's heading, shown at the start of the toolbar. */
export function Playground({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { playground: text } = useDictionary();
  const samples = examples(locale);
  const [program, setProgram] = useState<Program>({
    code: samples[0].code,
    input: samples[0].input ?? '',
  });
  const choices: MessageLang[] = locale === 'en' ? ['hi', 'en', 'both'] : ['deva', 'en'];
  const [lang, setLang] = useState<MessageLang>(ERROR_LANG[locale]);
  const [output, setOutput] = useState('');
  const [report, setReport] = useState<Report>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [previous, setPrevious] = useState<Program | null>(null);
  const [tab, setTab] = useState<Tab>('code');
  const [jump, setJump] = useState<Position | null>(null);
  const [runs, setRuns] = useState(0);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const buffer = useRef('');
  const frame = useRef(0);
  const log = useRef<HTMLPreElement>(null);
  const { play } = useSound();
  const key = useModifierKey();
  const spoken = lang === 'en' ? 'en' : ERROR_LANG[locale];
  const advice = advise(status, report.code, runs);
  const message = report.messages?.[lang] ?? '';
  const running = status === 'running';

  function react(next: Status) {
    setStatus(next);
    const { sound } = REACTIONS[next];
    if (sound) play(sound);
  }

  /** Output arrives in many small writes; show them once per frame. */
  function flush() {
    window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    const text = buffer.current;
    buffer.current = '';
    if (text) setOutput((previous) => previous + text);
  }

  function dispose() {
    window.clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
    flush();
  }

  function stop(reason: Bilingual) {
    dispose();
    react('stopped');
    setReport({ ...EMPTY, messages: everyLanguage((language) => say(reason, language)) });
  }

  function clear() {
    setOutput('');
    setReport(EMPTY);
    setStatus('idle');
  }

  function start() {
    dispose();
    clear();
    setTab('output');
    setRuns((count) => count + 1);
    react('running');
    const next = new Worker(new URL('../lib/run.worker.ts', import.meta.url));
    next.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      if (data.type === 'output') {
        buffer.current += data.text;
        frame.current ||= window.requestAnimationFrame(flush);
        return;
      }
      dispose();
      const { result } = data;
      setReport({
        messages: result.messages ?? null,
        markers: result.markers,
        inputRanOut: result.inputRanOut,
        ...(result.code ? { code: result.code } : {}),
      });
      react(result.outcome);
    };
    next.onerror = () => stop(MESSAGES.notStarted);
    worker.current = next;
    timer.current = window.setTimeout(() => stop(MESSAGES.timedOut), TIMEOUT_MS);
    const request: RunRequest = { source: program.code, input: program.input };
    next.postMessage(request);
  }

  /** A shared link stops describing the program once it changes. */
  function dropFragment() {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  function keep(next: Program) {
    setProgram(next);
    store(DRAFT_KEY, JSON.stringify(next));
    dropFragment();
  }

  function edit(change: Partial<Program>) {
    keep({ ...program, ...change });
    setNotice(null);
    // Error positions no longer match edited code.
    if (change.code !== undefined && report.markers.length > 0) {
      setReport({ ...report, markers: [] });
    }
  }

  /** Swaps in a whole program, remembering the one it replaces. */
  function replace(next: Program, from: Program | null) {
    dispose();
    clear();
    keep(next);
    setPrevious(from);
    setNotice(from ? 'undo' : null);
    setTab('code');
  }

  useEffect(() => {
    function load() {
      const saved = parseDraft(readStored(DRAFT_KEY));
      const found = startingProgram(window.location.hash, saved);
      if (found.program) replace(found.program, found.replaced);
      if (found.badLink) {
        setNotice('badLink');
        dropFragment();
      }
      const choice = choices.find((candidate) => candidate === readStored(LANG_KEY));
      if (choice) setLang(choice);
    }
    load();
    window.addEventListener('hashchange', load);
    return () => {
      window.removeEventListener('hashchange', load);
      window.clearTimeout(timer.current);
      window.cancelAnimationFrame(frame.current);
      worker.current?.terminate();
    };
    // Runs once: everything it calls reads storage or the address afresh.
  }, []);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [output, message]);

  async function share() {
    window.history.replaceState(null, '', encodeShare(program.code, program.input));
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setNotice(null);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice('copyFailed');
    }
  }

  const langName: Record<MessageLang, string> = {
    hi: text.hinglish,
    deva: text.hindi,
    en: text.english,
    both: text.both,
  };
  const tabName: Record<Tab, string> = {
    code: text.code,
    input: text.input,
    output: text.output,
  };
  const runKeys = `${key} + Enter`;

  return (
    <div className="workbench" data-tab={tab}>
      <div className="toolbar">
        {children}
        <button
          type="button"
          className="button button-primary"
          title={runKeys}
          onClick={running ? () => stop(MESSAGES.stopped) : start}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor">
            {running ? <path d="M3 3h10v10H3z" /> : <path d="M4 2.5 14 8 4 13.5z" />}
          </svg>
          {running ? text.stop : text.run}
        </button>
        <select
          className="button"
          aria-label={text.loadExample}
          value=""
          onChange={(event) => {
            const example = samples.find(({ id }) => id === event.target.value);
            if (!example) return;
            replace({ code: example.code, input: example.input ?? '' }, program);
          }}
        >
          <option value="" disabled>
            {text.examples}
          </option>
          {samples.map(({ id, title }) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <button type="button" className="button" onClick={share}>
          {copied ? text.linkCopied : text.share}
        </button>
        <label className="toolbar-end">
          <span className="max-sm:sr-only">{text.errorLanguage}</span>
          <select
            className="button"
            value={lang}
            onChange={(event) => {
              const next = event.target.value as MessageLang;
              setLang(next);
              store(LANG_KEY, next);
            }}
          >
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {langName[choice]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Always present, so screen readers hear a notice when it appears. */}
      <div role="status">
        {notice && (
          <p className="workbench-notice">
            {notice === 'undo' && text.replaced}
            {notice === 'badLink' && text.badLink}
            {notice === 'copyFailed' && text.copyFailed}
            {notice === 'undo' && previous && (
              <button type="button" className="chip" onClick={() => replace(previous, null)}>
                {text.undo}
              </button>
            )}
            <button type="button" className="chip" onClick={() => setNotice(null)}>
              {text.dismiss}
            </button>
          </p>
        )}
      </div>

      <div className="tabs" role="group" aria-label={text.panels}>
        {TABS.map((name) => (
          <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>
            {tabName[name]}
            {name === 'output' && <span className={`dot status-${status}`} aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="panes">
        <section className="pane pane-code">
          <div className="pane-bar">
            <h2>main.hing</h2>
            <span className="pane-hint keys">
              {key} + Enter · Ctrl + Space · {key} + /
            </span>
          </div>
          <Editor
            code={program.code}
            onChange={(code) => edit({ code })}
            onRun={start}
            errorLines={report.markers.map(({ line }) => line)}
            jump={jump}
          />
          <p className="pane-foot keys">{text.tabHint}</p>
        </section>

        <section className="pane pane-input">
          <div className="pane-bar">
            <h2>{text.input}</h2>
            <span className="pane-hint">{text.inputHint}</span>
          </div>
          <textarea
            className="input-box"
            aria-label={text.inputLabel}
            value={program.input}
            onChange={(event) => edit({ input: event.target.value })}
            rows={3}
            placeholder={text.inputPlaceholder}
            spellCheck={false}
          />
        </section>

        <section className="pane pane-output">
          <div className="pane-bar">
            <h2>{text.output}</h2>
            <span className="ml-auto flex items-center gap-2 text-xs font-normal">
              {(output || message) && (
                <>
                  <CopyButton text={[output, message].filter(Boolean).join('\n')} />
                  <button type="button" className="copy-button" onClick={clear} disabled={running}>
                    {text.clear}
                  </button>
                </>
              )}
              <span role="status" className={`status status-${status}`}>
                {say(STATUS_LABEL[status], spoken)}
              </span>
            </span>
          </div>
          <pre ref={log} className="output" role="log" tabIndex={0} aria-label={text.output}>
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
            {status === 'idle' && <span className="text-muted">{text.outputEmpty}</span>}
            {status === 'ok' && !output && <span className="text-muted">{text.noOutput}</span>}
          </pre>
          {report.markers.length > 0 && (
            <ul className="problems" aria-label={text.problems}>
              {report.markers.map(({ line, column, code }, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      setTab('code');
                      setJump({ line, column });
                    }}
                  >
                    {text.goToLine.replace('{line}', String(line))}
                  </button>
                  <Link className="link" href={`${localePath(locale, '/docs/errors')}#${code}`}>
                    {text.about.replace('{code}', code)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {report.inputRanOut && <p className="pane-foot">{text.inputRanOut}</p>}
          <div className="mascot-dock">
            <Mascot
              quiet
              mood={REACTIONS[status].mood}
              line={say(REACTIONS[status].line, spoken)}
              {...(advice ? { advice: say(advice, spoken) } : {})}
              tips={TIPS.map((tip) => say(tip, spoken))}
              size={56}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
