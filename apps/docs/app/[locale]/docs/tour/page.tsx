import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../../../components/ui/code';
import { Reveal } from '../../../../components/ui/motion';
import { examples, type Example } from '../../../../lib/content/examples';
import { execute } from '../../../../lib/playground/execute';
import { ERROR_LANG, localePath, type Locale } from '../../../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../../../lib/i18n/page';
import { encodeShare } from '../../../../lib/playground/share';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.docsNav.tour };
}

/** Runs the example while the page is built, so the shown output is real. */
function outputOf({ code, input }: Example, locale: Locale): string {
  let output = '';
  const options = { lang: ERROR_LANG[locale], ...(input ? { input } : {}) };
  const { message } = execute(code, (text) => (output += text), options);
  return `${output}${message}`.trimEnd();
}

export default async function Tour(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  return (
    <article className="prose max-w-3xl">
      <h1>{t.docsNav.tour}</h1>
      <p>{t.tour.intro}</p>
      {examples(locale).map((example) => (
        <Reveal key={example.id}>
          <h2 id={example.id}>{example.title}</h2>
          <p>{example.summary}</p>
          <CodeBlock source={example.code} />
          <ShellBlock title={t.code.output} source={outputOf(example, locale)} />
          <p>
            <Link
              href={`${localePath(locale, '/playground')}${encodeShare(example.code, example.input)}`}
              className="button"
            >
              {t.tour.open}
            </Link>
          </p>
        </Reveal>
      ))}
    </article>
  );
}
