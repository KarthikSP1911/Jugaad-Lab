'use client';

import { useEffect, useState } from 'react';
import type { ErrorEntry } from '../lib/error-list';
import { useDictionary } from './locale';

const STAGES = [
  { prefix: '', key: 'all' },
  { prefix: 'E01', key: 'lexical' },
  { prefix: 'E02', key: 'syntax' },
  { prefix: 'E03', key: 'semantic' },
  { prefix: 'E04', key: 'runtime' },
] as const;

export function ErrorTable({ errors }: { errors: ErrorEntry[] }) {
  const { errors: text } = useDictionary();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = errors.filter(
    ({ code, title, meaning }) =>
      code.startsWith(stage) && `${code} ${title} ${meaning}`.toLowerCase().includes(needle),
  );

  // The rows render on the client's first pass, after the browser has looked for the fragment.
  useEffect(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <>
      <div className="not-prose my-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          className="filter-input"
          placeholder={text.filterPlaceholder}
          aria-label={text.filterLabel}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {STAGES.map(({ prefix, key }) => (
          <button
            key={key}
            type="button"
            className="chip"
            aria-pressed={stage === prefix}
            onClick={() => setStage(prefix)}
          >
            {text.stages[key]}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{text.code}</th>
              <th>{text.titleColumn}</th>
              <th>{text.meaningColumn}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ code, title, meaning }) => (
              <tr key={code} id={code}>
                <td>
                  <code>{code}</code>
                </td>
                <td className="font-medium">{title}</td>
                <td className="text-muted">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status" className="text-sm text-muted">
        {text.count
          .replace('{shown}', String(shown.length))
          .replace('{total}', String(errors.length))}
      </p>
    </>
  );
}
