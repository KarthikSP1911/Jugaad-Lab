import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '../../../components/code';
import { EXAMPLES } from '../../../lib/examples';
import { encodeShare } from '../../../lib/share';

export const metadata: Metadata = { title: 'Language tour' };

export default function Tour() {
  return (
    <article className="prose max-w-3xl">
      <h1>Language tour</h1>
      <p>Short examples, each of which you can run and change in the playground.</p>
      {EXAMPLES.map(({ id, title, summary, code, input }) => (
        <section key={id}>
          <h2 id={id}>{title}</h2>
          <p>{summary}</p>
          <CodeBlock source={code} />
          <p>
            <Link href={`/playground${encodeShare(code, input)}`} className="button">
              Open in playground
            </Link>
          </p>
        </section>
      ))}
    </article>
  );
}
