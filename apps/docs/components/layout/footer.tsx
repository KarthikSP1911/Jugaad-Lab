import { VERSION } from '@jugaad-hinglish/core';
import Link from 'next/link';
import { docsNav, SITE } from '../../lib/config/site';
import { DICTIONARIES, localePath, type Locale } from '../../lib/i18n';
import { LanguageSwitch } from '../ui/language-switch';
import { Logo } from './logo';

export function Footer({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  const pages = docsNav(locale, t);
  const playground = { href: localePath(locale, '/playground'), label: t.nav.playground };
  const file = (path: string) => `${SITE.repository}/blob/main/${path}`;
  const columns = [
    { title: t.footer.learn, links: [...pages.slice(0, 2), playground] },
    { title: t.footer.lookUp, links: pages.slice(2) },
    {
      title: t.footer.project,
      links: [
        { href: SITE.repository, label: t.footer.source },
        { href: `${SITE.repository}/issues`, label: t.footer.issues },
        { href: file('NOTICE'), label: t.footer.notices },
      ],
    },
  ];
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo size={32} />
            <p>
              <strong>{SITE.name}</strong>
              {t.tagline}
            </p>
            <LanguageSwitch />
          </div>
          {columns.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <p className="eyebrow">{title}</p>
              <ul>
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-fine">
          <p>{t.footer.licence}</p>
          <p>
            {t.footer.credits} {t.footer.workingName} · {t.footer.version} {VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
}
