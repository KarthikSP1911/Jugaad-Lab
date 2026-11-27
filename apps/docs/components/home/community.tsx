import Link from 'next/link';
import { SITE } from '../../lib/config/site';
import { STATUS } from '../../lib/content/status';
import type { Dictionary } from '../../lib/i18n';
import { localePath, type Locale } from '../../lib/i18n/locales';
import { Section } from './section';

export function Community({ locale, t }: { locale: Locale; t: Dictionary }) {
  const text = t.home.community;
  /** In the order of the cards: star, contribute, issues, share. */
  const links = [
    SITE.repository,
    `${SITE.repository}/blob/main/CONTRIBUTING.md`,
    `${SITE.repository}/issues`,
    localePath(locale, '/playground'),
  ];
  const status = [
    { title: text.inVersion, items: STATUS[locale].works, mark: '✓' },
    { title: text.notIn, items: STATUS[locale].notYet, mark: '–' },
  ];
  return (
    <Section id="community" title={text.title} subtitle={text.subtitle} tinted>
      <ul className="community-grid">
        {text.items.map(({ title, body, action }, index) => (
          <li key={title}>
            <Link className="home-card path-card" href={links[index] ?? SITE.repository}>
              <h3>{title}</h3>
              <p>{body}</p>
              <span className="card-action">{action} →</span>
            </Link>
          </li>
        ))}
      </ul>
      <details className="status-details">
        <summary>{text.status}</summary>
        <div>
          {status.map(({ title, items, mark }) => (
            <div key={title}>
              <h3>{title}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">{mark}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </Section>
  );
}
