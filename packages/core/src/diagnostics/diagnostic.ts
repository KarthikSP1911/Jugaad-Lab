import type { DiagnosticCode } from './codes.js';
import type { Span } from './span.js';

export interface Bilingual {
  hi: string;
  /** Hindi in Devanagari. */
  deva: string;
  en: string;
}

export interface Diagnostic {
  code: DiagnosticCode;
  severity: 'error' | 'warning';
  message: Bilingual;
  span: Span;
  file: string;
  hint?: Bilingual;
}

/** A diagnostic before it is tied to a place in a file. */
export type DiagnosticDraft = Pick<Diagnostic, 'code' | 'message' | 'hint'>;

export const MAX_DIAGNOSTICS = 20;
export const DEFAULT_FILE = '<input>';

/** Collects the diagnostics of one stage of one run, up to `MAX_DIAGNOSTICS`. */
export class DiagnosticBag {
  readonly items: Diagnostic[] = [];

  constructor(private readonly file: string) {}

  get full(): boolean {
    return this.items.length >= MAX_DIAGNOSTICS;
  }

  report(draft: DiagnosticDraft, span: Span): void {
    if (this.full) return;
    this.items.push({ ...draft, severity: 'error', span, file: this.file });
  }
}

/** Raises a program error at a location the receiver already knows. */
export type Fail = (draft: DiagnosticDraft) => never;
