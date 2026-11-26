import type { Metadata } from 'next';
import { Playground } from '../../components/playground';

export const metadata: Metadata = { title: 'Playground' };

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-brand">Playground</h1>
      <p className="mt-1 mb-4 text-sm text-muted">
        Your program runs in this browser and is not sent to a server.
      </p>
      <Playground />
    </div>
  );
}
