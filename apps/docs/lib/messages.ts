import type { Lang } from '@jugaad-hinglish/core';
import type { ExecuteResult } from './execute';

export interface RunRequest {
  source: string;
  input: string;
  lang?: Lang;
}

export type WorkerMessage =
  | { type: 'output'; text: string }
  | { type: 'done'; result: ExecuteResult };
