'use client';

import Link from 'next/link';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { useRunner } from '../../hooks/use-runner';
import { DEMO_IDS, DEMOS, type DemoId } from '../../lib/content/home';
import { ERROR_LANG, localePath } from '../../lib/i18n/locales';
import { say } from '../../lib/i18n/bilingual';
import { advise, GREETING, pick, REACTIONS, TIPS } from '../../lib/mascot/mascot';
import { encodeShare } from '../../lib/playground/share';
import { Mascot } from '../mascot/mascot';
import { Editor } from '../playground/editor';
import { CopyButton } from '../ui/copy-button';
import { useDictionary, useLocale } from '../ui/locale';

const TYPE_MS = 45;

/** A small editor that runs the real interpreter, with Mithu perched on top. */
export function HeroDemo() {
  const locale = useLocale();
  const { home } = useDictionary();
  const text = home.demo;
  const [demo, setDemo] = useState<DemoId>('hello');
  const [code, setCode] = useState(DEMOS[locale].hello);
  /** How many characters have been typed so far; `null` once typing is over. */
  const [typed, setTyped] = useState<number | null>(null);
  const runner = useRunner();
  const { output, report, status } = runner;
  const lang = ERROR_LANG[locale];
  const running = status === 'running';
  const typing = typed !== null;
  const message = report.messages?.[lang] ?? '';
  const advice = advise(status, report.code, runner.runs);

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTyped(0);
  }, []);

  useEffect(() => {
    if (!typing) return;
    const timer = window.setInterval(() => {
      setTyped((count) => (count === null || count + 1 >= code.length ? null : count + 1));
    }, TYPE_MS);
    return () => window.clearInterval(timer);
  }, [typing, code]);

  function choose(next: DemoId) {
    runner.clear();
    setTyped(null);
    setDemo(next);
    setCode(DEMOS[locale][next]);
  }

  function run() {
    setTyped(null);
    runner.start({ code, input: '' });
  }

  function onTabKey(event: KeyboardEvent) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = (DEMO_IDS.indexOf(demo) + step + DEMO_IDS.length) % DEMO_IDS.length;
    const next = DEMO_IDS[index] ?? demo;
    choose(next);
    document.getElementById(`demo-tab-${next}`)?.focus();
  }

  return (
    <div className="demo">
      <div className="demo-card">
        <div className="demo-mascot">
          <Mascot
            dismissible
            quiet
            mood={REACTIONS[status].mood}
            line={
              status === 'idle'
                ? GREETING[lang]
                : say(pick(REACTIONS[status].lines, runner.runs), lang)
            }
            // Nothing to advise before the first run: the greeting stays short.
            {...(advice && status !== 'idle' ? { advice: say(advice, lang) } : {})}
            tips={TIPS.map((tip) => say(tip, lang))}
            size={80}
            flip
          />
        </div>

        <div className="demo-bar">
          <div className="demo-tabs" role="tablist" aria-label={text.tabsLabel}>
            {DEMO_IDS.map((id) => (
              <button
                key={id}
                id={`demo-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={demo === id}
                aria-controls="demo-panel"
                tabIndex={demo === id ? 0 : -1}
                onClick={() => choose(id)}
                onKeyDown={onTabKey}
              >
                {text.tabs[id]}
              </button>
            ))}
          </div>
        </div>

        <div
          id="demo-panel"
          role="tabpanel"
          aria-labelledby={`demo-tab-${demo}`}
          className="demo-editor"
          // Anyone who starts working with the code gets all of it at once.
          onFocusCapture={() => setTyped(null)}
        >
          <Editor
            code={typed === null ? code : code.slice(0, typed)}
            onChange={(next) => {
              setTyped(null);
              setCode(next);
              runner.dropMarkers();
            }}
            onRun={run}
            errorLines={report.markers.map(({ line }) => line)}
            jump={null}
          />
        </div>
        <span className="sr-only">{text.editorHint}</span>

        <div className="demo-actions">
          <button
            type="button"
            className="button button-primary demo-run"
            onClick={running ? () => runner.stop() : run}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor">
              {running ? <path d="M3 3h10v10H3z" /> : <path d="M4 2.5 14 8 4 13.5z" />}
            </svg>
            {running ? text.stop : text.run}
          </button>
          <CopyButton text={code} />
          <Link
            className="link demo-open"
            href={`${localePath(locale, '/playground')}${encodeShare(code)}`}
          >
            {text.open}
          </Link>
        </div>
      </div>

      <div className="demo-output">
        <span>{text.output}</span>
        <pre role="log" tabIndex={0} aria-label={text.output}>
          {output
            .split('\n')
            .slice(0, -1)
            .map((line, index) => (
              <span key={index} className="demo-line">
                {line}
              </span>
            ))}
          {message && <span className="demo-line text-error">{message}</span>}
          {status === 'idle' && <span className="text-muted">{text.outputEmpty}</span>}
        </pre>
      </div>
    </div>
  );
}
