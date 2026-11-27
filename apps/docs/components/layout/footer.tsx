import { VERSION } from '@jugaad-hinglish/core';
import Link from 'next/link';
import { DICTIONARIES, localePath, type Locale } from '../../lib/i18n';
import { docsNav, SITE } from '../../lib/config/site';
import { Logo } from './logo';

export function Footer({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  const pages = docsNav(locale, t);
  const playground = { href: localePath(locale, '/playground'), label: t.nav.playground };
  const columns = [
    { title: t.footer.learn, links: [...pages.slice(0, 2), playground] },
    { title: t.footer.lookUp, links: pages.slice(2) },
    { title: t.footer.project, links: [{ href: SITE.repository, label: t.footer.source }] },
  ];
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex items-start gap-3">
          <Logo size={36} />
          <p className="max-w-64 text-muted">
            <span className="block font-semibold text-ink">{SITE.name}</span>
            {t.tagline} {t.footer.workingName} · {t.footer.version} {VERSION}
          </p>
        </div>
        {columns.map(({ title, links }) => (
          <nav key={title} aria-label={title}>
            <p className="eyebrow">{title}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-muted hover:text-ink hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
