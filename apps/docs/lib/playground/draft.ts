import { decodeShare, type Shared } from './share';

export const DRAFT_KEY = 'playground:draft';
export const LANG_KEY = 'playground:lang';

/** The program being edited, as kept between visits. */
export type Program = Shared;

export function parseDraft(raw: string | null): Program | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { code, input } = value as Record<string, unknown>;
    return typeof code === 'string' && typeof input === 'string' ? { code, input } : null;
  } catch {
    return null;
  }
}

export interface Start {
  /** `null` when there is nothing to restore, so the sample stays. */
  program: Program | null;
  /** The saved draft that a shared program replaced, kept for undo. */
  replaced: Program | null;
  badLink: boolean;
}

/** A shared link wins over the saved draft, which wins over the sample. */
export function startingProgram(hash: string, draft: Program | null): Start {
  const shared = decodeShare(hash);
  if (!shared) {
    const badLink = new URLSearchParams(hash.slice(1)).has('code');
    return { program: draft, replaced: null, badLink };
  }
  const differs = draft && (draft.code !== shared.code || draft.input !== shared.input);
  return { program: shared, replaced: differs ? draft : null, badLink: false };
}

/** Storage can be blocked, in which case nothing is kept. */
export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function store(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The choice then lasts for this visit only.
  }
}
