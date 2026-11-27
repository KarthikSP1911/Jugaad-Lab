import Link from 'next/link';
import { DEMOS } from '../../lib/content/home';
import type { Dictionary } from '../../lib/i18n';
import { localePath, type Locale } from '../../lib/i18n/locales';
import { CodeBlock } from '../ui/code';
import { Section } from './section';

export function QuickStart({ locale, t }: { locale: Locale; t: Dictionary }) {
  const text = t.home.start;
  /** In the order of the steps; the middle one shows a snippet instead. */
  const links = [
    { href: '/playground', label: text.openPlayground },
    null,
    { href: '/docs', label: text.openDocs },
  ] as const;
  return (
    <Section id="start" title={text.title} subtitle={text.subtitle} tinted>
      <ol className="steps">
        {text.steps.map(({ title, body }, index) => {
          const link = links[index];
          return (
            <li key={title} className="home-card">
              <span className="step-number" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
              {link ? (
                <Link className="link card-action" href={localePath(locale, link.href)}>
                  {link.label}
                </Link>
              ) : (
                <CodeBlock source={DEMOS[locale].hello} />
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
