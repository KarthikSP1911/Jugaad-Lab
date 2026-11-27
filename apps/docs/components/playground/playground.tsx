'use client';

import type { Bilingual } from '@jugaad-hinglish/core';
import { useEffect, useState, type ReactNode } from 'react';
import { useModifierKey } from '../../hooks/use-modifier-key';
import { useProgram } from '../../hooks/use-program';
import { useRunner } from '../../hooks/use-runner';
import { examples } from '../../lib/content/examples';
import { say, type MessageLang } from '../../lib/i18n/bilingual';
import { ERROR_LANG } from '../../lib/i18n/locales';
import { advise, REACTIONS, TIPS, type Status } from '../../lib/mascot/mascot';
import { LANG_KEY, readStored, store } from '../../lib/playground/draft';
import { Mascot } from '../mascot/mascot';
import { useDictionary, useLocale } from '../ui/locale';
import { Editor, type Position } from './editor';
import { OutputPane } from './output-pane';
import { Toolbar } from './toolbar';

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

/** `children` is the page's heading, shown at the start of the toolbar. */
export function Playground({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { playground: text } = useDictionary();
  const samples = examples(locale);
  const languages: MessageLang[] = locale === 'en' ? ['hi', 'en', 'both'] : ['deva', 'en'];
  const [lang, setLang] = useState<MessageLang>(ERROR_LANG[locale]);
  const [tab, setTab] = useState<Tab>('code');
  const [jump, setJump] = useState<Position | null>(null);
  const runner = useRunner();
  const { program, notice, previous, copied, edit, replace, share, dismiss } = useProgram(
    { code: samples[0].code, input: samples[0].input ?? '' },
    () => {
      runner.clear();
      setTab('code');
    },
  );
  const key = useModifierKey();
  const { output, report, status } = runner;
  const spoken = lang === 'en' ? 'en' : ERROR_LANG[locale];
  const advice = advise(status, report.code, runner.runs);

  useEffect(() => {
    const choice = languages.find((candidate) => candidate === readStored(LANG_KEY));
    if (choice) setLang(choice);
    // Runs once, to restore the saved choice.
  }, []);

  function start() {
    setTab('output');
    runner.start(program);
  }

  const tabName: Record<Tab, string> = {
    code: text.code,
    input: text.input,
    output: text.output,
  };

  return (
    <div className="workbench" data-tab={tab}>
      <Toolbar
        running={status === 'running'}
        runKeys={`${key} + Enter`}
        onRun={start}
        onStop={() => runner.stop()}
        examples={samples}
        onExample={({ code, input = '' }) => replace({ code, input }, program)}
        copied={copied}
        onShare={share}
        languages={languages}
        language={lang}
        onLanguage={(next) => {
          setLang(next);
          store(LANG_KEY, next);
        }}
      >
        {children}
      </Toolbar>

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
            <button type="button" className="chip" onClick={dismiss}>
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
            onChange={(code) => {
              edit({ code });
              runner.dropMarkers();
            }}
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

        <OutputPane
          output={output}
          message={report.messages?.[lang] ?? ''}
          status={status}
          statusLabel={say(STATUS_LABEL[status], spoken)}
          markers={report.markers}
          inputRanOut={report.inputRanOut}
          onClear={runner.clear}
          onJump={({ line, column }) => {
            setTab('code');
            setJump({ line, column });
          }}
        >
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
        </OutputPane>
      </div>
    </div>
  );
}
