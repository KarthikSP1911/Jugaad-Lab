import Link from 'next/link';
import type { Dictionary } from '../../lib/i18n';
import { localePath, type Locale } from '../../lib/i18n/locales';
import { Section } from './section';

/** In the order of the cards: students, teachers, fun projects. */
const PAGES = ['/docs', '/docs/cheatsheet', '/docs/tour'] as const;

export function LearningPaths({ locale, t }: { locale: Locale; t: Dictionary }) {
  const text = t.home.paths;
  return (
    <Section id="paths" title={text.title} subtitle={text.subtitle}>
      <ul className="feature-grid">
        {text.items.map(({ title, body, action }, index) => (
          <li key={title}>
            <Link
              className="home-card path-card"
              href={localePath(locale, PAGES[index] ?? '/docs')}
            >
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="card-action">{action} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
