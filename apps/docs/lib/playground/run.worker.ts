import { execute } from './execute';
import type { RunRequest, WorkerMessage } from './run-protocol';

const send = (message: WorkerMessage) => self.postMessage(message);

self.onmessage = ({ data }: MessageEvent<RunRequest>) => {
  const { source, ...options } = data;
  const result = execute(source, (text) => send({ type: 'output', text }), options);
  send({ type: 'done', result });
};
