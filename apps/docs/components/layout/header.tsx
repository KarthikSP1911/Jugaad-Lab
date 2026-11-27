import Link from 'next/link';
import { DICTIONARIES, localePath, type Locale } from '../../lib/i18n';
import { searchIndex } from '../../lib/search/search-index';
import { mainNav, SITE } from '../../lib/config/site';
import { LanguageSwitch } from '../ui/language-switch';
import { Logo } from './logo';
import { Menu } from './menu';
import { NavLinks } from './nav-links';
import { Search } from '../search/search';
import { SoundToggle } from '../mascot/sound';
import { ThemeToggle } from '../ui/theme-toggle';

export function Header({ locale }: { locale: Locale }) {
  const t = DICTIONARIES[locale];
  return (
    <header className="site-header">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-2 px-4">
        <Link href={localePath(locale, '/')} className="brand">
          <Logo size={32} />
          <span>
            Jugaad <span className="text-accent">Hinglish</span>
          </span>
        </Link>
        <Menu>
          <nav aria-label={t.nav.main} className="flex flex-col gap-1 md:flex-row">
            <NavLinks items={mainNav(locale, t)} group="main" nested />
          </nav>
          <div className="flex items-center gap-1 md:ml-auto">
            <a href={SITE.repository} className="nav-link">
              GitHub
            </a>
            <LanguageSwitch />
            <SoundToggle />
          </div>
        </Menu>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Search entries={searchIndex(locale)} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
