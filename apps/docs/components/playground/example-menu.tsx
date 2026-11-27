'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Example } from '../../lib/content/examples';
import { useDictionary } from '../ui/locale';

interface Props {
  examples: readonly Example[];
  onChoose: (example: Example) => void;
}

/** A compact menu of the sample programs; pointing at one says what it shows. */
export function ExampleMenu({ examples, onChoose }: Props) {
  const { playground: text } = useDictionary();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const items = () => [...(list.current?.querySelectorAll('button') ?? [])];

  useEffect(() => {
    if (open) list.current?.querySelector('button')?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!open) {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    const all = items();
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    const target: Record<string, number> = {
      ArrowDown: (at + 1) % all.length,
      ArrowUp: (at <= 0 ? all.length : at) - 1,
      Home: 0,
      End: all.length - 1,
    };
    const next = target[event.key];
    if (next === undefined) return;
    event.preventDefault();
    all[next]?.focus();
  }

  return (
    <div
      className="example-menu"
      onKeyDown={onKeyDown}
      // Closes once focus leaves the button and the list.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="button"
        title={text.loadExample}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'example-list' : undefined}
        // Some browsers do not focus a clicked button, which the blur handling needs.
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen(!open);
        }}
      >
        {text.examples}
        <svg
          className="example-chevron"
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 6 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <ul ref={list} id="example-list" className="example-list" role="menu">
          {examples.map((example, index) => (
            <li key={example.id} role="none">
              <button
                type="button"
                role="menuitem"
                title={example.summary}
                tabIndex={-1}
                // Keeps focus inside the menu while the mouse chooses.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  close();
                  onChoose(example);
                }}
              >
                <span className="example-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="example-title">{example.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
