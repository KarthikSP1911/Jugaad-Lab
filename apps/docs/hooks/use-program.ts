'use client';

import { useEffect, useState } from 'react';
import {
  DRAFT_KEY,
  parseDraft,
  readStored,
  startingProgram,
  store,
  type Program,
} from '../lib/playground/draft';
import { encodeShare } from '../lib/playground/share';

export type Notice = 'undo' | 'badLink' | 'copyFailed';

/** A shared link stops describing the program once it changes. */
function dropFragment() {
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * The program being edited: restored on arrival, saved on every change and
 * shared through the address. `onReplace` runs when the whole program is swapped.
 */
export function useProgram(sample: Program, onReplace: () => void) {
  const [program, setProgram] = useState<Program>(sample);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [previous, setPrevious] = useState<Program | null>(null);
  const [copied, setCopied] = useState(false);

  function keep(next: Program) {
    setProgram(next);
    store(DRAFT_KEY, JSON.stringify(next));
    dropFragment();
  }

  function edit(change: Partial<Program>) {
    keep({ ...program, ...change });
    setNotice(null);
  }

  /** Swaps in a whole program, remembering the one it replaces. */
  function replace(next: Program, from: Program | null) {
    onReplace();
    keep(next);
    setPrevious(from);
    setNotice(from ? 'undo' : null);
  }

  useEffect(() => {
    function load() {
      const saved = parseDraft(readStored(DRAFT_KEY));
      const found = startingProgram(window.location.hash, saved);
      if (found.program) replace(found.program, found.replaced);
      if (found.badLink) {
        setNotice('badLink');
        dropFragment();
      }
    }
    load();
    window.addEventListener('hashchange', load);
    return () => window.removeEventListener('hashchange', load);
    // Runs once: everything it calls reads storage or the address afresh.
  }, []);

  async function share() {
    window.history.replaceState(null, '', encodeShare(program.code, program.input));
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setNotice(null);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice('copyFailed');
    }
  }

  return {
    program,
    notice,
    previous,
    copied,
    edit,
    replace,
    share,
    dismiss: () => setNotice(null),
  };
}
