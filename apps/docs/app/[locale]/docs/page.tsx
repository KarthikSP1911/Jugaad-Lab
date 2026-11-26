import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../../components/code';
import { examples } from '../../../lib/examples';
import { localePath } from '../../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../../lib/i18n/page';
import { SITE } from '../../../lib/site';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.start.title };
}

export default async function GettingStarted(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  const { start, docsNav } = t;
  const to = (href: string) => localePath(locale, href);
  const next = [
    { href: '/docs/tour', label: docsNav.tour, about: start.tourAbout },
    { href: '/docs/cheatsheet', label: docsNav.cheatsheet, about: start.cheatsheetAbout },
    { href: '/docs/reference', label: docsNav.reference, about: start.referenceAbout },
    { href: '/docs/errors', label: docsNav.errors, about: start.errorsAbout },
  ];
  return (
    <article className="prose max-w-3xl">
      <h1>{start.title}</h1>
      <p>
        {t.tagline} {start.interpreter}
      </p>
      <div className="notice">
        {start.noticeStart}
        <code>.hing</code>
        {start.noticeEnd}
      </div>

      <h2>{start.firstProgram}</h2>
      <CodeBlock source={examples(locale)[0].code} />
      <p>
        {start.openStart}
        <Link href={to('/playground')}>{start.openLink}</Link>
        {start.openEnd}
      </p>

      <h2>{start.runLocally}</h2>
      <p>{start.requirements}</p>
      <ShellBlock
        title={t.code.terminal}
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
        {next.map(({ href, label, about }) => (
          <li key={href}>
            <Link href={to(href)}>{label}</Link>: {about}
          </li>
        ))}
      </ul>
    </article>
  );
}
