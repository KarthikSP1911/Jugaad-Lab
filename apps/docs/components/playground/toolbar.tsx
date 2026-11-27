'use client';

import type { ReactNode } from 'react';
import type { Example } from '../../lib/content/examples';
import type { MessageLang } from '../../lib/i18n/bilingual';
import { useDictionary } from '../ui/locale';

interface Props {
  /** The page's heading, shown first. */
  children: ReactNode;
  running: boolean;
  /** Keys that run the program, for the button's tooltip. */
  runKeys: string;
  onRun: () => void;
  onStop: () => void;
  examples: readonly Example[];
  onExample: (example: Example) => void;
  copied: boolean;
  onShare: () => void;
  languages: readonly MessageLang[];
  language: MessageLang;
  onLanguage: (language: MessageLang) => void;
}

export function Toolbar(props: Props) {
  const { playground: text } = useDictionary();
  const langName: Record<MessageLang, string> = {
    hi: text.hinglish,
    deva: text.hindi,
    en: text.english,
    both: text.both,
  };

  return (
    <div className="toolbar">
      {props.children}
      <button
        type="button"
        className="button button-primary"
        title={props.runKeys}
        onClick={props.running ? props.onStop : props.onRun}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor">
          {props.running ? <path d="M3 3h10v10H3z" /> : <path d="M4 2.5 14 8 4 13.5z" />}
        </svg>
        {props.running ? text.stop : text.run}
      </button>
      <select
        className="button"
        aria-label={text.loadExample}
        value=""
        onChange={(event) => {
          const example = props.examples.find(({ id }) => id === event.target.value);
          if (example) props.onExample(example);
        }}
      >
        <option value="" disabled>
          {text.examples}
        </option>
        {props.examples.map(({ id, title }) => (
          <option key={id} value={id}>
            {title}
          </option>
        ))}
      </select>
      <button type="button" className="button" onClick={props.onShare}>
        {props.copied ? text.linkCopied : text.share}
      </button>
      <label className="toolbar-end">
        <span className="max-sm:sr-only">{text.errorLanguage}</span>
        <select
          className="button"
          value={props.language}
          onChange={(event) => props.onLanguage(event.target.value as MessageLang)}
        >
          {props.languages.map((choice) => (
            <option key={choice} value={choice}>
              {langName[choice]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
