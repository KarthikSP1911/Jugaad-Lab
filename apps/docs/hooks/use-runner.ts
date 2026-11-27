'use client';

import type { Bilingual, DiagnosticCode } from '@jugaad-hinglish/core';
import { useEffect, useRef, useState } from 'react';
import { useSound } from '../components/mascot/sound';
import { everyLanguage, MESSAGES, say, type Messages } from '../lib/i18n/bilingual';
import { REACTIONS, type Status } from '../lib/mascot/mascot';
import type { Marker } from '../lib/playground/execute';
import type { Program } from '../lib/playground/draft';
import type { RunRequest, WorkerMessage } from '../lib/playground/run-protocol';

const TIMEOUT_MS = 5_000;

/** What the last run left behind, besides its output. */
export interface Report {
  messages: Messages | null;
  markers: Marker[];
  code?: DiagnosticCode;
  inputRanOut: boolean;
}

const EMPTY: Report = { messages: null, markers: [], inputRanOut: false };

/** Runs programs in a Web Worker, one at a time. */
export function useRunner() {
  const [output, setOutput] = useState('');
  const [report, setReport] = useState<Report>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [runs, setRuns] = useState(0);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const buffer = useRef('');
  const frame = useRef(0);
  const { play } = useSound();

  function react(next: Status) {
    setStatus(next);
    const { sound } = REACTIONS[next];
    if (sound) play(sound);
  }

  /** Output arrives in many small writes; show them once per frame. */
  function flush() {
    window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    const text = buffer.current;
    buffer.current = '';
    if (text) setOutput((previous) => previous + text);
  }

  function dispose() {
    window.clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
    flush();
  }

  function stop(reason: Bilingual = MESSAGES.stopped) {
    dispose();
    react('stopped');
    setReport({ ...EMPTY, messages: everyLanguage((language) => say(reason, language)) });
  }

  /** Ends any run and empties the output. */
  function clear() {
    dispose();
    setOutput('');
    setReport(EMPTY);
    setStatus('idle');
  }

  function start({ code, input }: Program) {
    clear();
    setRuns((count) => count + 1);
    react('running');
    const next = new Worker(new URL('../lib/playground/run.worker.ts', import.meta.url));
    next.onmessage = ({ data }: MessageEvent<WorkerMessage>) => {
      if (data.type === 'output') {
        buffer.current += data.text;
        frame.current ||= window.requestAnimationFrame(flush);
        return;
      }
      dispose();
      const { result } = data;
      setReport({
        messages: result.messages ?? null,
        markers: result.markers,
        inputRanOut: result.inputRanOut,
        ...(result.code ? { code: result.code } : {}),
      });
      react(result.outcome);
    };
    next.onerror = () => stop(MESSAGES.notStarted);
    worker.current = next;
    timer.current = window.setTimeout(() => stop(MESSAGES.timedOut), TIMEOUT_MS);
    const request: RunRequest = { source: code, input };
    next.postMessage(request);
  }

  /** Forgets error positions, which no longer match edited code. */
  function dropMarkers() {
    setReport((last) => (last.markers.length > 0 ? { ...last, markers: [] } : last));
  }

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.cancelAnimationFrame(frame.current);
      worker.current?.terminate();
    },
    [],
  );

  return { output, report, status, runs, start, stop, clear, dropMarkers };
}
