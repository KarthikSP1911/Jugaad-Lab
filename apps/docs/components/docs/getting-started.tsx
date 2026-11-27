import Link from 'next/link';
import { EXAMPLES } from '../../lib/examples';
import { localize, type Locale } from '../../lib/i18n/locales';
import { STRINGS } from '../../lib/i18n/strings';
import { SITE } from '../../lib/site';
import { CodeBlock, ShellBlock } from '../code';
import { Rich } from './rich';

export function GettingStarted({ locale }: { locale: Locale }) {
  const { nav, start } = STRINGS[locale];
  const next = (['tour', 'cheatsheet', 'reference', 'errors'] as const).map((page) => ({
    page,
    href: localize(`/docs/${page}`, locale),
  }));
  return (
    <article className="prose max-w-3xl">
      <h1>{nav.start}</h1>
      <p>{start.intro}</p>
      <div className="notice">
        <Rich text={start.notice} />
      </div>

      <h2>{start.firstProgram}</h2>
      <CodeBlock source={EXAMPLES[0].code} />
      <p>
        {start.tryIt.before}
        <Link href="/playground">{start.tryIt.link}</Link>
        {start.tryIt.after}
      </p>

      <h2>{start.runLocal}</h2>
      <p>{start.needs}</p>
      <ShellBlock
        source={`git clone ${SITE.repository}.git
cd Jugaad-Lab
npm ci
npm run build
node packages/cli/dist/main.js run examples/hello.hing
node packages/cli/dist/main.js check examples/fizzbuzz.hing --lang=en
node packages/cli/dist/main.js          # REPL`}
      />

      <h2>{start.nextSteps}</h2>
      <ul>
        {next.map(({ page, href }) => (
          <li key={page}>
            <Link href={href}>{nav[page]}</Link>: {start.next[page]}
          </li>
        ))}
      </ul>
    </article>
  );
}
