import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../components/code';
import { EXAMPLES } from '../../lib/examples';
import { SITE } from '../../lib/site';

export const metadata: Metadata = { title: 'Getting started' };

export default function GettingStarted() {
  return (
    <article className="prose max-w-3xl">
      <h1>Getting started</h1>
      <p>{SITE.tagline} It is a TypeScript tree-walking interpreter.</p>
      <div className="notice">
        This is version 0.1.0. The name, the <code>.hing</code> extension and the keyword spellings
        may still change.
      </div>

      <h2>Your first program</h2>
      <CodeBlock source={EXAMPLES[0].code} />
      <p>
        Open the <Link href="/playground">playground</Link>, type the line above and press Run.
      </p>

      <h2>Run it on your computer</h2>
      <p>You need Node 24 and Git.</p>
      <ShellBlock
        source={`git clone ${SITE.repository}.git
cd Jugaad-Lab
npm ci
npm run build
node packages/cli/dist/main.js run examples/hello.hing
node packages/cli/dist/main.js check examples/fizzbuzz.hing --lang=en
node packages/cli/dist/main.js          # REPL`}
      />

      <h2>Next steps</h2>
      <ul>
        <li>
          <Link href="/docs/tour">Language tour</Link>: short examples you can run.
        </li>
        <li>
          <Link href="/docs/cheatsheet">Cheatsheet</Link>: keywords and built-ins on one page.
        </li>
        <li>
          <Link href="/docs/reference">Reference</Link>: keywords, types, operators and grammar.
        </li>
        <li>
          <Link href="/docs/errors">Error codes</Link>: what each code means.
        </li>
      </ul>
    </article>
  );
}
