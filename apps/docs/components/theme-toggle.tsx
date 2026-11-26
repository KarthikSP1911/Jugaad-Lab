'use client';

import { useDictionary } from './locale';

function toggle() {
  const root = document.documentElement;
  const dark =
    root.dataset.theme === 'dark' ||
    (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
}

export function ThemeToggle() {
  const { header } = useDictionary();
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label={header.theme}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
