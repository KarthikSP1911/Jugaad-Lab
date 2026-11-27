'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useModifierKey } from '../lib/platform';
import { search, type SearchEntry } from '../lib/search';
import { useDictionary } from './locale';

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.matches('input, textarea, select');
}

export function Search({ entries }: { entries: SearchEntry[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { search: text } = useDictionary();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const results = search(entries, query);
  const modifier = useModifierKey();
  const active = results[selected] ? `result-${selected}` : undefined;

  function open() {
    if (dialog.current?.open) return;
    setQuery('');
    setSelected(0);
    dialog.current?.showModal();
  }

  function go(href: string) {
    dialog.current?.close();
    router.push(href);
  }

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const shortcut = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey);
      if (!shortcut && !(event.key === '/' && !isTyping(event.target))) return;
      event.preventDefault();
      open();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (selected + step + results.length) % Math.max(results.length, 1);
      setSelected(next);
      document.getElementById(`result-${next}`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      const result = results[selected];
      if (result) go(result.href);
    }
  }

  return (
    <>
      <button type="button" className="search-trigger" onClick={open} aria-label={text.open}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="hidden lg:inline">{text.button}</span>
        <kbd className="hidden lg:inline">{modifier} K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-label={text.open}
        onClick={(event) => {
          // A click on the dialog itself, not its content, is on the backdrop.
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div>
          <div className="flex items-center border-b border-line pr-2">
            <input
              type="search"
              role="combobox"
              className="search-input"
              placeholder={text.placeholder}
              aria-label={text.label}
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              aria-activedescendant={active}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(0);
              }}
              onKeyDown={onKeyDown}
            />
            <button type="button" className="chip" onClick={() => dialog.current?.close()}>
              {text.close}
            </button>
          </div>
          <ul
            id="search-results"
            role="listbox"
            aria-label={text.label}
            className="max-h-80 overflow-auto p-2"
          >
            {results.map(({ title, section, href }, index) => (
              <li
                key={href + title}
                id={`result-${index}`}
                role="option"
                aria-selected={index === selected}
                className="search-result"
                onMouseMove={() => setSelected(index)}
                onClick={() => go(href)}
              >
                <span className="font-medium">{title}</span>
                <span className="text-xs text-muted">{section}</span>
              </li>
            ))}
          </ul>
          <p role="status" className="px-4 pb-3 text-xs text-muted">
            {results.length === 0
              ? text.empty
              : text.count.replace('{count}', String(results.length))}
          </p>
        </div>
      </dialog>
    </>
  );
}
