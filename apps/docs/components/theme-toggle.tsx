'use client';

import { useSyncExternalStore } from 'react';
import { useDictionary } from './locale';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isDark() {
  const { theme } = document.documentElement.dataset;
  return theme ? theme === 'dark' : window.matchMedia(DARK_QUERY).matches;
}

function subscribe(changed: () => void) {
  const system = window.matchMedia(DARK_QUERY);
  const observer = new MutationObserver(changed);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  system.addEventListener('change', changed);
  return () => {
    observer.disconnect();
    system.removeEventListener('change', changed);
  };
}

function toggle() {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
}

export function ThemeToggle() {
  const { header } = useDictionary();
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const label = dark ? header.toLight : header.toDark;
  return (
    <button type="button" className="icon-button" onClick={toggle} aria-label={label} title={label}>
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.500 4 8.5 8.5 0 1 0 20 14.500Z" />
        )}
      </svg>
    </button>
  );
}
