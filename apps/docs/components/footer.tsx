import { VERSION } from '@jugaad-hinglish/core';
import { DICTIONARIES, type Locale } from '../lib/i18n';
import { SITE } from '../lib/site';
import { Logo } from './logo';

export function Footer({ locale }: { locale: Locale }) {
  const { footer } = DICTIONARIES[locale];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-8 text-sm text-muted">
        <Logo size={28} />
        <p>
          {SITE.name} {footer.workingName} · {footer.version} {VERSION}
        </p>
        <a href={SITE.repository} className="link sm:ml-auto">
          {footer.source}
        </a>
      </div>
    </footer>
  );
}
