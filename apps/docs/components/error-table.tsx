'use client';

import { useEffect, useState } from 'react';
import type { ErrorEntry } from '../lib/error-list';

const STAGES = [
  { prefix: '', label: 'All' },
  { prefix: 'E01', label: 'Lexical' },
  { prefix: 'E02', label: 'Syntax' },
  { prefix: 'E03', label: 'Semantic' },
  { prefix: 'E04', label: 'Runtime' },
];

export function ErrorTable({ errors }: { errors: ErrorEntry[] }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = errors.filter(
    ({ code, hinglish, english }) =>
      code.startsWith(stage) && `${code} ${hinglish} ${english}`.toLowerCase().includes(needle),
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
          placeholder="Filter by code or words"
          aria-label="Filter error codes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {STAGES.map(({ prefix, label }) => (
          <button
            key={label}
            type="button"
            className="chip"
            aria-pressed={stage === prefix}
            onClick={() => setStage(prefix)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Hinglish</th>
              <th>English</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ code, hinglish, english }) => (
              <tr key={code} id={code}>
                <td>
                  <code>{code}</code>
                </td>
                <td className="font-medium">{hinglish}</td>
                <td className="text-muted">{english}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p role="status" className="text-sm text-muted">
        {shown.length} of {errors.length} codes
      </p>
    </>
  );
}
