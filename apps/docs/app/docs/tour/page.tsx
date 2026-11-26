import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../../components/code';
import { Reveal } from '../../../components/motion';
import { EXAMPLES, type Example } from '../../../lib/examples';
import { execute } from '../../../lib/execute';
import { encodeShare } from '../../../lib/share';

export const metadata: Metadata = { title: 'Language tour' };

/** Runs the example while the page is built, so the shown output is real. */
function outputOf({ code, input }: Example): string {
  let output = '';
  const options = { lang: 'hi' as const, ...(input ? { input } : {}) };
  const { message } = execute(code, (text) => (output += text), options);
  return `${output}${message}`.trimEnd();
}

export default function Tour() {
  return (
    <article className="prose max-w-3xl">
      <h1>Language tour</h1>
      <p>Short examples with their output. Run and change any of them in the playground.</p>
      {EXAMPLES.map((example) => (
        <Reveal key={example.id}>
          <h2 id={example.id}>{example.title}</h2>
          <p>{example.summary}</p>
          <CodeBlock source={example.code} />
          <ShellBlock title="Output" source={outputOf(example)} />
          <p>
            <Link
              href={`/playground${encodeShare(example.code, example.input)}`}
              className="button"
            >
              Open in playground →
            </Link>
          </p>
        </Reveal>
      ))}
    </article>
  );
}
