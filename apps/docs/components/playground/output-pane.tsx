'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Status } from '../../lib/mascot/mascot';
import { localePath } from '../../lib/i18n/locales';
import type { Marker } from '../../lib/playground/execute';
import { CopyButton } from '../ui/copy-button';
import { useDictionary, useLocale } from '../ui/locale';

interface Props {
  output: string;
  /** The error or the reason for stopping, in the chosen language. */
  message: string;
  status: Status;
  statusLabel: string;
  markers: readonly Marker[];
  inputRanOut: boolean;
  onClear: () => void;
  onJump: (marker: Marker) => void;
  /** Shown at the foot of the pane. */
  children: ReactNode;
}

export function OutputPane(props: Props) {
  const { output, message, status, markers } = props;
  const locale = useLocale();
  const { playground: text } = useDictionary();
  const log = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [output, message]);

  return (
    <section className="pane pane-output">
      <div className="pane-bar">
        <h2>{text.output}</h2>
        <span className="ml-auto flex items-center gap-2 text-xs font-normal">
          {(output || message) && (
            <>
              <CopyButton text={[output, message].filter(Boolean).join('\n')} />
              <button
                type="button"
                className="copy-button"
                onClick={props.onClear}
                disabled={status === 'running'}
              >
                {text.clear}
              </button>
            </>
          )}
          <span role="status" className={`status status-${status}`}>
            {props.statusLabel}
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
      {markers.length > 0 && (
        <ul className="problems" aria-label={text.problems}>
          {markers.map((marker, index) => (
            <li key={index}>
              <button type="button" className="chip" onClick={() => props.onJump(marker)}>
                {text.goToLine.replace('{line}', String(marker.line))}
              </button>
              <Link className="link" href={`${localePath(locale, '/docs/errors')}#${marker.code}`}>
                {text.about.replace('{code}', marker.code)}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {props.inputRanOut && <p className="pane-foot">{text.inputRanOut}</p>}
      {props.children}
    </section>
  );
}
