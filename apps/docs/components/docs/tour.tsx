import Link from 'next/link';
import { EXAMPLES, type Example } from '../../lib/examples';
import { execute } from '../../lib/execute';
import type { Locale } from '../../lib/i18n/locales';
import { STRINGS, type ExampleId } from '../../lib/i18n/strings';
import { encodeShare } from '../../lib/share';
import { CodeBlock, ShellBlock } from '../code';
import { Reveal } from '../motion';

/** Runs the example while the page is built, so the shown output is real. */
function outputOf({ code, input }: Example): string {
  let output = '';
  const options = { lang: 'hi' as const, ...(input ? { input } : {}) };
  const { message } = execute(code, (text) => (output += text), options);
  return `${output}${message}`.trimEnd();
}

export function Tour({ locale }: { locale: Locale }) {
  const { nav, tour, examples } = STRINGS[locale];
  return (
    <article className="prose max-w-3xl">
      <h1>{nav.tour}</h1>
      <p>{tour.intro}</p>
      {EXAMPLES.map((example) => {
        const text = examples[example.id as ExampleId];
        return (
          <Reveal key={example.id}>
            <h2 id={example.id}>{text.title}</h2>
            <p>{text.summary}</p>
            <CodeBlock source={example.code} />
            <ShellBlock title={tour.output} source={outputOf(example)} />
            <p>
              <Link
                href={`/playground${encodeShare(example.code, example.input)}`}
                className="button"
              >
                {tour.open}
              </Link>
            </p>
          </Reveal>
        );
      })}
    </article>
  );
}
