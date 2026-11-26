import Link from 'next/link';
import { searchIndex } from '../lib/search-index';
import { NAV, SITE } from '../lib/site';
import { Logo } from './logo';
import { NavLinks } from './nav-links';
import { Search } from './search';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo size={36} />
          <span className="text-lg">
            Jugaad <span className="text-accent">Hinglish</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:order-2">
          <Search entries={searchIndex()} />
          <a href={SITE.repository} className="nav-link">
            GitHub
          </a>
          <ThemeToggle />
        </div>
        <nav aria-label="Main" className="flex w-full gap-1 pt-1 sm:w-auto sm:pt-0">
          <NavLinks items={NAV} group="main" nested />
        </nav>
      </div>
    </header>
  );
}
