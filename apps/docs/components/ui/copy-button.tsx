'use client';

import { useState } from 'react';
import { useDictionary } from './locale';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { code } = useDictionary();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Without clipboard access the code can still be selected by hand.
    }
  }

  return (
    <button type="button" className="copy-button" onClick={copy} aria-live="polite">
      {copied ? code.copied : code.copy}
    </button>
  );
}
